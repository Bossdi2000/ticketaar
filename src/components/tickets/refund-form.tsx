"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { RotateCcw, CheckCircle2, Search, ClipboardCheck } from "lucide-react";
import { findOrderByReference, submitRefundRequest, useDb } from "@/lib/store";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { RefundStatusBadge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/layout/page";

const REASONS = [
  "I can no longer attend",
  "I bought the wrong ticket",
  "The event was cancelled or moved",
  "Duplicate charge",
  "Other",
];

export function RefundRequestForm() {
  const db = useDb();
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [explanation, setExplanation] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [looked, setLooked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const order = looked ? findOrderByReference(reference) : undefined;
  const orderTickets = order ? db.tickets.filter((ticket) => ticket.orderId === order.id) : [];
  const myRequests = db.refunds.slice(0, 5);

  function lookup() {
    if (!reference.trim()) {
      toast.error("Enter your booking reference first");
      return;
    }
    setLooked(true);
    const found = findOrderByReference(reference);
    if (!found) toast.error("No booking found for that reference");
    else if (found.buyer.email.toLowerCase() !== email.trim().toLowerCase() && email.trim()) {
      toast.error("That email does not match the booking");
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!order) next.reference = "Look up a valid booking reference";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address";
    if (selected.length === 0) next.tickets = "Select at least one ticket to refund";
    if (!explanation.trim()) next.explanation = "Tell us briefly why you want a refund";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    submitRefundRequest({
      reference: order!.reference,
      email: email.trim(),
      ticketCodes: selected,
      reason,
      explanation: explanation.trim(),
    });
    toast.success("Refund request submitted. We review requests within 5 working days.");
    setReference("");
    setEmail("");
    setExplanation("");
    setSelected([]);
    setLooked(false);
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Request a refund</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Refunds follow the policy set by the event organiser. Submit your booking reference and
            we will review the request.
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 card-surface space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Booking reference" required htmlFor="refund-ref" error={errors.reference}>
              <Input
                id="refund-ref"
                value={reference}
                onChange={(event) => setReference(event.target.value.toUpperCase())}
                placeholder="TKT-A1B2-C3D4"
                className="font-mono"
              />
            </Field>
            <Field label="Email used for the booking" required htmlFor="refund-email" error={errors.email}>
              <Input
                id="refund-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={lookup}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-100"
          >
            <Search className="size-4" />
            Find booking
          </button>

          {looked && order ? (
            <div className="rounded-xl border border-line bg-brand-50/50 p-4">
              <p className="text-sm font-bold text-ink">{order.eventTitle}</p>
              <p className="mt-0.5 text-xs text-muted">
                {order.reference} · {order.buyer.name} · {order.items.length} ticket types
              </p>
            </div>
          ) : null}

          {orderTickets.length > 0 ? (
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-ink">
                Tickets to refund <span className="text-danger">*</span>
              </legend>
              {errors.tickets ? (
                <p className="mb-2 text-xs font-medium text-danger">{errors.tickets}</p>
              ) : null}
              <div className="space-y-2">
                {orderTickets.map((ticket) => (
                  <label
                    key={ticket.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-3 has-checked:border-brand-500 has-checked:bg-brand-50"
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-brand-600"
                      checked={selected.includes(ticket.code)}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, ticket.code]
                            : current.filter((code) => code !== ticket.code),
                        )
                      }
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-ink">
                        {ticket.ticketTypeName}
                      </span>
                      <span className="block font-mono text-[0.7rem] text-muted">{ticket.code}</span>
                    </span>
                    <span className="text-xs capitalize text-muted">{ticket.status}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reason" htmlFor="refund-reason">
              <Select id="refund-reason" value={reason} onChange={(event) => setReason(event.target.value)}>
                {REASONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Amount" htmlFor="refund-amount" hint="Calculated from the selected tickets">
              <Input id="refund-amount" readOnly value={order ? order.total : "—"} />
            </Field>
          </div>

          <Field label="Explanation" required htmlFor="refund-explanation" error={errors.explanation}>
            <Textarea
              id="refund-explanation"
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              placeholder="Give the team a little context so your request can be reviewed quickly."
            />
          </Field>

          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700"
          >
            <RotateCcw className="size-4" />
            Submit refund request
          </button>
        </form>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
            <ClipboardCheck className="size-5 text-brand-600" />
            Your refund requests
          </h2>
          {myRequests.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                icon={<RotateCcw className="size-6" />}
                title="No refund requests yet"
                description="When you submit a request it appears here with its current status."
              />
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {myRequests.map((request) => (
                <div
                  key={request.id}
                  className="card-surface flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="font-mono text-sm font-medium text-ink">
                      {request.orderReference}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {request.reason} · {request.ticketCodes.length} ticket
                      {request.ticketCodes.length === 1 ? "" : "s"} ·{" "}
                      {formatDateTime(request.createdAt)}
                    </p>
                  </div>
                  <RefundStatusBadge status={request.status} />
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-muted">
            Approved refunds are returned to the original payment method. Refunded tickets can no
            longer be used for entry.{" "}
            <Link href="/contact" className="font-semibold text-brand-700 hover:underline">
              Talk to support
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
