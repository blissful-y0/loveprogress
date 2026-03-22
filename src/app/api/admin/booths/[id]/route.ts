import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminError, verifyAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BoothKeyword } from "@/types/database";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const VALID_KEYWORDS: readonly BoothKeyword[] = [
  "그림회지",
  "글회지",
  "팬시굿즈",
  "수공예품",
  "무료나눔",
];

const participantSchema = z.object({
  name: z.string().min(1, "참여자 이름을 입력해주세요.").max(20),
  snsUrl: z.string().url("올바른 URL 형식을 입력해주세요.").optional(),
});

const updateBoothSchema = z.object({
  name: z
    .string()
    .min(1, "부스 이름을 입력해주세요.")
    .max(20, "부스 이름은 20자 이하여야 합니다."),
  passwordLast4: z
    .string()
    .regex(/^\d{4}$/, "비밀번호는 숫자 4자리여야 합니다.")
    .optional(),
  thumbnailImageKey: z.string().min(1, "썸네일 이미지를 선택해주세요."),
  hoverImageKey: z.string().optional(),
  ageType: z.enum(["general", "adult"], {
    error: "유효한 연령 타입을 선택해주세요.",
  }),
  keywords: z
    .array(z.enum(VALID_KEYWORDS as unknown as [string, ...string[]]))
    .min(1, "키워드를 최소 1개 선택해주세요."),
  owner: participantSchema,
  participants: z
    .array(participantSchema)
    .max(3, "참여자는 최대 3명까지 가능합니다."),
});

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const adminResult = await verifyAdmin();
    if (isAdminError(adminResult)) return adminResult;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateBoothSchema.safeParse(body);

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

    // 2. Delete + reinsert keywords
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
      return NextResponse.json(
        { error: "키워드 수정에 실패했습니다." },
        { status: 500 },
      );
    }

    // 3. Delete + reinsert participants
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
