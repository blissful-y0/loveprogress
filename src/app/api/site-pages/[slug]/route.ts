import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ slug: string }> };

const ALLOWED_SLUGS = ["about"] as const;

const updateSchema = z.object({
  content: z.string().max(2_000_000, "콘텐츠가 너무 큽니다."),
});

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;

    if (!ALLOWED_SLUGS.includes(slug as (typeof ALLOWED_SLUGS)[number])) {
      return NextResponse.json({ error: "존재하지 않는 페이지입니다." }, { status: 404 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_pages")
      .select("content, updated_at")
      .eq("slug", slug)
      .single<{ content: string; updated_at: string }>();

    if (error || !data) {
      return NextResponse.json({ content: "", updated_at: null });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;

    if (!ALLOWED_SLUGS.includes(slug as (typeof ALLOWED_SLUGS)[number])) {
      return NextResponse.json({ error: "존재하지 않는 페이지입니다." }, { status: 404 });
    }

    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", authUser.id)
      .single<{ role: string }>();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin.from("site_pages") as any)
      .upsert({ slug, content: parsed.data.content, updated_at: new Date().toISOString() });

    if (error) {
      return NextResponse.json({ error: "저장에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
