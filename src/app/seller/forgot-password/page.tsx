import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password";

export const metadata: Metadata = { title: "Reset Password" };

export default function Page() {
  return <ForgotPasswordForm />;
}
