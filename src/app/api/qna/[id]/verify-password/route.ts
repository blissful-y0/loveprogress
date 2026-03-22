import { NextResponse } from "next/server";

import { verifySecretQnaPassword } from "@/app/qna/_lib/secret-qna.server";
import { rateLimit } from "@/lib/rate-limit";

type VerifyRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "0.0.0.0";
}

export async function POST(request: Request, { params }: VerifyRouteContext) {
  const clientIp = getClientIp(request);
  const { success } = rateLimit(`verify-password:${clientIp}`, 5, 60_000);

  if (!success) {
    return NextResponse.json(
      { error: "너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

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
