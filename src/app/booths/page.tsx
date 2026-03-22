import { createClient } from "@/lib/supabase/server";
import BoothListClient from "@/components/booths/BoothListClient";
import { toBoothCardData } from "@/types/booth";
import type { BoothWithDetails } from "@/types/booth";
import type {
  BoothKeywordRow,
  BoothParticipantRow,
  BoothRow,
} from "@/types/database";

export const metadata = {
  title: "부스리스트 | 파이낙사 온리전 :: 사랑의 진도",
  description: "파이낙사 온리전 참가 부스 목록을 확인하세요.",
};

async function fetchBooths(): Promise<BoothWithDetails[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booths, error: boothError } = (await (
    supabase.from("booths") as any
  )
    .select("*")
    .order("created_at", { ascending: false })) as {
    data: BoothRow[] | null;
    error: unknown;
  };

  if (boothError || !booths || booths.length === 0) {
    return [];
  }

  const boothIds = booths.map((b) => b.id);

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
    return [];
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

  return booths.map((booth) => ({
    ...booth,
    keywords: keywordsByBooth.get(booth.id) ?? [],
    participants: participantsByBooth.get(booth.id) ?? [],
  }));
}

export default async function BoothsPage() {
  const boothsWithDetails = await fetchBooths();
  const booths = boothsWithDetails.map(toBoothCardData);

  return (
    <section className="min-h-[60vh]">
      {/* Page Header */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <h1 className="text-2xl font-bold text-text-dark">부스리스트</h1>
        <p className="mt-2 text-[14px] text-text-light">
          참가 부스 목록을 확인하고, 필터로 원하는 부스를 찾아보세요.
        </p>
      </div>

      {/* Client-side filter + grid */}
      <BoothListClient booths={booths} />
    </section>
  );
}
