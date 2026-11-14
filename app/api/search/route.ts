import { NextResponse } from "next/server";
import { getSupabaseAdmin, supabaseErrorMessage } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type PostRow = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2 || q.length > 50) {
    return NextResponse.json({ posts: [] });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "服务端未配置 Supabase（缺少 SUPABASE_SERVICE_ROLE_KEY）" },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("posts")
    .select("id, user_id, content, created_at")
    .eq("hidden", false)
    .ilike("content", `%${q}%`)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json(
      { error: supabaseErrorMessage(error, "搜索失败") },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as PostRow[];
  const ids = Array.from(new Set(rows.map((row) => row.user_id)));
  const userMap = new Map<string, string>();
  if (ids.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, nickname")
      .in("id", ids);
    for (const user of users ?? []) {
      userMap.set(String(user.id), String(user.nickname));
    }
  }

  const response = NextResponse.json({
    posts: rows.map((row) => ({
      id: row.id,
      excerpt:
        row.content.length > 80
          ? `${row.content.slice(0, 80)}…`
          : row.content,
      nickname: userMap.get(row.user_id) ?? "已注销用户",
      created_at: row.created_at,
    })),
  });
  response.headers.set("Cache-Control", "no-store, private");
  return response;
}
