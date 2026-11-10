import { NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseErrorMessage } from "@/lib/supabase";
import { requireOwner, newAdminKey } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** 站主查看所有管理员密钥 */
export async function GET(req: Request) {
  if (!requireOwner(req).ok) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
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
    .select("id, key, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: supabaseErrorMessage(error, "读取密钥失败") }, { status: 500 });
  }
  return NextResponse.json({ keys: data ?? [] });
}

/** 站主生成新的管理员密钥 */
export async function POST(req: Request) {
  if (!requireOwner(req).ok) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "服务端未配置 Supabase（缺少 SUPABASE_SERVICE_ROLE_KEY）" },
      { status: 503 },
    );
  }

  const key = newAdminKey();
  const { data, error } = await supabase
    .from("admin_keys")
    .insert({ key })
    .select("id, key, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: supabaseErrorMessage(error, "生成密钥失败") }, { status: 500 });
  }
  return NextResponse.json({ key: data }, { status: 201 });
}
