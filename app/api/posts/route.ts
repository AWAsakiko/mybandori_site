import { NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseErrorMessage } from "@/lib/supabase";
import { getAuthFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PHONE_RE = /^1[3-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isContact(value: string): boolean {
  return PHONE_RE.test(value) || EMAIL_RE.test(value);
}

type PostRow = {
  id: string;
  contact: string;
  nickname: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

function publicPost(p: PostRow) {
  return {
    id: p.id,
    nickname: p.nickname,
    content: p.content,
    image_url: p.image_url,
    created_at: p.created_at,
  };
}

/** 获取帖子：游客只返回昵称/内容；管理员或站主返回完整数据（含联系方式） */
export async function GET(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "服务端未配置 Supabase（缺少 SUPABASE_SERVICE_ROLE_KEY）" },
      { status: 503 },
    );
  }

  const auth = getAuthFromRequest(req);
  const isAdmin = Boolean(auth);

  const { data, error } = await supabase
    .from("posts")
    .select("id, contact, nickname, content, image_url, created_at")
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: supabaseErrorMessage(error, "读取帖子失败") }, { status: 500 });
  }

  const rows = (data ?? []) as PostRow[];
  return NextResponse.json({
    admin: isAdmin,
    posts: isAdmin ? rows : rows.map(publicPost),
  });
}

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "服务端未配置 Supabase（缺少 SUPABASE_SERVICE_ROLE_KEY）" },
      { status: 503 },
    );
  }

  let body: {
    contact?: unknown;
    nickname?: unknown;
    content?: unknown;
    image_url?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const imageUrl =
    typeof body.image_url === "string" && body.image_url.trim()
      ? body.image_url.trim()
      : null;

  if (!isContact(contact)) {
    return NextResponse.json(
      { error: "请填写正确的手机号或邮箱" },
      { status: 400 },
    );
  }
  if (nickname.length < 1 || nickname.length > 24) {
    return NextResponse.json({ error: "昵称需为 1–24 个字符" }, { status: 400 });
  }
  if (content.length < 1 || content.length > 2000) {
    return NextResponse.json(
      { error: "内容需为 1–2000 个字符" },
      { status: 400 },
    );
  }
  if (imageUrl && !/^https:\/\/[^\s]+$/i.test(imageUrl)) {
    return NextResponse.json({ error: "图片地址不合法" }, { status: 400 });
  }

  const normalized = contact.includes("@") ? contact.toLowerCase() : contact;

  // 服务端限流：同一联系方式 60 秒内只能发 1 条（前端 localStorage 之外的双保险）
  const since = new Date(Date.now() - 60_000).toISOString();
  const { data: recent, error: recentError } = await supabase
    .from("posts")
    .select("id")
    .eq("contact", normalized)
    .gte("created_at", since)
    .limit(1);

  if (recentError) {
    return NextResponse.json({ error: supabaseErrorMessage(recentError, "发送失败，请稍后再试") }, { status: 500 });
  }
  if (recent && recent.length > 0) {
    return NextResponse.json(
      { error: "同一联系方式 1 分钟内只能发布 1 条" },
      { status: 429 },
    );
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      contact: normalized,
      nickname,
      content,
      image_url: imageUrl,
    })
    .select("id, contact, nickname, content, image_url, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: supabaseErrorMessage(error, "发布失败，请稍后再试") }, { status: 500 });
  }

  return NextResponse.json({ post: publicPost(data as PostRow) }, { status: 201 });
}
