"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { useDb, failOrder } from "@/lib/store";
import { LinkButton } from "@/components/ui/button";

export function PaymentFailed() {
  const params = useSearchParams();
  const reference = params.get("ref");
  const db = useDb();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (reference) {
      const order = db.orders.find((candidate) => candidate.reference === reference);
      if (order && order.status === "pending") failOrder(order.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const order = db.orders.find((candidate) => candidate.reference === reference);

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-red-50 text-danger">
          <XCircle className="size-8" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">Payment failed</h1>
        <p className="mt-2 text-sm text-muted">
          The payment was not completed, so no tickets were issued and you were not charged.
          {order ? ` Reference ${order.reference}.` : ""}
        </p>

        <div className="mt-6 rounded-xl border border-line bg-white p-4 text-left text-sm">
          <p className="font-semibold text-ink">What you can do</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-muted">
            <li>Try a different card or payment method.</li>
            <li>Check that your bank has not blocked the transaction.</li>
            <li>Return to the event and select your tickets again.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <LinkButton href="/events" className="flex-1">
            <RefreshCw className="size-4" />
            Try again
          </LinkButton>
          <LinkButton href="/contact" variant="outline" className="flex-1">
            <ArrowLeft className="size-4" />
            Contact support
          </LinkButton>
        </div>

        <p className="mt-6 text-xs text-muted">
          Already paid and seeing this?{" "}
          <Link href="/tickets/retrieve" className="font-semibold text-brand-700 hover:underline">
            Retrieve your tickets
          </Link>
        </p>
      </div>
      {mounted ? null : null}
    </div>
  );
}
