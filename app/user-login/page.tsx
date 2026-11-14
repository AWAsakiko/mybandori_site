import type { Metadata } from "next";
import { UserLoginForm } from "@/components/user-login-form";

export const metadata: Metadata = {
  title: "用户登录",
  robots: { index: false, follow: false },
};

export default function UserLoginPage() {
  return (
    <div data-portal className="mx-auto w-full max-w-md py-10">
      <UserLoginForm />
    </div>
  );
}
