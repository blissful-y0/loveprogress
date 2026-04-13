import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

import { isAdminError, verifyAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchBoothsWithDetails } from "@/lib/queries/booth-queries";

export async function GET() {
  try {
    const adminResult = await verifyAdmin();
    if (isAdminError(adminResult)) return adminResult;

    const supabaseAdmin = getSupabaseAdmin();

    const { data: booths, error } = await fetchBoothsWithDetails(
      supabaseAdmin,
      { ascending: true, includePasswordLast4: true },
    );

    if (error || !booths) {
      return NextResponse.json(
        { error: "부스 목록을 불러올 수 없습니다." },
        { status: 500 },
      );
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("부스목록");

    // Define columns
    worksheet.columns = [
      { header: "순번", key: "index", width: 6 },
      { header: "부스명", key: "name", width: 20 },
      { header: "비밀번호", key: "password", width: 12 },
      { header: "대표자", key: "owner", width: 15 },
      { header: "참가자1", key: "participant1", width: 15 },
      { header: "참가자2", key: "participant2", width: 15 },
      { header: "참가자3", key: "participant3", width: 15 },
      { header: "일반/성인", key: "ageType", width: 10 },
    ];

    // Add rows
    for (const [idx, booth] of booths.entries()) {
      const sorted = [...booth.participants].sort((a, b) => a.role_order - b.role_order);
      const owner = sorted.find((p) => p.role_order === 0);
      const others = sorted.filter((p) => p.role_order > 0);
      worksheet.addRow({
        index: idx + 1,
        name: booth.name,
        password: booth.password_last4 ?? "",
        owner: owner?.name ?? "",
        participant1: others[0]?.name ?? "",
        participant2: others[1]?.name ?? "",
        participant3: others[2]?.name ?? "",
        ageType: booth.age_type === "adult" ? "성인" : "일반",
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="booths_export.xlsx"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "엑셀 파일 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}
