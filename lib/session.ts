import { cookies } from "next/headers";
import { signToken, verifyToken, type Role } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const SESSION_COOKIE = "awasakiko_session";

const DAY = 60 * 60 * 24;
const REMEMBER_SECONDS = 15 * DAY;
const SESSION_SECONDS = 12 * 60 * 60;

export async function getSession(): Promise<{ role: Role; keyId?: string } | null> {
  const store = await cookies();
  const payload = verifyToken(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  if (payload.role === "owner") {
    return { role: "owner" };
  }

  // 管理员会话必须对应一个仍然存在的密钥；删除密钥后立即失效
  if (!payload.keyId) return null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("admin_keys")
    .select("*")
    .eq("id", payload.keyId)
    .maybeSingle();

  if (error || !data) return null;
  if ((data.status ?? "active") === "revoked") return null;

  return { role: "admin", keyId: payload.keyId };
}

export async function getRole(): Promise<"visitor" | Role> {
  const session = await getSession();
  return session?.role ?? "visitor";
}

export async function requireAdminSession(): Promise<Role | null> {
  const session = await getSession();
  return session ? session.role : null;
}

export async function requireOwnerSession(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "owner";
}

export async function setSessionCookie(
  role: Role,
  remember: boolean,
  keyId?: string,
) {
  const store = await cookies();
  const maxAge = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
  store.set(SESSION_COOKIE, signToken(role, maxAge, keyId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge } : {}),
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}
