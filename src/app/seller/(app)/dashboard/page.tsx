import type { Metadata } from "next";
import { SellerDashboard } from "@/components/seller/dashboard-overview";

export const metadata: Metadata = { title: "Organiser Dashboard" };

export default function Page() {
  return <SellerDashboard />;
}
