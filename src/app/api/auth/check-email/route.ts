import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

interface CheckEmailBody {
  email: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckEmailBody;

    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "이메일을 입력해주세요." },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ available: data === null });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
