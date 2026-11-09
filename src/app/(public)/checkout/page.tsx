import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your booking. Guest checkout, no account required.",
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
