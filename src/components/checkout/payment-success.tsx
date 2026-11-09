"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Download, Mail, Ticket, ArrowRight, ShieldCheck } from "lucide-react";
import { useDb } from "@/lib/store";
import { TicketStub } from "@/components/tickets/ticket-stub";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export function PaymentSuccess() {
  const params = useSearchParams();
  const reference = params.get("ref");
  const db = useDb();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const order = db.orders.find((candidate) => candidate.reference === reference);
  const tickets = db.tickets.filter((ticket) => ticket.orderReference === reference);

  if (!mounted) {
    return <div className="container-page py-16 text-center text-sm text-muted">Loading your order…</div>;
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-extrabold text-ink">Booking not found</h1>
          <p className="mt-2 text-sm text-muted">
            We could not find an order for that reference. Retrieve your tickets with your email
            instead.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <LinkButton href="/tickets/retrieve">Retrieve tickets</LinkButton>
            <LinkButton href="/events" variant="outline">
              Browse events
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-green-50 text-success">
            <CheckCircle2 className="size-8" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">
            Payment confirmed
          </h1>
          <p className="mt-2 text-sm text-muted">
            {tickets.length} ticket{tickets.length === 1 ? "" : "s"} issued for{" "}
            {order.eventTitle}. A copy has been sent to {order.buyer.email}.
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
            <ShieldCheck className="size-3.5" />
            Booking reference {order.reference}
          </p>
        </div>

        <div className="mt-6 card-surface p-5">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-muted">Event</dt>
              <dd className="mt-0.5 font-medium text-ink">{order.eventTitle}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-muted">Venue</dt>
              <dd className="mt-0.5 font-medium text-ink">{order.venue}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-muted">Buyer</dt>
              <dd className="mt-0.5 font-medium text-ink">{order.buyer.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-muted">Amount paid</dt>
              <dd className="mt-0.5 font-medium text-ink">{formatMoney(order.total)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            <Badge tone="success">Paid</Badge>
            {order.items.map((item) => (
              <Badge key={item.ticketTypeId} tone="brand">
                {item.quantity} × {item.ticketTypeName}
              </Badge>
            ))}
          </div>
        </div>

        <h2 className="mt-8 flex items-center gap-2 text-lg font-bold text-ink">
          <Ticket className="size-5 text-brand-600" />
          Your tickets
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {tickets.map((ticket) => (
            <TicketStub key={ticket.id} ticket={ticket} compact />
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <LinkButton href={`/tickets/${tickets[0]?.id ?? ""}`} className="flex-1">
            <ArrowRight className="size-4" />
            View full ticket
          </LinkButton>
          <LinkButton href="/tickets/retrieve" variant="outline" className="flex-1">
            <Mail className="size-4" />
            Resend by email
          </LinkButton>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            <Download className="size-4" />
            Download all
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Keep your QR code private. Each code is valid for one check-in only.{" "}
          <Link href="/refund-request" className="font-semibold text-brand-700 hover:underline">
            Need a refund?
          </Link>
        </p>
      </div>
    </div>
  );
}
