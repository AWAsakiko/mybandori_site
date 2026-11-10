import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireOwner } from "@/lib/auth";

/** 站主撤销（删除）管理员密钥 */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
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

  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "密钥 ID 不合法" }, { status: 400 });
  }

  const { error } = await supabase.from("admin_keys").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "撤销失败" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
