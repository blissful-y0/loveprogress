import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const updateBannerSchema = z.object({
  group_type: z
    .enum(["top_carousel", "middle_carousel", "fixed_banner"])
    .optional(),
  image_key: z.string().min(1).optional(),
  bg_color: z.string().nullable().optional(),
  link_url: z.string().nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateBannerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin.from("main_banners") as any)
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "배너 수정에 실패했습니다." },
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const { id } = await params;

  const supabaseAdmin = getSupabaseAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from("main_banners") as any)
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "배너 삭제에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
