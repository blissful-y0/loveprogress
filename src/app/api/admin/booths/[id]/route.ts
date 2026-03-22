import { NextResponse } from "next/server";

import { isAdminError, verifyAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { boothBaseSchema } from "@/lib/schemas/booth-schema";
import type { BoothKeywordRow, BoothParticipantRow } from "@/types/database";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const adminResult = await verifyAdmin();
    if (isAdminError(adminResult)) return adminResult;

    const { id } = await params;
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

    // Verify booth exists
    const { data: existing } = await supabaseAdmin
      .from("booths")
      .select("id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "부스를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 1. Update booth
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: boothError } = await (
      supabaseAdmin.from("booths") as any
    )
      .update({
        name,
        password_last4: passwordLast4 ?? null,
        thumbnail_image_key: thumbnailImageKey,
        hover_image_key: hoverImageKey ?? null,
        age_type: ageType,
      })
      .eq("id", id);

    if (boothError) {
      return NextResponse.json(
        { error: "부스 수정에 실패했습니다." },
        { status: 500 },
      );
    }

    // 2. Save old keywords for rollback, then delete + reinsert
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: oldKeywords } = (await (
      supabaseAdmin.from("booth_keywords") as any
    )
      .select("*")
      .eq("booth_id", id)) as { data: BoothKeywordRow[] | null };

    await supabaseAdmin.from("booth_keywords").delete().eq("booth_id", id);

    const keywordRows = keywords.map((keyword) => ({
      booth_id: id,
      keyword,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: kwError } = await (
      supabaseAdmin.from("booth_keywords") as any
    ).insert(keywordRows);

    if (kwError) {
      // Rollback: restore old keywords
      if (oldKeywords && oldKeywords.length > 0) {
        const restoreRows = oldKeywords.map((kw) => ({
          booth_id: kw.booth_id,
          keyword: kw.keyword,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin.from("booth_keywords") as any).insert(restoreRows);
      }
      return NextResponse.json(
        { error: "키워드 수정에 실패했습니다." },
        { status: 500 },
      );
    }

    // 3. Save old participants for rollback, then delete + reinsert
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: oldParticipants } = (await (
      supabaseAdmin.from("booth_participants") as any
    )
      .select("*")
      .eq("booth_id", id)) as { data: BoothParticipantRow[] | null };

    await supabaseAdmin
      .from("booth_participants")
      .delete()
      .eq("booth_id", id);

    const participantRows = [
      { booth_id: id, name: owner.name, sns_url: owner.snsUrl ?? null, role_order: 0 },
      ...participants.map((p, i) => ({
        booth_id: id,
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
      // Rollback: restore old participants
      if (oldParticipants && oldParticipants.length > 0) {
        const restoreRows = oldParticipants.map((p) => ({
          booth_id: p.booth_id,
          name: p.name,
          sns_url: p.sns_url,
          role_order: p.role_order,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin.from("booth_participants") as any).insert(restoreRows);
      }
      return NextResponse.json(
        { error: "참여자 수정에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "부스 수정에 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const adminResult = await verifyAdmin();
    if (isAdminError(adminResult)) return adminResult;

    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    // Verify booth exists
    const { data: existing } = await supabaseAdmin
      .from("booths")
      .select("id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "부스를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // Delete booth (cascade should remove keywords and participants)
    const { error } = await supabaseAdmin
      .from("booths")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "부스 삭제에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "부스 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}
