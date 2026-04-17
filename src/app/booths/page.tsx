import { createClient } from "@/lib/supabase/server";
import { fetchBoothsWithDetails } from "@/lib/queries/booth-queries";
import BoothListClient from "@/components/booths/BoothListClient";
import { toBoothCardData } from "@/types/booth";
import type { BoothWithDetails } from "@/types/booth";

export const metadata = {
  title: "부스리스트 | 파이낙사 온리전 :: 사랑의 진도",
  description: "파이낙사 온리전 참가 부스 목록을 확인하세요.",
};

export const revalidate = 60;

async function fetchBooths(): Promise<BoothWithDetails[]> {
  const supabase = await createClient();
  const { data } = await fetchBoothsWithDetails(supabase);
  return data ?? [];
}

export default async function BoothsPage() {
  const boothsWithDetails = await fetchBooths();
  const booths = boothsWithDetails.map(toBoothCardData);

  return (
    <section className="min-h-[60vh]">
      {/* Page Header */}
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 pt-12 pb-2">
        <h1 className="text-center text-[24px] font-bold text-[#1a1a1a] tracking-[-0.03em]">
          교내 동아리
        </h1>
        <p className="text-center text-[13px] text-[#bbb] mt-1.5">
          참가 부스 목록을 확인하고, 필터로 원하는 부스를 찾아보세요.
        </p>
      </div>

      {/* Client-side filter + grid */}
      <BoothListClient booths={booths} />
    </section>
  );
}
