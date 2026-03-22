import type { QnaPostPublic } from "@/types/database";

export interface QnaPost extends QnaPostPublic {
  answer: string | null;
  hasAnswer: boolean;
}

export interface SecretQnaPayload {
  content: string;
  answer: string | null;
}

export interface QnaListResponse {
  posts: QnaPost[];
  total: number;
  page: number;
  totalPages: number;
}
