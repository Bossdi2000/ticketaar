"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, ArrowRight, ShieldCheck, Clock, Mail } from "lucide-react";
import { useDb } from "@/lib/store";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Badge, TicketStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/page";
import { LinkButton } from "@/components/ui/button";
import { TicketStub } from "@/components/tickets/ticket-stub";

export function TransfersPage() {
  const db = useDb();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="container-page py-12 text-sm text-muted">Loading transfers…</div>;
  }

  const transferable = db.tickets.filter((ticket) => ticket.status === "valid");
  const transferred = db.tickets.filter((ticket) => ticket.transferredTo);

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Transfer tickets</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Give a ticket to someone else. The ticket is reissued to them and your old QR code stops
            working immediately.
          </p>
        </div>
        <LinkButton href="/tickets" variant="outline">
          <ArrowLeftRight className="size-4" />
          All my tickets
        </LinkButton>
      </div>

      <ol className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: ArrowLeftRight, title: "Pick a ticket", body: "Only valid tickets can be transferred." },
          { icon: Mail, title: "Add the recipient", body: "Name and email of who receives it." },
          { icon: ShieldCheck, title: "New code issued", body: "Your old QR code is invalidated." },
        ].map(({ icon: Icon, title, body }, index) => (
          <li key={title} className="card-surface flex gap-3 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <Icon className="size-4" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Step {index + 1}
              </p>
              <p className="text-sm font-bold text-ink">{title}</p>
              <p className="mt-0.5 text-xs text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-ink">Eligible tickets</h2>
        {transferable.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={<ArrowLeftRight className="size-6" />}
              title="No tickets to transfer"
              description="Once you buy a ticket it appears here, ready to send to a friend."
              action={<LinkButton href="/events">Find an event</LinkButton>}
            />
          </div>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {transferable.map((ticket) => (
              <div key={ticket.id}>
                <TicketStub ticket={ticket} compact />
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="mt-2 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-600 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  Transfer this ticket
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-ink">Transfer history</h2>
        {transferred.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No transfers yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[38rem] text-left text-sm">
              <thead className="bg-brand-50/60 text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Ticket</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Recipient</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Transferred</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {transferred.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink">{ticket.eventTitle}</p>
                      <p className="text-xs text-muted">{ticket.ticketTypeName}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-ink">{ticket.transferredTo?.name}</p>
                      <p className="text-xs text-muted">{ticket.transferredTo?.email}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {ticket.transferredTo ? formatDateTime(ticket.transferredTo.at) : "—"}
                      </span>
                      <span className="mt-0.5 block">{formatDate(ticket.eventDate, "day")}</span>
                    </td>
                    <td className="px-3 py-3">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-8 flex items-start gap-2 rounded-xl border border-line bg-white p-4 text-xs leading-relaxed text-muted">
        <Badge tone="brand" className="mt-0.5 shrink-0">Note</Badge>
        Some organisers disable transfers. In that case the transfer button will not be available on
        the ticket.
      </p>
    </div>
  );
}
