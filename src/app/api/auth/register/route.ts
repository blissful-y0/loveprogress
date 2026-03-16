import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { UserInsert } from "@/types/database";

interface RegisterBody {
  userId: string;
  nickname: string;
  email: string;
  boothName?: string;
  phoneLast4?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;

    const { userId, nickname, email, boothName, phoneLast4 } = body;

    if (!userId || !nickname || !email) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다." },
        { status: 400 },
      );
    }

    const insertData: UserInsert = {
      id: userId,
      nickname,
      email,
      booth_name: boothName ?? null,
      phone_last4: phoneLast4 ?? null,
      role: "member",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin.from("users") as any).insert(insertData);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "이미 등록된 사용자입니다." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
