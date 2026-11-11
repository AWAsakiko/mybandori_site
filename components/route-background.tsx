"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const PINK = "linear-gradient(135deg, #fdf2f8 0%, #ffffff 42%, #eff6ff 100%)";
const BLUE = "linear-gradient(135deg, #eff6ff 0%, #ffffff 45%, #ede9fe 100%)";

/** 主站首页使用淡蓝/淡紫，其余页面保持邦多利的粉色系 */
export function RouteBackground() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.backgroundImage = pathname === "/" ? BLUE : PINK;
  }, [pathname]);

  return null;
}
