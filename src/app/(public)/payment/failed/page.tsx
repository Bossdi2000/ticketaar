import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentFailed } from "@/components/checkout/payment-failed";

export const metadata: Metadata = { title: "Payment failed" };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page py-16 text-center text-sm text-muted">Loading…</div>}>
      <PaymentFailed />
    </Suspense>
  );
}
