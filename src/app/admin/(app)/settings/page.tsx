import type { Metadata } from "next";
import { AdminSettings } from "@/components/admin/admin-settings";

export const metadata: Metadata = { title: "Platform Settings" };

export default function Page() {
  return <AdminSettings />;
}
