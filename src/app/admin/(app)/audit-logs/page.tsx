import type { Metadata } from "next";
import { AdminAuditLogs } from "@/components/admin/admin-audit-logs";

export const metadata: Metadata = { title: "Audit Logs" };

export default function Page() {
  return <AdminAuditLogs />;
}
