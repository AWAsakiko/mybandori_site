import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyOwnerPassword, type Role } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { secret?: unknown; remember?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const secret = typeof body.secret === "string" ? body.secret.trim() : "";
  if (!secret) {
    return NextResponse.json({ error: "请输入站主密码或管理员密钥" }, { status: 400 });
  }

  let role: Role | null = null;
  let keyId: string | undefined;

  if (verifyOwnerPassword(secret)) {
    role = "owner";
  } else {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "服务端未配置 Supabase（缺少 SUPABASE_SERVICE_ROLE_KEY）" },
        { status: 503 },
      );
    }
    const { data, error } = await supabase
      .from("admin_keys")
      .select("*")
      .eq("key", secret)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "校验失败，请稍后再试" }, { status: 500 });
    }
    // status 列为兼容旧表：存在且为 revoked 时视为失效
    if (data && (data.status ?? "active") !== "revoked") {
      role = "admin";
      keyId = String(data.id);
    }
  }

  if (!role) {
    return NextResponse.json({ error: "密码或密钥无效" }, { status: 401 });
  }

  await setSessionCookie(role, Boolean(body.remember), keyId);
  return NextResponse.json({ role });
}
