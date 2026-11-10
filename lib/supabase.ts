import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * 服务端专用 Supabase 客户端（service_role）。
 * 严禁在客户端组件中引用本文件。
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    !url ||
    !key ||
    key === "REPLACE_WITH_SERVICE_ROLE_KEY" ||
    key.includes("your-service-role-key") ||
    url.includes("your-project")
  ) {
    return null;
  }
  if (!cached) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseAdmin() !== null;
}

export function supabaseErrorMessage(error: unknown, fallback: string): string {
  let msg = "";
  if (error instanceof Error) {
    msg = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    msg = String((error as { message?: unknown }).message ?? "");
  } else {
    msg = String(error ?? "");
  }
  if (/fetch failed|ENOTFOUND|ECONNRESET|ETIMEDOUT|network|getaddrinfo|connect/i.test(msg)) {
    console.error("[supabase] network error:", msg);
    return "无法连接 Supabase，请检查网络或 NEXT_PUBLIC_SUPABASE_URL";
  }
  return fallback;
}
