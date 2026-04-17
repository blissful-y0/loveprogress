import { z } from "zod";

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

export const boothBaseSchema = z.object({
  name: z
    .string()
    .min(1, "부스 이름을 입력해주세요.")
    .max(20, "부스 이름은 20자 이하여야 합니다."),
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
});
