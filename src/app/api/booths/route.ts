import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { fetchBoothsWithDetails } from "@/lib/queries/booth-queries";
import type { BoothAgeType, BoothKeyword } from "@/types/database";
import type { BoothWithDetails } from "@/types/booth";

const VALID_AGE_TYPES = new Set<string>(["all", "general", "adult"]);
const VALID_KEYWORDS = new Set<string>([
  "그림회지",
  "글회지",
  "팬시굿즈",
  "수공예품",
  "무료나눔",
]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ageType = searchParams.get("ageType") ?? "all";
    const keywordsParam = searchParams.get("keywords") ?? "";

    if (!VALID_AGE_TYPES.has(ageType)) {
      return NextResponse.json(
        { error: "유효하지 않은 연령 필터입니다." },
        { status: 400 },
      );
    }

    const keywords: BoothKeyword[] = keywordsParam
      .split(",")
      .map((k) => k.trim())
      .filter((k): k is BoothKeyword => VALID_KEYWORDS.has(k));

    const supabase = await createClient();

    const { data: booths, error } = await fetchBoothsWithDetails(supabase, {
      ageType: ageType !== "all" ? (ageType as BoothAgeType) : undefined,
    });

    if (error || !booths) {
      return NextResponse.json({ error: "부스 목록을 불러올 수 없습니다." }, { status: 500 });
    }

    let result: BoothWithDetails[] = booths;

    // Filter by keywords if specified
    if (keywords.length > 0) {
      const keywordSet = new Set<string>(keywords);
      result = result.filter((booth) =>
        booth.keywords.some((kw) => keywordSet.has(kw.keyword)),
      );
    }

    return NextResponse.json({ booths: result });
  } catch {
    return NextResponse.json(
      { error: "부스 목록을 불러올 수 없습니다." },
      { status: 500 },
    );
  }
}
