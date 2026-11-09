import type { Metadata } from "next";
import { RefundRequestForm } from "@/components/tickets/refund-form";

export const metadata: Metadata = { title: "Request a Refund" };

export default function Page() {
  return <RefundRequestForm />;
}
