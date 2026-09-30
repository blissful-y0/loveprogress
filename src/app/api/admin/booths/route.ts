import { NextResponse } from "next/server";

import { isAdminError, verifyAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { adminPromotionSchema } from "@/lib/schemas/promotion-schema";
import { fetchBoothsWithDetails } from "@/lib/queries/booth-queries";

export async function GET() {
  try {
    const adminResult = await verifyAdmin();
    if (isAdminError(adminResult)) return adminResult;

    const supabaseAdmin = getSupabaseAdmin();
    const { data: booths, error } = await fetchBoothsWithDetails(supabaseAdmin, {
      ascending: true,
      includePasswordLast4: true,
      includePromotion: true,
    });

    if (error || !booths) {
      return NextResponse.json({ error: "부스 목록을 불러올 수 없습니다." }, { status: 500 });
    }

    return NextResponse.json({ booths });
  } catch {
    return NextResponse.json({ error: "부스 목록을 불러올 수 없습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminResult = await verifyAdmin();
    if (isAdminError(adminResult)) return adminResult;

    const body = await request.json();
    const parsed = adminPromotionSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      name,
      rowLabel, columnNumber, infoUrl, authorUserId,
      passwordLast4,
      thumbnailImageKey,
      hoverImageKey,
      ageType,
      keywords,
      owner,
      participants,
    } = parsed.data;

    const supabaseAdmin = getSupabaseAdmin();
    if (authorUserId) {
      const { data: author } = await supabaseAdmin.from("users").select("id").eq("id", authorUserId).in("role", ["booth_member", "admin"]).maybeSingle();
      if (!author) return NextResponse.json({error:"부스어 계정 ID를 확인해주세요."}, {status:400});
    }

    // 1. Insert booth
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: booth, error: boothError } = await (
      supabaseAdmin.from("booths") as any
    )
      .insert({
        name,
        ...(rowLabel !== undefined ? {row_label:rowLabel, column_number:columnNumber ?? null} : {}),
        ...(infoUrl !== undefined ? {info_url:infoUrl} : {}),
        ...(authorUserId !== undefined ? {author_user_id:authorUserId} : {}),
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
