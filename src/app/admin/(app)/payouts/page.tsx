import type { Metadata } from "next";
import { AdminPayouts } from "@/components/admin/admin-payouts";

export const metadata: Metadata = { title: "Payouts" };

export default function Page() {
  return <AdminPayouts />;
}
