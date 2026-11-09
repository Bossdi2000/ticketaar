import type { Metadata } from "next";
import { SellerLoginForm } from "@/components/auth/seller-login";

export const metadata: Metadata = { title: "Organiser Login" };

export default function Page() {
  return <SellerLoginForm />;
}
