import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyOwnerPassword } from "@/lib/auth";
import {
  setAdminSessionCookie,
  setUserSessionCookie,
} from "@/lib/session";

export const dynamic = "force-dynamic";

const PHONE_RE = /^1[3-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isContact(value: string): boolean {
  return PHONE_RE.test(value) || EMAIL_RE.test(value);
}

function normalizeContact(value: string): string {
  return value.includes("@") ? value.toLowerCase() : value;
}

type UserRow = {
  id: string;
  contact: string;
  nickname: string;
  role: string;
};

export async function POST(req: Request) {
  let body: {
    secret?: unknown;
    contact?: unknown;
    nickname?: unknown;
    remember?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const secret = typeof body.secret === "string" ? body.secret.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
  const remember = Boolean(body.remember);

  if (!secret) {
    return NextResponse.json(
      { error: "请输入站主密码或管理员密钥" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "服务端未配置 Supabase（缺少 SUPABASE_SERVICE_ROLE_KEY）" },
      { status: 503 },
    );
  }

  let adminRole: "admin" | "owner" | null = null;
  let keyId: string | undefined;
  let userId: string | undefined;
  let userNickname = "";

  if (verifyOwnerPassword(secret)) {
    adminRole = "owner";

    const { data: owner, error: ownerError } = await supabase
      .from("users")
      .select("*")
      .eq("role", "owner")
      .limit(1)
      .maybeSingle();

    if (ownerError) {
      return NextResponse.json({ error: "登录失败，请稍后再试" }, { status: 500 });
    }

    if (!owner) {
      if (!contact || !isContact(contact) || !nickname) {
        return NextResponse.json(
          {
            error: "站主首次登录需要绑定手机号/邮箱和昵称",
            needBinding: true,
          },
          { status: 400 },
        );
      }
      if (nickname.length > 24) {
        return NextResponse.json(
          { error: "昵称不能超过 24 个字符" },
          { status: 400 },
        );
      }

      const normalized = normalizeContact(contact);
      const { data: existing, error: findError } = await supabase
        .from("users")
        .select("*")
        .eq("contact", normalized)
        .maybeSingle();

      if (findError) {
        return NextResponse.json({ error: "登录失败，请稍后再试" }, { status: 500 });
      }

      if (existing) {
        const { data: updated, error: updateError } = await supabase
          .from("users")
          .update({ role: "owner" })
          .eq("id", existing.id)
          .select("*")
          .single();
        if (updateError || !updated) {
          return NextResponse.json({ error: "绑定站主失败" }, { status: 500 });
        }
        userId = String(updated.id);
        userNickname = String(updated.nickname);
      } else {
        const { data: created, error: createError } = await supabase
          .from("users")
          .insert({ contact: normalized, nickname, role: "owner" })
          .select("*")
          .single();
        if (createError || !created) {
          return NextResponse.json({ error: "绑定站主失败" }, { status: 500 });
        }
        userId = String(created.id);
        userNickname = String(created.nickname);
      }
    } else {
      if (contact && normalizeContact(contact) !== owner.contact) {
        return NextResponse.json(
          { error: "手机号/邮箱与已绑定的站主账号不一致" },
          { status: 401 },
        );
      }
      userId = String(owner.id);
      userNickname = String(owner.nickname);
    }
  } else {
    const { data: key, error: keyError } = await supabase
      .from("admin_keys")
      .select("*")
      .eq("key", secret)
      .maybeSingle();

    if (keyError) {
      return NextResponse.json({ error: "校验失败，请稍后再试" }, { status: 500 });
    }
    if (!key || (key.status ?? "active") === "revoked") {
      return NextResponse.json({ error: "管理员密钥无效或已被撤销" }, { status: 401 });
    }

    adminRole = "admin";
    keyId = String(key.id);
    const boundContact = key.bound_contact ? String(key.bound_contact) : "";
    const boundNickname = key.bound_nickname ? String(key.bound_nickname) : "";

    if (boundContact) {
      if (!contact) {
        return NextResponse.json(
          {
            error: "请输入该管理员密钥已绑定的手机号/邮箱",
            needContact: true,
          },
          { status: 400 },
        );
      }
      if (normalizeContact(contact) !== boundContact) {
        return NextResponse.json(
          { error: "该管理员密钥已绑定其他手机号/邮箱，不能顶替" },
          { status: 401 },
        );
      }

      const { data: user, error: findError } = await supabase
        .from("users")
        .select("*")
        .eq("contact", boundContact)
        .maybeSingle();

      if (findError) {
        return NextResponse.json({ error: "登录失败，请稍后再试" }, { status: 500 });
      }

      if (user) {
        const role = user.role === "owner" ? "owner" : "admin";
        if (user.role !== role) {
          await supabase.from("users").update({ role }).eq("id", user.id);
        }
        userId = String(user.id);
        userNickname = String(user.nickname);
      } else {
        const fallbackNickname = boundNickname || nickname;
        if (!fallbackNickname) {
          return NextResponse.json(
            { error: "绑定信息缺失，请联系站主重新生成管理员密钥" },
            { status: 500 },
          );
        }
        const { data: created, error: createError } = await supabase
          .from("users")
          .insert({
            contact: boundContact,
            nickname: fallbackNickname,
            role: "admin",
          })
          .select("*")
          .single();
        if (createError || !created) {
          return NextResponse.json({ error: "登录失败，请稍后再试" }, { status: 500 });
        }
        userId = String(created.id);
        userNickname = String(created.nickname);
      }
    } else {
      if (!contact || !isContact(contact) || !nickname) {
        return NextResponse.json(
          {
            error: "管理员首次登录需要绑定手机号/邮箱和昵称",
            needBinding: true,
          },
          { status: 400 },
        );
      }
      if (nickname.length > 24) {
        return NextResponse.json(
          { error: "昵称不能超过 24 个字符" },
          { status: 400 },
        );
      }

      const normalized = normalizeContact(contact);
      const { data: existing, error: findError } = await supabase
        .from("users")
        .select("*")
        .eq("contact", normalized)
        .maybeSingle();

      if (findError) {
        return NextResponse.json({ error: "登录失败，请稍后再试" }, { status: 500 });
      }

      let finalNickname = nickname;
      if (existing) {
        const role = existing.role === "owner" ? "owner" : "admin";
        if (existing.role !== role) {
          await supabase.from("users").update({ role }).eq("id", existing.id);
        }
        userId = String(existing.id);
        userNickname = String(existing.nickname);
        finalNickname = String(existing.nickname);
      } else {
        const { data: created, error: createError } = await supabase
          .from("users")
          .insert({ contact: normalized, nickname, role: "admin" })
          .select("*")
          .single();
        if (createError || !created) {
          return NextResponse.json({ error: "登录失败，请稍后再试" }, { status: 500 });
        }
        userId = String(created.id);
        userNickname = String(created.nickname);
        finalNickname = String(created.nickname);
      }

      const { error: bindError } = await supabase
        .from("admin_keys")
        .update({
          bound_contact: normalized,
          bound_nickname: finalNickname,
        })
        .eq("id", key.id);
      if (bindError) {
        return NextResponse.json({ error: "绑定管理员密钥失败" }, { status: 500 });
      }
    }
  }

  if (!adminRole || !userId) {
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }

  await setAdminSessionCookie(adminRole, remember, keyId);
  await setUserSessionCookie(userId, remember);

  return NextResponse.json({
    role: adminRole,
    user: { id: userId, nickname: userNickname },
  });
}
