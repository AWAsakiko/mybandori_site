import { cookies } from "next/headers";
import { signToken, verifyToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const ADMIN_COOKIE = "admin_session";
export const USER_COOKIE = "user_session";
const LEGACY_COOKIE = "awasakiko_session";

const DAY = 60 * 60 * 24;
const REMEMBER_SECONDS = 15 * DAY;
const SESSION_SECONDS = 12 * 60 * 60;

export type AdminRole = "admin" | "owner";

export type UserSession = {
  id: string;
  nickname: string;
  contact: string;
};

async function readCookie(name: string): Promise<string | undefined> {
  const store = await cookies();
  return store.get(name)?.value;
}

async function writeCookie(name: string, value: string, remember: boolean) {
  const store = await cookies();
  const maxAge = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
  store.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge } : {}),
  });
}

async function expireCookie(name: string) {
  const store = await cookies();
  store.set(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

/** 管理员 / 站主会话（admin_session） */
export async function getAdminSession(): Promise<{ role: AdminRole } | null> {
  const payload = verifyToken(await readCookie(ADMIN_COOKIE));
  if (!payload || payload.role === "user") return null;

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

  return { role: "admin" };
}

/** 普通用户会话（user_session） */
export async function getUserSession(): Promise<UserSession | null> {
  const payload = verifyToken(await readCookie(USER_COOKIE));
  if (!payload || payload.role !== "user" || !payload.userId) return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id, nickname, contact")
    .eq("id", payload.userId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: String(data.id),
    nickname: String(data.nickname),
    contact: String(data.contact),
  };
}

export async function getAdminRole(): Promise<"guest" | AdminRole> {
  const session = await getAdminSession();
  return session?.role ?? "guest";
}

export async function requireAdminSession(): Promise<AdminRole | null> {
  const session = await getAdminSession();
  return session?.role ?? null;
}

export async function requireOwnerSession(): Promise<boolean> {
  const session = await getAdminSession();
  return session?.role === "owner";
}

export async function requireUserSession(): Promise<UserSession | null> {
  return getUserSession();
}

export async function setAdminSessionCookie(
  role: AdminRole,
  remember: boolean,
  keyId?: string,
) {
  const maxAge = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
  await writeCookie(
    ADMIN_COOKIE,
    signToken(role, maxAge, { keyId }),
    remember,
  );
}

export async function setUserSessionCookie(userId: string, remember: boolean) {
  const maxAge = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
  await writeCookie(
    USER_COOKIE,
    signToken("user", maxAge, { userId }),
    remember,
  );
}

export async function clearSessionCookies() {
  await Promise.all([
    expireCookie(ADMIN_COOKIE),
    expireCookie(USER_COOKIE),
    expireCookie(LEGACY_COOKIE),
  ]);
}
