import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminError, verifyAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BoothKeyword } from "@/types/database";

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

const createBoothSchema = z.object({
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

export async function POST(request: Request) {
  try {
    const adminResult = await verifyAdmin();
    if (isAdminError(adminResult)) return adminResult;

    const body = await request.json();
    const parsed = createBoothSchema.safeParse(body);

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
