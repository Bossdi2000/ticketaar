import type { Metadata } from "next";
import { SellerProfilePage } from "@/components/seller/profile-page";

export const metadata: Metadata = { title: "Profile" };

export default function Page() {
  return <SellerProfilePage />;
}
