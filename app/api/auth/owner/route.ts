import { NextResponse } from "next/server";
import { signToken, verifyOwnerPassword } from "@/lib/auth";

export async function POST(req: Request) {
  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!verifyOwnerPassword(body.password)) {
    return NextResponse.json({ error: "站主密码错误" }, { status: 401 });
  }

  return NextResponse.json({ role: "owner", token: signToken("owner") });
}
