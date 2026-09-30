import { NextResponse } from "next/server";
import { isErrorResponse, requireRole } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { promotionSchema } from "@/lib/schemas/promotion-schema";
import { z } from "zod";
export async function savePromotion(request:Request, id?:string) {
  try {
    const auth = await requireRole(["booth_member", "admin"]);
    if (isErrorResponse(auth)) return auth;
    if (id && !z.uuid().safeParse(id).success) return NextResponse.json({error:"유효하지 않은 부스입니다."}, {status:400});
    let body:unknown;
    try { body = await request.json(); } catch { return NextResponse.json({error:"입력값이 올바르지 않습니다."}, {status:400}); }
    const parsed = promotionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({error:parsed.error.issues[0].message}, {status:400});
    const data = parsed.data;
    // RPC writes the booth and its child rows in one transaction; caller identity is server-derived.
    const supabase = getSupabaseAdmin();
    // The existing handwritten Database type is not fully compatible with Supabase RPC inference.
    const rpc = supabase.rpc.bind(supabase) as unknown as (name: "save_booth_promotion", args: {p_id:string|null;p_author:string;p_data:typeof data}) => Promise<{data:string|null;error:{code:string}|null}>;
    const {data:boothId, error} = await rpc("save_booth_promotion", {
      p_id:id ?? null, p_author:auth.userId, p_data:data,
    });
    if (error) {
      const status = error.code === "23505" ? 409 : error.code === "42501" ? 403 : error.code === "P0002" ? 404 : 500;
      const message = status === 409 ? "이미 등록된 위치입니다. 다른 위치를 선택해주세요." : status === 403 ? "본인이 작성한 부스만 수정할 수 있습니다." : status === 404 ? "부스를 찾을 수 없습니다." : "저장에 실패했습니다. 잠시 후 다시 시도해주세요.";
      return NextResponse.json({error:message}, {status});
    }
    return NextResponse.json({boothId}, {status:id ? 200 : 201});
  } catch { return NextResponse.json({error:"저장에 실패했습니다."}, {status:500}); }
}
