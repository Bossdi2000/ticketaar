import type { Metadata } from "next";
import { VerificationPage } from "@/components/seller/verification-page";

export const metadata: Metadata = { title: "Ticket Verification" };

export default function Page() {
  return <VerificationPage />;
}
