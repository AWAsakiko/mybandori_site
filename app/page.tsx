import type { Metadata } from "next";
import { HomeSections } from "@/components/home-sections";

export const metadata: Metadata = {
  title: { absolute: "主站" },
  description:
    "邦多利、明日方舟、火影忍者、学术与论坛的聚合资料站。",
  openGraph: {
    title: "主站",
    description:
      "邦多利、明日方舟、火影忍者、学术与论坛的聚合资料站。",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "主站",
    description:
      "邦多利、明日方舟、火影忍者、学术与论坛的聚合资料站。",
  },
};

export default function HomePage() {
  return (
    <div data-portal className="space-y-8 py-4 sm:space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold sm:text-4xl">主站</h1>
        <p className="max-w-2xl leading-relaxed text-slate-600">
          欢迎来到资料站。这里汇总了邦多利、明日方舟、火影忍者、学术与论坛等板块，
          选择一个开始浏览。
        </p>
      </header>

      <HomeSections />
    </div>
  );
}
