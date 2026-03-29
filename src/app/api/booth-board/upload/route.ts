import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

import { isErrorResponse, requireRole } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

const BOOTH_ROLES = ["booth_member", "admin"] as const;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const rateLimitResponse = await rateLimit(request, "booth-board-upload", { maxRequests: 20, windowMs: 60_000 });
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await requireRole(BOOTH_ROLES);
  if (isErrorResponse(auth)) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "JPEG, PNG, WebP, GIF만 업로드 가능합니다." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });
    }

    const ext = MIME_TO_EXT[file.type] ?? "jpg";
    const storagePath = `booth-board/${Date.now()}-${nanoid(8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = getSupabaseAdmin();
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(storagePath, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: "이미지 업로드에 실패했습니다." }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("images").getPublicUrl(storagePath);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
