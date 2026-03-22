import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type {
  BoothKeywordRow,
  BoothParticipantRow,
  BoothRow,
} from "@/types/database";
import type { BoothWithDetails } from "@/types/booth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/** Columns to select from booths table (excludes password_last4) */
const BOOTH_PUBLIC_COLUMNS =
  "id, name, thumbnail_image_key, hover_image_key, age_type, created_at, updated_at";

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: booth, error: boothError } = (await (
      supabase.from("booths") as any
    )
      .select(BOOTH_PUBLIC_COLUMNS)
      .eq("id", id)
      .single()) as { data: BoothRow | null; error: unknown };

    if (boothError || !booth) {
      return NextResponse.json(
        { error: "부스를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [keywordsResult, participantsResult] = (await Promise.all([
      (supabase.from("booth_keywords") as any)
        .select("*")
        .eq("booth_id", id),
      (supabase.from("booth_participants") as any)
        .select("*")
        .eq("booth_id", id)
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

    const boothWithDetails: BoothWithDetails = {
      ...booth,
      keywords: keywordsResult.data ?? [],
      participants: participantsResult.data ?? [],
    };

    return NextResponse.json({ booth: boothWithDetails });
  } catch {
    return NextResponse.json(
      { error: "부스를 불러올 수 없습니다." },
      { status: 500 },
    );
  }
}
