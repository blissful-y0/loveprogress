import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { QnaPostRow, QnaAnswerRow } from "@/types/database";

import type { SecretQnaPayload } from "./types";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPasswordHash(
  storedHex: string,
  password: string,
): boolean {
  const storedHash = Buffer.from(storedHex, "hex");
  const incomingHash = createHash("sha256").update(password).digest();

  if (storedHash.length !== incomingHash.length) {
    return false;
  }

  return timingSafeEqual(storedHash, incomingHash);
}

export async function verifySecretQnaPassword(
  id: string,
  password: string,
): Promise<SecretQnaPayload | null> {
  const supabase = getSupabaseAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post, error: postError } = (await (
    supabase.from("qna_posts") as any
  )
    .select("password_hash, content, is_secret")
    .eq("id", id)
    .single()) as {
    data: Pick<QnaPostRow, "password_hash" | "content" | "is_secret"> | null;
    error: unknown;
  };

  if (postError || !post || !post.is_secret || !post.password_hash) {
    return null;
  }

  if (!verifyPasswordHash(post.password_hash, password)) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: answerData } = (await (supabase.from("qna_answers") as any)
    .select("content")
    .eq("qna_post_id", id)
    .single()) as {
    data: Pick<QnaAnswerRow, "content"> | null;
    error: unknown;
  };

  return {
    content: post.content,
    answer: answerData?.content ?? null,
  };
}
