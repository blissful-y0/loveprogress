import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

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

    if (booths.length === 0) {
      // Return empty Excel
      const worksheet = XLSX.utils.json_to_sheet([]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "부스목록");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="booths_export.xlsx"',
        },
      });
    }

    // Build Excel rows
    const excelRows = booths.map((booth, idx) => ({
      순번: idx + 1,
      이름: booth.name,
      참여자: booth.participants
        .map((p) => p.name)
        .join(", "),
      키워드: booth.keywords
        .map((kw) => kw.keyword)
        .join(", "),
    }));

    // Generate workbook
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "부스목록");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 6 },  // 순번
      { wch: 20 }, // 이름
      { wch: 30 }, // 참여자
      { wch: 30 }, // 키워드
    ];

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

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
