import { NextResponse } from "next/server";

import { isAdminError, verifyAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { boothBaseSchema } from "@/lib/schemas/booth-schema";
import type { BoothKeywordRow, BoothParticipantRow, BoothRow } from "@/types/database";

interface AdminBoothRow extends BoothRow {
  password_last4: string | null;
  keywords: BoothKeywordRow[];
  participants: BoothParticipantRow[];
}

export async function GET() {
  try {
    const adminResult = await verifyAdmin();
    if (isAdminError(adminResult)) return adminResult;

    const supabaseAdmin = getSupabaseAdmin();

    const { data: booths, error: boothError } = (await supabaseAdmin
      .from("booths")
      .select("id, name, password_last4, thumbnail_image_key, hover_image_key, age_type, created_at, updated_at")
      .order("created_at", { ascending: true })) as { data: BoothRow[] | null; error: unknown };

    if (boothError || !booths) {
      return NextResponse.json({ error: "부스 목록을 불러올 수 없습니다." }, { status: 500 });
    }

    if (booths.length === 0) {
      return NextResponse.json({ booths: [] });
    }

    const boothIds = booths.map((b) => b.id);

    const [keywordsResult, participantsResult] = (await Promise.all([
      supabaseAdmin.from("booth_keywords").select("*").in("booth_id", boothIds),
      supabaseAdmin.from("booth_participants").select("*").in("booth_id", boothIds).order("role_order", { ascending: true }),
    ])) as [
      { data: BoothKeywordRow[] | null; error: unknown },
      { data: BoothParticipantRow[] | null; error: unknown },
    ];

    if (keywordsResult.error || participantsResult.error) {
      return NextResponse.json({ error: "부스 상세 정보를 불러올 수 없습니다." }, { status: 500 });
    }

    const keywordsByBooth = new Map<string, BoothKeywordRow[]>();
    for (const kw of keywordsResult.data ?? []) {
      const list = keywordsByBooth.get(kw.booth_id) ?? [];
      list.push(kw);
      keywordsByBooth.set(kw.booth_id, list);
    }

    const participantsByBooth = new Map<string, BoothParticipantRow[]>();
    for (const p of participantsResult.data ?? []) {
      const list = participantsByBooth.get(p.booth_id) ?? [];
      list.push(p);
      participantsByBooth.set(p.booth_id, list);
    }

    const result: AdminBoothRow[] = booths.map((booth) => ({
      ...booth,
      keywords: keywordsByBooth.get(booth.id) ?? [],
      participants: participantsByBooth.get(booth.id) ?? [],
    }));

    return NextResponse.json({ booths: result });
  } catch {
    return NextResponse.json({ error: "부스 목록을 불러올 수 없습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminResult = await verifyAdmin();
    if (isAdminError(adminResult)) return adminResult;

    const body = await request.json();
    const parsed = boothBaseSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      name,
      passwordLast4,
      thumbnailImageKey,
      hoverImageKey,
      ageType,
      keywords,
      owner,
      participants,
    } = parsed.data;

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Insert booth
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: booth, error: boothError } = await (
      supabaseAdmin.from("booths") as any
    )
      .insert({
        name,
        password_last4: passwordLast4 ?? null,
        thumbnail_image_key: thumbnailImageKey,
        hover_image_key: hoverImageKey ?? null,
        age_type: ageType,
      })
      .select("id")
      .single();

    if (boothError || !booth) {
      return NextResponse.json(
        { error: "부스 등록에 실패했습니다." },
        { status: 500 },
      );
    }

    const boothId = (booth as { id: string }).id;

    // 2. Insert keywords
    const keywordRows = keywords.map((keyword) => ({
      booth_id: boothId,
      keyword,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: kwError } = await (
      supabaseAdmin.from("booth_keywords") as any
    ).insert(keywordRows);

    if (kwError) {
      // Rollback: delete booth
      await supabaseAdmin.from("booths").delete().eq("id", boothId);
      return NextResponse.json(
        { error: "키워드 등록에 실패했습니다." },
        { status: 500 },
      );
    }

    // 3. Insert participants (owner at role_order 0, others start at 1)
    const participantRows = [
      { booth_id: boothId, name: owner.name, sns_url: owner.snsUrl ?? null, role_order: 0 },
      ...participants.map((p, i) => ({
        booth_id: boothId,
        name: p.name,
        sns_url: p.snsUrl ?? null,
        role_order: i + 1,
      })),
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: partError } = await (
      supabaseAdmin.from("booth_participants") as any
    ).insert(participantRows);

    if (partError) {
      // Rollback: delete booth (cascade should remove keywords)
      await supabaseAdmin.from("booths").delete().eq("id", boothId);
      return NextResponse.json(
        { error: "참여자 등록에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, boothId });
  } catch {
    return NextResponse.json(
      { error: "부스 등록에 실패했습니다." },
      { status: 500 },
    );
  }
}
