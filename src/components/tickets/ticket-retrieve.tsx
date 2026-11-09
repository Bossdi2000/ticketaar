"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Ticket, Search, ArrowRight, ShieldCheck } from "lucide-react";
import { findTicketsByEmailOrReference, useDb } from "@/lib/store";
import type { Ticket as TicketModel } from "@/lib/types";
import { TicketStub } from "@/components/tickets/ticket-stub";
import { Field, Input } from "@/components/ui/field";
import { EmptyState } from "@/components/layout/page";

export function TicketRetrieve() {
  const db = useDb();
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [results, setResults] = useState<TicketModel[] | null>(null);
  const [searched, setSearched] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const found = findTicketsByEmailOrReference(email, reference).map(
      (ticket) => db.tickets.find((candidate) => candidate.id === ticket.id) ?? ticket,
    );
    setResults(found);
    setSearched(true);
  }

  const recent = db.tickets.slice(0, 4);

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-700">
            <Ticket className="size-7" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">Retrieve your tickets</h1>
          <p className="mt-2 text-sm text-muted">
            No account needed. Enter the email you booked with, or your booking reference, and we
            will find your tickets.
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 card-surface space-y-4 p-5">
          <Field label="Email address" htmlFor="retrieve-email" hint="Use the email on the booking">
            <Input
              id="retrieve-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field
            label="Booking reference"
            htmlFor="retrieve-ref"
            hint="Optional. Looks like TKT-XXXX-XXXX."
          >
            <Input
              id="retrieve-ref"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="TKT-A1B2-C3D4"
              className="font-mono"
            />
          </Field>
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700"
          >
            <Search className="size-4" />
            Find my tickets
          </button>
          <p className="flex items-center justify-center gap-1.5 text-[0.7rem] text-muted">
            <ShieldCheck className="size-3.5" />
            We only show tickets that match what you entered.
          </p>
        </form>

        {searched ? (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-ink">
              {results && results.length > 0 ? `${results.length} ticket found` : "No tickets found"}
            </h2>
            {results && results.length > 0 ? (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {results.map((ticket) => (
                  <TicketStub key={ticket.id} ticket={ticket} compact />
                ))}
              </div>
            ) : (
              <div className="mt-3">
                <EmptyState
                  icon={<Mail className="size-6" />}
                  title="Nothing matches that yet"
                  description="Check the email spelling or use the booking reference from your confirmation email. If you never received it, contact support and we will resend."
                  action={
                    <Link
                      href="/contact"
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white"
                    >
                      Contact support
                      <ArrowRight className="size-4" />
                    </Link>
                  }
                />
              </div>
            )}
          </div>
        ) : null}

        {!searched && recent.length > 0 ? (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Tickets on this device</h2>
              <Link href="/tickets" className="text-sm font-semibold text-brand-700 hover:underline">
                View all
              </Link>
            </div>
            <p className="mt-1 text-xs text-muted">
              Bookings made in this browser appear here automatically.
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {recent.map((ticket) => (
                <TicketStub key={ticket.id} ticket={ticket} compact />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
