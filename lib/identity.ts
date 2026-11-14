export type Identity = {
  nickname: string;
  contact: string;
};

const LOCAL_KEY = "awasakiko_forum_identity";
const SESSION_KEY = "awasakiko_forum_identity_session";
const TTL = 30 * 24 * 60 * 60 * 1000;
export const IDENTITY_EVENT = "awasakiko:identity";

function read(key: string, withExpiry: boolean): Identity | null {
  try {
    const raw = window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      nickname?: unknown;
      contact?: unknown;
      at?: unknown;
    };
    if (typeof parsed.nickname !== "string" || typeof parsed.contact !== "string") {
      return null;
    }
    if (withExpiry) {
      if (typeof parsed.at !== "number" || Date.now() - parsed.at > TTL) {
        window.localStorage.removeItem(key);
        return null;
      }
    }
    return { nickname: parsed.nickname, contact: parsed.contact };
  } catch {
    return null;
  }
}

export function loadIdentity(): { identity: Identity; remember: boolean } | null {
  if (typeof window === "undefined") return null;

  const local = read(LOCAL_KEY, true);
  if (local) return { identity: local, remember: true };

  const session = read(SESSION_KEY, false);
  if (session) return { identity: session, remember: false };

  return null;
}

export function saveIdentity(identity: Identity, remember: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (remember) {
      window.localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify({ ...identity, at: Date.now() }),
      );
      window.sessionStorage.removeItem(SESSION_KEY);
    } else {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(identity));
      window.localStorage.removeItem(LOCAL_KEY);
    }
    window.dispatchEvent(new Event(IDENTITY_EVENT));
  } catch {
    /* ignore */
  }
}
