import { NextResponse } from "next/server";

import { isAdminError, verifyAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { boothBaseSchema, toAdminBoothWrite } from "@/lib/schemas/booth-schema";
import { revalidateBoothPages, updateBooth } from "@/lib/booth-mutations";

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

    const result = await updateBooth(getSupabaseAdmin(), id, toAdminBoothWrite(parsed.data));
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    revalidateBoothPages();
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

    revalidateBoothPages();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "부스 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}
