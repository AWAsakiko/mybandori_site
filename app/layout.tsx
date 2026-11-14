import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { RouteBackground } from "@/components/route-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { SearchProvider } from "@/components/search-provider";
import { SiteSidebar } from "@/components/site-sidebar";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "AWAsakiko的资料站",
    template: "%s | AWAsakiko的资料站",
  },
  description:
    "AWAsakiko 的资料站：收录邦多利、明日方舟、火影忍者、学术与论坛等板块。",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "AWAsakiko的资料站",
    title: "AWAsakiko的资料站",
    description:
      "AWAsakiko 的资料站：邦多利、明日方舟、火影忍者、学术与论坛。",
  },
  twitter: {
    card: "summary",
    title: "AWAsakiko的资料站",
    description: "AWAsakiko 的资料站：邦多利、明日方舟、火影忍者、学术与论坛。",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen text-slate-800 antialiased">
        <RouteBackground />
        <SearchProvider>
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
        </SearchProvider>
      </body>
    </html>
  );
}
