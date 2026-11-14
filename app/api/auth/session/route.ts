import { NextResponse } from "next/server";
import { getAdminSession, getUserSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const [admin, user] = await Promise.all([
    getAdminSession(),
    getUserSession(),
  ]);

  return NextResponse.json({
    admin: admin?.role ?? null,
    user: user ? { id: user.id, nickname: user.nickname } : null,
  });
}
