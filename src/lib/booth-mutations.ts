import { revalidatePath } from "next/cache";

import type { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BoothKeywordRow, BoothParticipantRow } from "@/types/database";

type AdminClient = ReturnType<typeof getSupabaseAdmin>;

interface ParticipantInput {
  readonly name: string;
  readonly snsUrl?: string;
}

/** booths 행에 쓸 컬럼 + 키워드/참여자 */
export interface BoothWriteInput {
  readonly columns: Readonly<Record<string, unknown>>;
  readonly keywords: readonly string[];
  readonly owner: ParticipantInput;
  readonly participants: readonly ParticipantInput[];
}

export type BoothMutationResult =
  | { readonly ok: true; readonly boothId: string }
  | { readonly ok: false; readonly status: number; readonly error: string };

function fail(status: number, error: string): BoothMutationResult {
  return { ok: false, status, error };
}

/** booths 쓰기 오류 → 사용자용 메시지 (칸 중복은 409) */
function boothWriteError(error: { code?: string } | null, fallback: string): BoothMutationResult {
  if (error?.code === "23505") return fail(409, "이미 다른 부스가 등록된 위치입니다.");
  if (error?.code === "23503") return fail(400, "존재하지 않는 계정입니다.");
  if (error?.code === "23514") return fail(400, "존재하지 않는 부스 위치입니다.");
  return fail(500, fallback);
}

function participantRows(boothId: string, input: BoothWriteInput) {
  return [
    { booth_id: boothId, name: input.owner.name, sns_url: input.owner.snsUrl ?? null, role_order: 0 },
    ...input.participants.map((p, i) => ({
      booth_id: boothId,
      name: p.name,
      sns_url: p.snsUrl ?? null,
      role_order: i + 1,
    })),
  ];
}

export async function createBooth(
  supabaseAdmin: AdminClient,
  input: BoothWriteInput,
): Promise<BoothMutationResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booth, error: boothError } = await (supabaseAdmin.from("booths") as any)
    .insert(input.columns)
    .select("id")
    .single();

  if (boothError || !booth) return boothWriteError(boothError, "부스 등록에 실패했습니다.");

  const boothId = (booth as { id: string }).id;
  const rollback = () => supabaseAdmin.from("booths").delete().eq("id", boothId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: kwError } = await (supabaseAdmin.from("booth_keywords") as any).insert(
    input.keywords.map((keyword) => ({ booth_id: boothId, keyword })),
  );
  if (kwError) {
    await rollback();
    return fail(500, "키워드 등록에 실패했습니다.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: partError } = await (supabaseAdmin.from("booth_participants") as any).insert(
    participantRows(boothId, input),
  );
  if (partError) {
    await rollback();
    return fail(500, "참여자 등록에 실패했습니다.");
  }

  return { ok: true, boothId };
}

export async function updateBooth(
  supabaseAdmin: AdminClient,
  id: string,
  input: BoothWriteInput,
): Promise<BoothMutationResult> {
  // 롤백용으로 바꿀 컬럼의 이전 값과 키워드·참여자를 저장
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: oldBooth } = (await (supabaseAdmin.from("booths") as any)
    .select(Object.keys(input.columns).join(", "))
    .eq("id", id)
    .single()) as { data: Record<string, unknown> | null };

  if (!oldBooth) return fail(404, "부스를 찾을 수 없습니다.");

  const [{ data: oldKeywords }, { data: oldParticipants }] = (await Promise.all([
    supabaseAdmin.from("booth_keywords").select("*").eq("booth_id", id),
    supabaseAdmin.from("booth_participants").select("*").eq("booth_id", id),
  ])) as [{ data: BoothKeywordRow[] | null }, { data: BoothParticipantRow[] | null }];

  const rollbackBooth = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabaseAdmin.from("booths") as any).update(oldBooth).eq("id", id);
  };

  const rollbackKeywords = async () => {
    await supabaseAdmin.from("booth_keywords").delete().eq("booth_id", id);
    if (oldKeywords && oldKeywords.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin.from("booth_keywords") as any).insert(
        oldKeywords.map((kw) => ({ booth_id: kw.booth_id, keyword: kw.keyword })),
      );
    }
  };

  // 1. booths 행
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: boothError } = await (supabaseAdmin.from("booths") as any)
    .update(input.columns)
    .eq("id", id);
  if (boothError) return boothWriteError(boothError, "부스 수정에 실패했습니다.");

  // 2. 키워드 교체
  await supabaseAdmin.from("booth_keywords").delete().eq("booth_id", id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: kwError } = await (supabaseAdmin.from("booth_keywords") as any).insert(
    input.keywords.map((keyword) => ({ booth_id: id, keyword })),
  );
  if (kwError) {
    await rollbackKeywords();
    await rollbackBooth();
    return fail(500, "키워드 수정에 실패했습니다.");
  }

  // 3. 참여자 교체
  await supabaseAdmin.from("booth_participants").delete().eq("booth_id", id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: partError } = await (supabaseAdmin.from("booth_participants") as any).insert(
    participantRows(id, input),
  );
  if (partError) {
    if (oldParticipants && oldParticipants.length > 0) {
      await supabaseAdmin.from("booth_participants").delete().eq("booth_id", id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin.from("booth_participants") as any).insert(
        oldParticipants.map((p) => ({
          booth_id: p.booth_id,
          name: p.name,
          sns_url: p.sns_url,
          role_order: p.role_order,
        })),
      );
    }
    await rollbackKeywords();
    await rollbackBooth();
    return fail(500, "참여자 수정에 실패했습니다.");
  }

  return { ok: true, boothId: id };
}

/** 부스 데이터를 보여주는 공개 페이지 캐시 갱신 */
export function revalidateBoothPages() {
  revalidatePath("/booths");
  revalidatePath("/booth-promo");
}
