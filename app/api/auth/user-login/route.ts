import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { setUserSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

const PHONE_RE = /^1[3-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isContact(value: string): boolean {
  return PHONE_RE.test(value) || EMAIL_RE.test(value);
}

export async function POST(req: Request) {
  let body: {
    contact?: unknown;
    nickname?: unknown;
    remember?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
  const remember = Boolean(body.remember);

  if (!isContact(contact)) {
    return NextResponse.json(
      { error: "请填写正确的手机号或邮箱" },
      { status: 400 },
    );
  }

  const normalized = contact.includes("@") ? contact.toLowerCase() : contact;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "服务端未配置 Supabase（缺少 SUPABASE_SERVICE_ROLE_KEY）" },
      { status: 503 },
    );
  }

  const { data: existing, error: findError } = await supabase
    .from("users")
    .select("id, nickname")
    .eq("contact", normalized)
    .maybeSingle();

  if (findError) {
    return NextResponse.json({ error: "登录失败，请稍后再试" }, { status: 500 });
  }

  if (existing) {
    await setUserSessionCookie(String(existing.id), remember);
    return NextResponse.json({
      user: { id: String(existing.id), nickname: String(existing.nickname) },
    });
  }

  if (!nickname) {
    return NextResponse.json(
      {
        error: "该联系方式还没有绑定昵称，请设置一个昵称",
        needNickname: true,
      },
      { status: 400 },
    );
  }
  if (nickname.length > 24) {
    return NextResponse.json({ error: "昵称不能超过 24 个字符" }, { status: 400 });
  }

  const { data: created, error: createError } = await supabase
    .from("users")
    .insert({ contact: normalized, nickname })
    .select("id, nickname")
    .single();

  if (createError || !created) {
    // 并发下可能已被另一个请求创建，回查一次
    const { data: raced } = await supabase
      .from("users")
      .select("id, nickname")
      .eq("contact", normalized)
      .maybeSingle();
    if (raced) {
      await setUserSessionCookie(String(raced.id), remember);
      return NextResponse.json({
        user: { id: String(raced.id), nickname: String(raced.nickname) },
      });
    }
    return NextResponse.json({ error: "创建用户失败" }, { status: 500 });
  }

  await setUserSessionCookie(String(created.id), remember);
  return NextResponse.json({
    user: { id: String(created.id), nickname: String(created.nickname) },
  });
}
