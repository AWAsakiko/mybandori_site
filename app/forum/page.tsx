import type { Metadata } from "next";
import { ForumClient } from "@/components/forum-client";

export const metadata: Metadata = {
  title: "论坛",
  description: "邦多利角色资料站论坛：留言、分享与讨论。",
};

export default function ForumPage() {
  return <ForumClient />;
}
