import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password";

export const metadata: Metadata = { title: "Reset Password" };

export default function Page() {
  return <ResetPasswordForm />;
}
