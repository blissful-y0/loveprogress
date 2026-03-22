import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { isAdminError, verifyAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  BoothKeywordRow,
  BoothParticipantRow,
  BoothRow,
} from "@/types/database";

export async function GET() {
  try {
    const adminResult = await verifyAdmin();
    if (isAdminError(adminResult)) return adminResult;

    const supabaseAdmin = getSupabaseAdmin();

    // Fetch all booths ordered by created_at
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: booths, error: boothError } = (await (
      supabaseAdmin.from("booths") as any
    )
      .select("*")
      .order("created_at", { ascending: true })) as {
      data: BoothRow[] | null;
      error: unknown;
    };

    if (boothError || !booths) {
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

    const boothIds = booths.map((b) => b.id);

    // Fetch keywords and participants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [keywordsResult, participantsResult] = (await Promise.all([
      (supabaseAdmin.from("booth_keywords") as any)
        .select("*")
        .in("booth_id", boothIds),
      (supabaseAdmin.from("booth_participants") as any)
        .select("*")
        .in("booth_id", boothIds)
        .order("role_order", { ascending: true }),
    ])) as [
      { data: BoothKeywordRow[] | null; error: unknown },
      { data: BoothParticipantRow[] | null; error: unknown },
    ];

    if (keywordsResult.error || participantsResult.error) {
      return NextResponse.json(
        { error: "부스 상세 정보를 불러올 수 없습니다." },
        { status: 500 },
      );
    }

    const keywordsByBooth = new Map<string, string[]>();
    for (const kw of keywordsResult.data ?? []) {
      const list = keywordsByBooth.get(kw.booth_id) ?? [];
      list.push(kw.keyword);
      keywordsByBooth.set(kw.booth_id, list);
    }

    const participantsByBooth = new Map<string, string[]>();
    for (const p of participantsResult.data ?? []) {
      const list = participantsByBooth.get(p.booth_id) ?? [];
      list.push(p.name);
      participantsByBooth.set(p.booth_id, list);
    }

    // Build Excel rows
    const excelRows = booths.map((booth, idx) => ({
      순번: idx + 1,
      이름: booth.name,
      참여자: (participantsByBooth.get(booth.id) ?? []).join(", "),
      키워드: (keywordsByBooth.get(booth.id) ?? []).join(", "),
      비밀번호: booth.password_last4 ?? "",
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
      { wch: 10 }, // 비밀번호
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
