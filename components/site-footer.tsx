"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";

export function SiteFooter() {
  const { openActivation } = useAuth();
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSecretClick = () => {
    const next = count + 1;
    if (timer.current) clearTimeout(timer.current);
    if (next >= 5) {
      setCount(0);
      openActivation("admin");
      return;
    }
    setCount(next);
    timer.current = setTimeout(() => setCount(0), 3000);
  };

  return (
    <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-400">
      <p
        onClick={handleSecretClick}
        className="cursor-default select-none"
        title=""
      >
         AWAsakiko的资料站 · 粉丝向资料站 · 角色与素材版权归原企划方所有
      </p>
      <p className="mt-1">素材来源：萌娘百科（非商业展示），详见「关于」页</p>
    </footer>
  );
}
