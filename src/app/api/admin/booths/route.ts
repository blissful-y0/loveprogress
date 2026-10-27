import { NextResponse } from "next/server";

import { isAdminError, verifyAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { boothBaseSchema, toAdminBoothWrite } from "@/lib/schemas/booth-schema";
import { createBooth, revalidateBoothPages } from "@/lib/booth-mutations";
import { fetchBoothsWithDetails } from "@/lib/queries/booth-queries";

export async function GET() {
  try {
    const adminResult = await verifyAdmin();
    if (isAdminError(adminResult)) return adminResult;

    const supabaseAdmin = getSupabaseAdmin();
    const { data: booths, error } = await fetchBoothsWithDetails(supabaseAdmin, {
      ascending: true,
      includePasswordLast4: true,
    });

    if (error || !booths) {
      return NextResponse.json({ error: "부스 목록을 불러올 수 없습니다." }, { status: 500 });
    }

    return NextResponse.json({ booths });
  } catch {
    return NextResponse.json({ error: "부스 목록을 불러올 수 없습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminResult = await verifyAdmin();
    if (isAdminError(adminResult)) return adminResult;

    const body = await request.json();
    const parsed = boothBaseSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const result = await createBooth(getSupabaseAdmin(), toAdminBoothWrite(parsed.data));
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    revalidateBoothPages();
    return NextResponse.json({ success: true, boothId: result.boothId });
  } catch {
    return NextResponse.json(
      { error: "부스 등록에 실패했습니다." },
      { status: 500 },
    );
  }
}
