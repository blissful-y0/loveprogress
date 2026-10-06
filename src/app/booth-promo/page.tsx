import { PageHeader } from "@/components/page-header";
import BoothPromoClient from "@/components/booths/BoothPromoClient";
import { fetchBoothsWithDetails } from "@/lib/queries/booth-queries";
import { createClient } from "@/lib/supabase/server";
import { toBoothCardData } from "@/types/booth";

export const metadata = {
  title: "부스홍보게시판 | 파이낙사 온리전 :: 사랑의 진도",
  description: "부스 판매상품을 자유롭게 전시 및 홍보 할 수 있습니다.",
};

export const revalidate = 60;

export default async function BoothPromoPage() {
  const supabase = await createClient();
  const { data } = await fetchBoothsWithDetails(supabase);
  const booths = (data ?? []).map(toBoothCardData);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-10">
      <div className="mb-6">
        <PageHeader
          title="부스홍보게시판"
          subtitle="부스 판매상품을 자유롭게 전시 및 홍보 할 수 있습니다."
        />
      </div>
      <BoothPromoClient booths={booths} />
    </div>
  );
}
