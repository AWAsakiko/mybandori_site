import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-slate-200">404</p>
      <h1 className="text-xl font-semibold">页面不存在</h1>
      <p className="text-sm text-slate-500">
        你要找的角色或页面可能还没建立。
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-slate-900 px-5 py-2 text-sm text-white transition hover:bg-slate-700"
        >
          返回首页
        </Link>
        <Link
          href="/characters"
          className="rounded-full border border-slate-300 px-5 py-2 text-sm transition hover:bg-slate-100"
        >
          角色列表
        </Link>
      </div>
    </div>
  );
}
