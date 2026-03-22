import { NextResponse } from "next/server";

import { isAdminError, verifyAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const BUCKET = "images";

export async function POST(request: Request) {
  try {
    const adminResult = await verifyAdmin();
    if (isAdminError(adminResult)) return adminResult;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) ?? "misc";

    if (!file) {
      return NextResponse.json({ error: "파일을 선택해주세요." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 형식입니다. (JPG, PNG, WebP, GIF)" },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다." },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const randomId = Math.random().toString(36).slice(2, 10);
    const storagePath = `${folder}/${Date.now()}-${randomId}.${ext}`;

    const buffer = new Uint8Array(await file.arrayBuffer());
    const supabaseAdmin = getSupabaseAdmin();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json(
        { error: "이미지 업로드에 실패했습니다." },
        { status: 500 },
      );
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch {
    return NextResponse.json(
      { error: "이미지 업로드에 실패했습니다." },
      { status: 500 },
    );
  }
}
