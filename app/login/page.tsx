import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "管理员登录",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div data-portal className="mx-auto w-full max-w-md py-10">
      <LoginForm />
    </div>
  );
}
