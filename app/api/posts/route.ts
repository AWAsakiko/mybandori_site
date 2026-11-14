import { NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseErrorMessage } from "@/lib/supabase";
import { getAdminSession, requireUserSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type PostRow = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

type UserRow = {
  id: string;
  nickname: string;
  contact: string;
};

function publicPost(post: PostRow, user: UserRow | undefined, isAdmin: boolean) {
  return {
    id: post.id,
    nickname: user?.nickname ?? "已注销用户",
    content: post.content,
    image_url: post.image_url,
    created_at: post.created_at,
    ...(isAdmin && user ? { contact: user.contact } : {}),
  };
}

async function loadUsers(ids: string[]): Promise<Map<string, UserRow>> {
  const supabase = getSupabaseAdmin();
  if (!supabase || ids.length === 0) return new Map();
  const { data } = await supabase
    .from("users")
    .select("id, nickname, contact")
    .in("id", Array.from(new Set(ids)));
  return new Map((data ?? []).map((row) => [String(row.id), row as UserRow]));
}

/** 帖子列表：游客看不到联系方式；管理员/站主可见 */
export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "服务端未配置 Supabase（缺少 SUPABASE_SERVICE_ROLE_KEY）" },
      { status: 503 },
    );
  }

  const admin = await getAdminSession();
  const isAdmin = Boolean(admin);

  const { data, error } = await supabase
    .from("posts")
    .select("id, user_id, content, image_url, created_at")
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json(
      { error: supabaseErrorMessage(error, "读取帖子失败") },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as PostRow[];
  const users = await loadUsers(rows.map((row) => row.user_id));

  return NextResponse.json({
    admin: isAdmin,
    posts: rows.map((row) =>
      publicPost(row, users.get(row.user_id), isAdmin),
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

  let body: { content?: unknown; image_url?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  const imageUrl =
    typeof body.image_url === "string" && body.image_url.trim()
      ? body.image_url.trim()
      : null;

  if (content.length < 1 || content.length > 2000) {
    return NextResponse.json(
      { error: "内容需为 1–2000 个字符" },
      { status: 400 },
    );
  }
  if (imageUrl && !/^https:\/\/[^\s]+$/i.test(imageUrl)) {
    return NextResponse.json({ error: "图片地址不合法" }, { status: 400 });
  }

  const since = new Date(Date.now() - 60_000).toISOString();
  const { data: recent, error: recentError } = await supabase
    .from("posts")
    .select("id")
    .eq("user_id", user.id)
    .gte("created_at", since)
    .limit(1);

  if (recentError) {
    return NextResponse.json(
      { error: supabaseErrorMessage(recentError, "发送失败，请稍后再试") },
      { status: 500 },
    );
  }
  if (recent && recent.length > 0) {
    return NextResponse.json(
      { error: "同一账号 1 分钟内只能发布 1 条" },
      { status: 429 },
    );
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      content,
      image_url: imageUrl,
    })
    .select("id, user_id, content, image_url, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: supabaseErrorMessage(error, "发布失败，请稍后再试") },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { post: publicPost(data as PostRow, { id: user.id, nickname: user.nickname, contact: user.contact }, false) },
    { status: 201 },
  );
}
