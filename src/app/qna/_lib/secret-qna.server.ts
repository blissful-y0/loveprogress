import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import type { SecretQnaPayload } from "./types";

type SecretQnaRecord = SecretQnaPayload & {
  passwordHash: string;
};

const SECRET_QNA_BY_ID: Record<number, SecretQnaRecord> = {
  3: {
    passwordHash:
      "9b5673b6a4d40df0a597b3510f433da22b8af6fb898fbfb559da2d70a4aa24f9",
    content: "분실물 보관소가 따로 있나요? 행사 끝나고도 찾을 수 있는지 궁금합니다.",
    answer:
      "행사장 안내 부스에서 당일 분실물을 보관합니다. 종료 후에는 운영진 메일로 문의해 주세요.",
  },
  1: {
    passwordHash:
      "c1bec9a68374fee3d995ef5268a2d04922bc1aa96df6668c6e06df8e46109ff5",
    content: "코스프레 탈의 공간은 예약이 필요한가요? 이용 시간 제한도 있는지 알고 싶습니다.",
    answer:
      "탈의 공간은 현장 접수 순서대로 이용 가능합니다. 한 번에 20분 내 이용을 권장하고 있습니다.",
  },
};

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest();
}

export function verifySecretQnaPassword(
  id: number,
  password: string,
): SecretQnaPayload | null {
  const record = SECRET_QNA_BY_ID[id];

  if (!record) {
    return null;
  }

  const storedHash = Buffer.from(record.passwordHash, "hex");
  const incomingHash = hashPassword(password);

  if (
    storedHash.length !== incomingHash.length ||
    !timingSafeEqual(storedHash, incomingHash)
  ) {
    return null;
  }

  return {
    content: record.content,
    answer: record.answer,
  };
}
