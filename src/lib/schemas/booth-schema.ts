import { z } from "zod";

import { BOOTH_ROW_MAX, BOOTH_ROWS, isValidBoothPosition, type BoothRowLabel } from "@/lib/booth-layout";
import type { BoothWriteInput } from "@/lib/booth-mutations";
import type { BoothKeyword } from "@/types/database";

export const VALID_KEYWORDS: readonly BoothKeyword[] = [
  "그림회지",
  "글회지",
  "팬시굿즈",
  "수공예품",
  "무료나눔",
];

export const participantSchema = z.object({
  name: z.string().min(1, "참여자 이름을 입력해주세요.").max(20),
  snsUrl: z.string().url("올바른 URL 형식을 입력해주세요.").optional(),
});

/** 부스인포 링크: http(s)만 허용 (javascript: 등 차단) */
const infoUrlSchema = z
  .string()
  .max(500, "링크는 500자 이하여야 합니다.")
  .regex(/^https?:\/\/\S+$/i, "인포 링크는 http:// 또는 https://로 시작해야 합니다.");

const boothFields = z.object({
  name: z
    .string()
    .min(1, "부스 이름을 입력해주세요.")
    .max(30, "부스 이름은 30자 이하여야 합니다."),
  passwordLast4: z
    .string()
    .regex(/^\d{4}$/, "비밀번호는 숫자 4자리여야 합니다.")
    .optional(),
  thumbnailImageKey: z.string().min(1, "썸네일 이미지를 선택해주세요."),
  hoverImageKey: z.string().optional(),
  ageType: z.enum(["general", "adult"], {
    error: "유효한 연령 타입을 선택해주세요.",
  }),
  keywords: z
    .array(z.enum(VALID_KEYWORDS as unknown as [string, ...string[]]))
    .min(1, "키워드를 최소 1개 선택해주세요."),
  owner: participantSchema,
  participants: z
    .array(participantSchema)
    .max(3, "참여자는 최대 3명까지 가능합니다."),
  rowLabel: z.enum(BOOTH_ROWS, { error: "행번을 선택해주세요." }).nullable().optional(),
  colNo: z.number({ error: "열번을 선택해주세요." }).int().nullable().optional(),
  infoUrl: infoUrlSchema.optional(),
});

function checkPosition(
  data: { rowLabel?: string | null; colNo?: number | null; colEnd?: number | null },
  ctx: z.RefinementCtx,
) {
  const hasRow = data.rowLabel != null;
  const hasCol = data.colNo != null;
  if (hasRow !== hasCol) {
    ctx.addIssue({ code: "custom", message: "행번과 열번을 함께 선택해주세요.", path: ["colNo"] });
    return;
  }
  if (hasRow && !isValidBoothPosition(data.rowLabel!, data.colNo!)) {
    ctx.addIssue({ code: "custom", message: "존재하지 않는 부스 위치입니다.", path: ["colNo"] });
    return;
  }
  if (data.colEnd == null) return;
  const max = hasRow ? BOOTH_ROW_MAX[data.rowLabel as BoothRowLabel] : 0;
  if (!hasRow || data.colEnd <= data.colNo! || data.colEnd > max) {
    ctx.addIssue({ code: "custom", message: "끝 열은 시작 열보다 뒤의 칸이어야 합니다.", path: ["colEnd"] });
  }
}

/** 관리자 부스 등록·수정: 위치는 선택, 담당 계정 지정 가능.
 *  주최부스·본부석 같은 운영 구역은 대표자·키워드 없이, 여러 칸(colEnd)으로 등록할 수 있다 */
export const boothBaseSchema = boothFields
  .extend({
    userId: z.string().uuid("유효하지 않은 계정입니다.").nullable().optional(),
    colEnd: z.number().int().nullable().optional(),
    // 부스홍보 화면에서 저장하면 true → promo_posted_at 갱신
    promoPosted: z.boolean().optional(),
    owner: participantSchema.optional(),
    keywords: boothFields.shape.keywords.unwrap().array(),
  })
  .superRefine(checkPosition);

/** 부스홍보게시판 등록·수정(부스어): 위치 필수, 비밀번호·롤오버 이미지 없음 */
export const boothPromoSchema = boothFields
  .omit({ passwordLast4: true, hoverImageKey: true })
  .extend({
    rowLabel: z.enum(BOOTH_ROWS, { error: "행번을 선택해주세요." }),
    colNo: z.number({ error: "열번을 선택해주세요." }).int(),
  })
  .superRefine(checkPosition);

export type BoothAdminInput = z.infer<typeof boothBaseSchema>;
export type BoothPromoInput = z.infer<typeof boothPromoSchema>;

function participantsOf(data: Pick<BoothAdminInput, "keywords" | "owner" | "participants">) {
  return { keywords: data.keywords, owner: data.owner, participants: data.participants };
}

/** 관리자 입력 → booths 컬럼. 위치·담당 계정을 비우면 null로 저장 */
export function toAdminBoothWrite(data: BoothAdminInput): BoothWriteInput {
  return {
    columns: {
      name: data.name,
      password_last4: data.passwordLast4 ?? null,
      thumbnail_image_key: data.thumbnailImageKey,
      hover_image_key: data.hoverImageKey ?? null,
      age_type: data.ageType,
      row_label: data.rowLabel ?? null,
      col_no: data.colNo ?? null,
      // colEnd를 안 보내는 화면(관리자 부스 관리)은 기존 값을 유지. 위치를 비우면 함께 비움
      ...((data.colEnd !== undefined || data.rowLabel == null) && { col_end: data.colEnd ?? null }),
      info_url: data.infoUrl ?? null,
      user_id: data.userId ?? null,
      ...(data.promoPosted && { promo_posted_at: new Date().toISOString() }),
    },
    ...participantsOf(data),
  };
}

/** 부스어 입력 → booths 컬럼. 비밀번호·롤오버 이미지·담당 계정은 건드리지 않음 */
export function toPromoBoothWrite(data: BoothPromoInput): BoothWriteInput {
  return {
    columns: {
      name: data.name,
      thumbnail_image_key: data.thumbnailImageKey,
      age_type: data.ageType,
      row_label: data.rowLabel,
      col_no: data.colNo,
      col_end: null,
      promo_posted_at: new Date().toISOString(),
      info_url: data.infoUrl ?? null,
    },
    ...participantsOf(data),
  };
}
