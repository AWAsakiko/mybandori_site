import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  let body: { key?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (!key) {
    return NextResponse.json({ error: "请输入管理员密钥" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "服务端未配置 Supabase（缺少 SUPABASE_SERVICE_ROLE_KEY）" },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("admin_keys")
    .select("id")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "校验失败，请稍后再试" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "管理员密钥无效或已被撤销" }, { status: 401 });
  }

  return NextResponse.json({ role: "admin", token: signToken("admin") });
}
