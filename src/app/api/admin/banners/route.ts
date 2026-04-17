import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const createBannerSchema = z.object({
  group_type: z.enum(["top_carousel", "middle_carousel", "fixed_banner", "events_thumb"]),
  image_key: z.string().min(1, "이미지 URL을 입력해주세요."),
  bg_color: z.string().nullable().optional(),
  link_url: z.string().nullable().optional(),
  sort_order: z.number().int().min(0),
  is_active: z.boolean(),
});

export async function GET(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const supabaseAdmin = getSupabaseAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin.from("main_banners") as any)
    .select("*")
    .order("group_type")
    .order("sort_order");

  if (error) {
    return NextResponse.json(
      { error: "배너 목록을 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  try {
    const body = await request.json();
    const parsed = createBannerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin.from("main_banners") as any)
      .insert({
        ...parsed.data,
        bg_color: parsed.data.bg_color ?? null,
        link_url: parsed.data.link_url ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "배너 생성에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }
}
