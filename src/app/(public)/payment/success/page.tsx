import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentSuccess } from "@/components/checkout/payment-success";

export const metadata: Metadata = { title: "Payment confirmed" };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page py-16 text-center text-sm text-muted">Loading…</div>}>
      <PaymentSuccess />
    </Suspense>
  );
}
