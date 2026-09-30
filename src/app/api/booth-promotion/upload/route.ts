import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

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
  const rateLimitResponse = await rateLimit(request, "booth-promotion-upload", { maxRequests: 20, windowMs: 60_000 });
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await requireRole(BOOTH_ROLES);
  if (isErrorResponse(auth)) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "JPEG, PNG, WebP, GIF만 업로드 가능합니다." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });
    }

    const ext = MIME_TO_EXT[file.type] ?? "jpg";
    const storagePath = `booths/${auth.userId}/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = getSupabaseAdmin();
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(storagePath, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: "이미지 업로드에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ url: `/api/images/${storagePath}` });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
