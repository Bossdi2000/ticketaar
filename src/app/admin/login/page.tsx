import type { Metadata } from "next";
import { AdminLogin } from "@/components/auth/admin-login";

export const metadata: Metadata = { title: "Administrator Login" };

export default function Page() {
  return <AdminLogin />;
}
