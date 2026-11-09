import type { Metadata } from "next";
import { AdminCommissions } from "@/components/admin/admin-commissions";

export const metadata: Metadata = { title: "Commissions" };

export default function Page() {
  return <AdminCommissions />;
}
