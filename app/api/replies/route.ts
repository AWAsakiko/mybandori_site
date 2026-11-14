import { NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseErrorMessage } from "@/lib/supabase";
import { getAdminSession, requireUserSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f-]{36}$/i;

type ReplyRow = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type UserRow = {
  id: string;
  nickname: string;
  contact: string;
  role: string;
};

function publicReply(reply: ReplyRow, user: UserRow | undefined, isAdmin: boolean) {
  return {
    id: reply.id,
    post_id: reply.post_id,
    nickname: user?.nickname ?? "已注销用户",
    role: user?.role ?? "user",
    content: reply.content,
    created_at: reply.created_at,
    ...(isAdmin && user ? { contact: user.contact } : {}),
  };
}

async function loadUsers(ids: string[]): Promise<Map<string, UserRow>> {
  const supabase = getSupabaseAdmin();
  if (!supabase || ids.length === 0) return new Map();
  const { data } = await supabase
    .from("users")
    .select("id, nickname, contact, role")
    .in("id", Array.from(new Set(ids)));
  return new Map((data ?? []).map((row) => [String(row.id), row as UserRow]));
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

  const admin = await getAdminSession();
  const isAdmin = Boolean(admin);

  const { data, error } = await supabase
    .from("replies")
    .select("id, post_id, user_id, content, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: supabaseErrorMessage(error, "读取回复失败") },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as ReplyRow[];
  const users = await loadUsers(rows.map((row) => row.user_id));

  return NextResponse.json({
    admin: isAdmin,
    replies: rows.map((row) =>
      publicReply(row, users.get(row.user_id), isAdmin),
    ),
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

  const user = await requireUserSession();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: { post_id?: unknown; content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const postId = typeof body.post_id === "string" ? body.post_id.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!UUID_RE.test(postId)) {
    return NextResponse.json({ error: "post_id 不合法" }, { status: 400 });
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

  const { data, error } = await supabase
    .from("replies")
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
    })
    .select("id, post_id, user_id, content, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: supabaseErrorMessage(error, "回复失败，请稍后再试") },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { reply: publicReply(data as ReplyRow, { id: user.id, nickname: user.nickname, contact: user.contact, role: user.role }, false) },
    { status: 201 },
  );
}
