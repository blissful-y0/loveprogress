import { NextResponse } from "next/server";

import { verifySecretQnaPassword } from "@/app/qna/_lib/secret-qna.server";
import { rateLimit } from "@/lib/rate-limit";

type VerifyRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: VerifyRouteContext) {
  const rateLimitResponse = await rateLimit(request, "qna-verify-password", {
    maxRequests: 5,
    windowMs: 60_000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;

  if (!body || typeof body.password !== "string" || body.password.length === 0) {
    return NextResponse.json(
      { error: "비밀번호를 입력해주세요" },
      { status: 400 },
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "존재하지 않는 문의입니다" },
      { status: 404 },
    );
  }

  const secretPayload = await verifySecretQnaPassword(id, body.password);

  if (!secretPayload) {
    return NextResponse.json(
      { error: "비밀번호를 다시 확인해주세요" },
      { status: 401 },
    );
  }

  return NextResponse.json(secretPayload);
}
