import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type {
  BoothAgeType,
  BoothKeyword,
  BoothKeywordRow,
  BoothParticipantRow,
  BoothRow,
} from "@/types/database";
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

    // Fetch booths with keywords and participants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let boothQuery = (supabase.from("booths") as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (ageType !== "all") {
      boothQuery = boothQuery.eq("age_type", ageType as BoothAgeType);
    }

    const { data: booths, error: boothError } = (await boothQuery) as {
      data: BoothRow[] | null;
      error: unknown;
    };

    if (boothError) {
      return NextResponse.json(
        { error: "부스 목록을 불러올 수 없습니다." },
        { status: 500 },
      );
    }

    if (!booths || booths.length === 0) {
      return NextResponse.json({ booths: [] });
    }

    const boothIds = booths.map((b) => b.id);

    // Fetch keywords and participants in parallel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [keywordsResult, participantsResult] = (await Promise.all([
      (supabase.from("booth_keywords") as any)
        .select("*")
        .in("booth_id", boothIds),
      (supabase.from("booth_participants") as any)
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

    const keywordsByBooth = new Map<string, BoothKeywordRow[]>();
    for (const kw of keywordsResult.data ?? []) {
      const list = keywordsByBooth.get(kw.booth_id) ?? [];
      list.push(kw);
      keywordsByBooth.set(kw.booth_id, list);
    }

    const participantsByBooth = new Map<string, BoothParticipantRow[]>();
    for (const p of participantsResult.data ?? []) {
      const list = participantsByBooth.get(p.booth_id) ?? [];
      list.push(p);
      participantsByBooth.set(p.booth_id, list);
    }

    let result: BoothWithDetails[] = booths.map((booth) => ({
      ...booth,
      keywords: keywordsByBooth.get(booth.id) ?? [],
      participants: participantsByBooth.get(booth.id) ?? [],
    }));

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
