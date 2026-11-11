import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { SiteSidebar } from "@/components/site-sidebar";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "邦多利角色资料站",
    template: "%s | 邦多利角色资料站",
  },
  description:
    "粉丝向 BanG Dream! 角色资料图鉴：9 支乐队、45 名角色，支持按乐队、学校、年级、应援色筛选与搜索，收录队员小故事。",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "邦多利角色资料站",
    title: "邦多利角色资料站",
    description:
      "9 支乐队、45 名角色的粉丝向资料图鉴：担当、声优、生日、应援色与队员小故事。",
  },
  twitter: {
    card: "summary",
    title: "邦多利角色资料站",
    description: "9 支乐队、45 名角色的粉丝向资料图鉴。",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body
        className="min-h-screen text-slate-800 antialiased"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #fdf2f8 0%, #ffffff 42%, #eff6ff 100%)",
        }}
      >
        <AuthProvider>
          <SiteNav />
          <SiteSidebar />
          <div className="lg:pl-48">
            <main className="mx-auto w-full max-w-6xl px-4 py-8">
              {children}
            </main>
            <SiteFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
