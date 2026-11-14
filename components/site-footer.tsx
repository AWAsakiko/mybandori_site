"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";

export function SiteFooter() {
  const router = useRouter();
  const { role, ready } = useAuth();
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSecretClick = () => {
    // 已登录时不需要隐藏入口，正常使用导航栏的「退出登录」即可
    if (!ready || role !== "visitor") return;
    const next = count + 1;
    if (timer.current) clearTimeout(timer.current);
    if (next >= 5) {
      setCount(0);
      router.push("/login");
      return;
    }
    setCount(next);
    timer.current = setTimeout(() => setCount(0), 3000);
  };

  return (
    <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-400">
      <p aria-label="站主" className="mb-2 text-[11px] text-slate-400">
        站主：AWAsakiko
      </p>
      <p
        onClick={handleSecretClick}
        className="cursor-default select-none"
        title=""
      >
        © 2026 AWAsakiko · 粉丝向资料站 · 角色与素材版权归原企划方所有
      </p>
      <p className="mt-1">素材来源：萌娘百科（非商业展示），详见「关于」页</p>
    </footer>
  );
}
