import crypto from "crypto";

export type Role = "admin" | "owner";

const SECRET =
  process.env.AUTH_SECRET || process.env.OWNER_PASSWORD || "dev-only-secret";

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signToken(role: Role, ttlSeconds = 60 * 60 * 24 * 7): string {
  const payload = {
    role,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const data = b64url(JSON.stringify(payload));
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(
  token: string | null | undefined,
): { role: Role } | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== "admin" && payload.role !== "owner") return null;
    return { role: payload.role };
  } catch {
    return null;
  }
}

export function getAuthFromRequest(
  req: Request,
): { role: Role } | null {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  return verifyToken(match[1].trim());
}

/** 管理员或站主均可 */
export function requireAdmin(
  req: Request,
): { ok: true; role: Role } | { ok: false } {
  const auth = getAuthFromRequest(req);
  if (!auth) return { ok: false };
  return { ok: true, role: auth.role };
}

/** 仅站主 */
export function requireOwner(req: Request): { ok: true } | { ok: false } {
  const auth = getAuthFromRequest(req);
  if (!auth || auth.role !== "owner") return { ok: false };
  return { ok: true };
}

export function verifyOwnerPassword(input: unknown): boolean {
  const expected = process.env.OWNER_PASSWORD;
  // 占位符视为未配置，避免误用示例密码登录
  if (
    !expected ||
    expected === "CHANGE_ME_OWNER_PASSWORD" ||
    typeof input !== "string" ||
    !input
  ) {
    return false;
  }
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function newAdminKey(): string {
  return crypto.randomBytes(18).toString("base64url");
}
