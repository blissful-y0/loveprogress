import { savePromotion } from "@/lib/save-promotion";
export async function PUT(request:Request, {params}:{params:Promise<{id:string}>}) {
  return savePromotion(request, (await params).id);
}
