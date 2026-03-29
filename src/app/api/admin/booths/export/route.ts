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
      { ascending: true },
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
      { header: "이름", key: "name", width: 20 },
      { header: "참여자", key: "participants", width: 30 },
      { header: "키워드", key: "keywords", width: 30 },
    ];

    // Add rows
    for (const [idx, booth] of booths.entries()) {
      worksheet.addRow({
        index: idx + 1,
        name: booth.name,
        participants: booth.participants.map((p) => p.name).join(", "),
        keywords: booth.keywords.map((kw) => kw.keyword).join(", "),
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
