import type { Metadata } from "next";
import { PayoutsPage } from "@/components/seller/payouts-page";

export const metadata: Metadata = { title: "Payouts" };

export default function Page() {
  return <PayoutsPage />;
}
