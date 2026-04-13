import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const boothId = searchParams.get("boothId");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (boothId) {
      // Get like count for a specific booth + whether current user liked it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase.from("booth_likes") as any)
        .select("id", { count: "exact", head: true })
        .eq("booth_id", boothId);

      let liked = false;
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase.from("booth_likes") as any)
          .select("id")
          .eq("booth_id", boothId)
          .eq("user_id", user.id)
          .maybeSingle();
        liked = !!data;
      }

      return NextResponse.json({ count: count ?? 0, liked });
    }

    // Get all like counts (for booth listing)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: likes } = (await (supabase.from("booth_likes") as any)
      .select("booth_id")) as { data: { booth_id: string }[] | null };

    const countMap: Record<string, number> = {};
    for (const like of likes ?? []) {
      countMap[like.booth_id] = (countMap[like.booth_id] ?? 0) + 1;
    }

    // Get user's liked booths
    let userLikes: string[] = [];
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: myLikes } = (await (supabase.from("booth_likes") as any)
        .select("booth_id")
        .eq("user_id", user.id)) as { data: { booth_id: string }[] | null };
      userLikes = (myLikes ?? []).map((l) => l.booth_id);
    }

    return NextResponse.json({ counts: countMap, userLikes });
  } catch {
    return NextResponse.json({ error: "좋아요 정보를 불러올 수 없습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const boothId = body.boothId as string;

    if (!boothId) {
      return NextResponse.json({ error: "부스 ID가 필요합니다." }, { status: 400 });
    }

    // Check if already liked
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase.from("booth_likes") as any)
      .select("id")
      .eq("booth_id", boothId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      // Unlike
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("booth_likes") as any)
        .delete()
        .eq("booth_id", boothId)
        .eq("user_id", user.id);

      return NextResponse.json({ liked: false });
    } else {
      // Like
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("booth_likes") as any)
        .insert({ booth_id: boothId, user_id: user.id });

      return NextResponse.json({ liked: true });
    }
  } catch {
    return NextResponse.json({ error: "좋아요 처리에 실패했습니다." }, { status: 500 });
  }
}
