import type { Metadata } from "next";
import { SellerRegisterForm } from "@/components/auth/seller-register";

export const metadata: Metadata = {
  title: "Become an Event Creator",
  description: "Create your Ticketaar organiser account and start selling tickets.",
};

export default function Page() {
  return <SellerRegisterForm />;
}
