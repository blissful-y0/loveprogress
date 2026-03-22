import type { QnaAnswerRow, QnaPostPublic } from "@/types/database";

export interface QnaItem {
  id: string;
  name: string;
  imageKey: string | null;
  content: string;
  isSecret: boolean;
  createdAt: string;
  answer: string | null;
}

export interface SecretQnaPayload {
  content: string;
  answer: string | null;
}

export interface QnaListResponse {
  posts: QnaPostPublic[];
  answers: Record<string, QnaAnswerRow>;
  total: number;
  page: number;
  totalPages: number;
}
