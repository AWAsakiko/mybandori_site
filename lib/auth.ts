import crypto from "crypto";

export type SessionRole = "user" | "admin" | "owner";

export type SessionPayload = {
  role: SessionRole;
  exp: number;
  keyId?: string;
  userId?: string;
};

const SECRET =
  process.env.AUTH_SECRET || process.env.OWNER_PASSWORD || "dev-only-secret";

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signToken(
  role: SessionRole,
  ttlSeconds: number,
  subject: { keyId?: string; userId?: string } = {},
): string {
  const payload: SessionPayload = {
    role,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    ...(subject.keyId ? { keyId: subject.keyId } : {}),
    ...(subject.userId ? { userId: subject.userId } : {}),
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
): SessionPayload | null {
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
    if (
      payload.role !== "user" &&
      payload.role !== "admin" &&
      payload.role !== "owner"
    ) {
      return null;
    }
    if (payload.role === "user" && typeof payload.userId !== "string") {
      return null;
    }
    if (
      (payload.role === "admin" || payload.role === "owner") &&
      payload.keyId !== undefined &&
      typeof payload.keyId !== "string"
    ) {
      return null;
    }
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function verifyOwnerPassword(input: unknown): boolean {
  const expected = process.env.OWNER_PASSWORD;
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
