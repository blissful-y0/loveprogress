import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

const CACHE_SECONDS = 60 * 60; // 1시간 CDN 캐시

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const storagePath = path.join("/");

  if (!storagePath || storagePath.includes("..")) {
    return NextResponse.json({ error: "잘못된 경로입니다." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from("images")
    .download(storagePath);

  if (error || !data) {
    return NextResponse.json({ error: "이미지를 찾을 수 없습니다." }, { status: 404 });
  }

  const buffer = await data.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": data.type || "image/jpeg",
      "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
    },
  });
}
