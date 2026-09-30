import { z } from "zod";
import { boothBaseSchema } from "./booth-schema";
import { validBoothPosition } from "@/lib/booth-layout";
const webUrl = z.string().url().refine(v => /^https?:\/\//i.test(v), "http 또는 https 링크를 입력해주세요.");
export const promotionSchema = boothBaseSchema.omit({passwordLast4:true, hoverImageKey:true}).extend({
  rowLabel: z.string(),
  columnNumber: z.number().int(),
  infoUrl: webUrl.nullable(),
  name: z.string().trim().min(1).max(30),
  owner: z.object({name:z.string().trim().min(1).max(20), snsUrl:webUrl.optional()}),
  participants: z.array(z.object({name:z.string().trim().min(1).max(20), snsUrl:webUrl.optional()})).max(3),
}).refine(v => validBoothPosition(v.rowLabel, v.columnNumber), {message:"유효한 부스 위치를 선택해주세요.", path:["columnNumber"]});

export const adminPromotionSchema = boothBaseSchema.extend({
  rowLabel:z.string().nullable().optional(),
  columnNumber:z.number().int().nullable().optional(),
  infoUrl:webUrl.nullable().optional(),
  authorUserId:z.uuid().nullable().optional(),
}).refine(v => (v.rowLabel == null && v.columnNumber == null) || (v.rowLabel != null && v.columnNumber != null && validBoothPosition(v.rowLabel,v.columnNumber)), {message:"행과 열을 함께 선택해주세요."});
