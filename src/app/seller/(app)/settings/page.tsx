import type { Metadata } from "next";
import { SellerSettingsPage } from "@/components/seller/settings-page";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SellerSettingsPage />;
}
