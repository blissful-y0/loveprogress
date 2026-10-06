import { NextResponse } from "next/server";

import { isErrorResponse, requireRole } from "@/lib/auth-guard";
import { revalidateBoothPages, updateBooth } from "@/lib/booth-mutations";
import { rateLimit } from "@/lib/rate-limit";
import { boothPromoSchema, toPromoBoothWrite } from "@/lib/schemas/booth-schema";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  BoothKeywordRow,
  BoothParticipantRow,
  BoothRow,
} from "@/types/database";
import type { BoothWithDetails } from "@/types/booth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/** Columns to select from booths table (excludes password_last4) */
const BOOTH_PUBLIC_COLUMNS =
  "id, name, thumbnail_image_key, hover_image_key, age_type, row_label, col_no, info_url, user_id, created_at, updated_at";

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: booth, error: boothError } = (await (
      supabase.from("booths") as any
    )
      .select(BOOTH_PUBLIC_COLUMNS)
      .eq("id", id)
      .single()) as { data: BoothRow | null; error: unknown };

    if (boothError || !booth) {
      return NextResponse.json(
        { error: "부스를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [keywordsResult, participantsResult] = (await Promise.all([
      (supabase.from("booth_keywords") as any)
        .select("*")
        .eq("booth_id", id),
      (supabase.from("booth_participants") as any)
        .select("*")
        .eq("booth_id", id)
        .order("role_order", { ascending: true }),
    ])) as [
      { data: BoothKeywordRow[] | null; error: unknown },
      { data: BoothParticipantRow[] | null; error: unknown },
    ];

    if (keywordsResult.error || participantsResult.error) {
      return NextResponse.json(
        { error: "부스 상세 정보를 불러올 수 없습니다." },
        { status: 500 },
      );
    }

    const boothWithDetails: BoothWithDetails = {
      ...booth,
      keywords: keywordsResult.data ?? [],
      participants: participantsResult.data ?? [],
    };

    return NextResponse.json({ booth: boothWithDetails });
  } catch {
    return NextResponse.json(
      { error: "부스를 불러올 수 없습니다." },
      { status: 500 },
    );
  }
}

const BOOTH_WRITER_ROLES = ["booth_member", "admin"] as const;

/** 부스홍보게시판 수정: 담당 부스어 본인 또는 관리자만 */
export async function PATCH(request: Request, { params }: RouteContext) {
  const rateLimitResponse = await rateLimit(request, "booth-promo-write", { maxRequests: 10, windowMs: 60_000 });
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await requireRole(BOOTH_WRITER_ROLES);
  if (isErrorResponse(auth)) return auth;

  try {
    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: booth } = await supabaseAdmin
      .from("booths")
      .select("user_id")
      .eq("id", id)
      .maybeSingle<{ user_id: string | null }>();

    if (!booth) {
      return NextResponse.json({ error: "부스를 찾을 수 없습니다." }, { status: 404 });
    }
    if (auth.role !== "admin" && booth.user_id !== auth.userId) {
      return NextResponse.json({ error: "본인 부스만 수정할 수 있습니다." }, { status: 403 });
    }

    const parsed = boothPromoSchema.safeParse(await request.json());
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const result = await updateBooth(supabaseAdmin, id, toPromoBoothWrite(parsed.data));
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    revalidateBoothPages();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "부스 수정에 실패했습니다." }, { status: 500 });
  }
}
