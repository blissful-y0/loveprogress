import TopCarousel from "@/components/main/TopCarousel";
import MiddleBanners from "@/components/main/MiddleBanners";
import BoardSections from "@/components/main/BoardSections";
import { createClient } from "@/lib/supabase/server";
import type { MainBannerRow } from "@/types/database";

export const revalidate = 60;

async function fetchBanners() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (await (supabase.from("main_banners") as any)
    .select("*")
    .eq("is_active", true)
    .order("sort_order")) as { data: MainBannerRow[] | null };
  return data ?? [];
}

export default async function Home() {
  const banners = await fetchBanners();
  const topBanners = banners.filter((b) => b.group_type === "top_carousel");
  const middleBanners = banners.filter((b) => b.group_type === "middle_carousel");
  const fixedBanners = banners.filter((b) => b.group_type === "fixed_banner");

  return (
    <main>
      <TopCarousel banners={topBanners} />
      <MiddleBanners middleBanners={middleBanners} fixedBanners={fixedBanners} />
      <BoardSections />
    </main>
  );
}
