import type { Metadata } from "next";
import { AdminNotifications } from "@/components/admin/admin-notifications";

export const metadata: Metadata = { title: "Notifications" };

export default function Page() {
  return <AdminNotifications />;
}
