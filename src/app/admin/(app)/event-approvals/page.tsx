import type { Metadata } from "next";
import { AdminEvents } from "@/components/admin/admin-events";

export const metadata: Metadata = { title: "Event Approvals" };

export default function Page() {
  return <AdminEvents approvalsOnly />;
}
