import { NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseErrorMessage } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const PHONE_RE = /^1[3-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_RE = /^[0-9a-f-]{36}$/i;

type ReplyRow = {
  id: string;
  post_id: string;
  nickname: string;
  contact: string;
  content: string;
  created_at: string;
};

function isContact(value: string): boolean {
  return PHONE_RE.test(value) || EMAIL_RE.test(value);
}

function publicReply(reply: ReplyRow) {
  return {
    id: reply.id,
    post_id: reply.post_id,
    nickname: reply.nickname,
    content: reply.content,
    created_at: reply.created_at,
  };
}

const ipHits = new Map<string, number>();

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (ipHits.size > 5000) {
    for (const [key, at] of ipHits) {
      if (now - at > 60_000) ipHits.delete(key);
    }
  }
  const last = ipHits.get(ip);
  if (last && now - last < 60_000) return true;
  ipHits.set(ip, now);
  return false;
}

/** 回复列表：游客强制脱敏 contact；管理员/站主返回完整数据 */
export async function GET(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "服务端未配置 Supabase（缺少 SUPABASE_SERVICE_ROLE_KEY）" },
      { status: 503 },
    );
  }

  const postId = new URL(req.url).searchParams.get("post_id") ?? "";
  if (!UUID_RE.test(postId)) {
    return NextResponse.json({ error: "post_id 不合法" }, { status: 400 });
  }

  const session = await getSession();
  const isAdmin = Boolean(session);

  const { data, error } = await supabase
    .from("replies")
    .select("id, post_id, nickname, contact, content, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: supabaseErrorMessage(error, "读取回复失败") },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as ReplyRow[];
  return NextResponse.json({
    admin: isAdmin,
    replies: isAdmin ? rows : rows.map(publicReply),
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
    post_id?: unknown;
    nickname?: unknown;
    contact?: unknown;
    content?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const postId = typeof body.post_id === "string" ? body.post_id.trim() : "";
  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!UUID_RE.test(postId)) {
    return NextResponse.json({ error: "post_id 不合法" }, { status: 400 });
  }
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

  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "同一 IP 1 分钟内只能回复 1 条" },
      { status: 429 },
    );
  }

  const normalized = contact.includes("@") ? contact.toLowerCase() : contact;

  const { data, error } = await supabase
    .from("replies")
    .insert({
      post_id: postId,
      nickname,
      contact: normalized,
      content,
    })
    .select("id, post_id, nickname, contact, content, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: supabaseErrorMessage(error, "回复失败，请稍后再试") },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { reply: publicReply(data as ReplyRow) },
    { status: 201 },
  );
}
