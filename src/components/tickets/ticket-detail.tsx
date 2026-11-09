"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Ticket as TicketIcon } from "lucide-react";
import { useDb } from "@/lib/store";
import { TicketStub, TicketActions, TicketMeta, TicketStatusNote } from "@/components/tickets/ticket-stub";
import { EmptyState } from "@/components/layout/page";
import { LinkButton } from "@/components/ui/button";

export function TicketDetail({ id }: { id: string }) {
  const db = useDb();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="container-page py-16 text-center text-sm text-muted">Loading ticket…</div>;
  }

  const ticket = db.tickets.find((candidate) => candidate.id === id);

  if (!ticket) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={<TicketIcon className="size-6" />}
          title="Ticket not found"
          description="This ticket does not exist on this device. Retrieve it with the email used for the booking."
          action={<LinkButton href="/tickets/retrieve">Retrieve tickets</LinkButton>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/tickets"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
        >
          <ArrowLeft className="size-4" />
          All tickets
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-extrabold text-ink">Your ticket</h1>
          <TicketStatusNote ticket={ticket} />
        </div>

        <div className="mt-4">
          <TicketStub ticket={ticket} />
        </div>

        <div className="mt-4">
          <TicketActions ticket={ticket} />
        </div>

        <div className="mt-6 card-surface p-5">
          <h2 className="text-sm font-bold text-ink">Ticket details</h2>
          <div className="mt-3">
            <TicketMeta ticket={ticket} />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 text-xs leading-relaxed text-brand-800">
          <p className="font-semibold">At the gate</p>
          <p className="mt-0.5">
            Show this QR code to be scanned. Each ticket is valid for one entry only. Screenshots
            work, but the live code is always the safest option.
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link
            href={`/events/${ticket.eventSlug}`}
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            View event details
          </Link>
        </div>
      </div>
    </div>
  );
}
