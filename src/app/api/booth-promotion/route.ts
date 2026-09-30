import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchBoothsWithDetails } from "@/lib/queries/booth-queries";
import { savePromotion } from "@/lib/save-promotion";
export async function GET() {
  try {
    const supabase = await createClient();
    const {data, error} = await fetchBoothsWithDetails(supabase, {includePromotion:true});
    if (error) return NextResponse.json({error:"부스 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."}, {status:503});
    return NextResponse.json({booths:data}, {headers:{"Cache-Control":"no-store"}});
  } catch { return NextResponse.json({error:"부스 정보를 불러오지 못했습니다."}, {status:500}); }
}
export async function POST(request:Request) { return savePromotion(request); }
