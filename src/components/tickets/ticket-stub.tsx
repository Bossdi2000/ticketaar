"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  CalendarDays,
  Download,
  MapPin,
  Send,
  Share2,
  Ticket as TicketIcon,
  Clock,
  X,
} from "lucide-react";
import type { Ticket } from "@/lib/types";
import { formatDate, formatDateTime, formatTime, formatMoney } from "@/lib/utils";
import { transferTicket } from "@/lib/store";
import { Badge, TicketStatusBadge } from "@/components/ui/badge";
import { Input, Field } from "@/components/ui/field";

export function TicketStub({ ticket, compact = false }: { ticket: Ticket; compact?: boolean }) {
  const ticketUrl = `https://ticketaar.ng/tickets/${ticket.id}`;
  return (
    <article className="print-ticket overflow-hidden rounded-2xl border border-pink-500/10 bg-white shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-hover">
      <div className="brand-gradient-pink flex items-center justify-between gap-3 p-4 text-white">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-pink-200">
            Admit one
          </p>
          <h3 className="mt-0.5 text-base font-extrabold leading-snug">{ticket.eventTitle}</h3>
        </div>
        <TicketIcon className="size-7 shrink-0 text-pink-200" aria-hidden="true" />
      </div>

      <div className="flex items-stretch">
        <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
          <div className="space-y-1.5 text-xs text-muted">
            <p className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 shrink-0" />
              {formatDate(ticket.eventDate, "long")}
            </p>
            <p className="flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0" />
              {formatTime(ticket.eventDate)}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{ticket.venue}</span>
            </p>
          </div>

          <div className="mt-3 border-t border-dashed border-line pt-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">
              Ticket type
            </p>
            <p className="text-sm font-bold text-ink">{ticket.ticketTypeName}</p>
            <p className="mt-1 truncate text-xs text-muted">{ticket.attendeeName}</p>
          </div>
        </div>

        <div className="relative flex w-[7.5rem] shrink-0 flex-col items-center justify-center gap-2 border-l border-dashed border-line p-3">
          <span className="absolute -left-2 -top-2 size-4 rounded-full bg-canvas" aria-hidden="true" />
          <span className="absolute -bottom-2 -left-2 size-4 rounded-full bg-canvas" aria-hidden="true" />
          <div className="rounded-lg border border-line bg-white p-1.5">
            <QRCodeSVG value={ticketUrl} size={compact ? 72 : 88} level="M" />
          </div>
          <p className="w-full break-all text-center font-mono text-[0.55rem] leading-tight text-muted">
            {ticket.code}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line bg-brand-50/50 px-4 py-2.5">
        <TicketStatusBadge status={ticket.status} />
        <span className="text-[0.7rem] text-muted">
          Booking {ticket.orderReference}
        </span>
      </div>
    </article>
  );
}

export function TicketActions({ ticket }: { ticket: Ticket }) {
  const [transferOpen, setTransferOpen] = useState(false);
  const [recipient, setRecipient] = useState({ name: "", email: "" });
  const printRef = useRef<HTMLDivElement>(null);

  function download() {
    window.print();
  }

  function share() {
    const url = `https://ticketaar.ng/tickets/${ticket.id}`;
    if (navigator.share) {
      void navigator
        .share({ title: ticket.eventTitle, text: "My Ticketaar ticket", url })
        .catch(() => undefined);
      return;
    }
    void navigator.clipboard?.writeText(url);
    toast.success("Ticket link copied");
  }

  function confirmTransfer() {
    if (!recipient.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
      toast.error("Enter the recipient's name and a valid email");
      return;
    }
    transferTicket(ticket.id, {
      name: recipient.name.trim(),
      email: recipient.email.trim(),
    });
    setTransferOpen(false);
    toast.success("Ticket transferred. The previous code is now invalid.");
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={download}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-white text-xs font-semibold text-ink hover:border-brand-200 hover:bg-brand-50"
        >
          <Download className="size-4" />
          Download PDF
        </button>
        <button
          type="button"
          onClick={share}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-white text-xs font-semibold text-ink hover:border-brand-200 hover:bg-brand-50"
        >
          <Share2 className="size-4" />
          Share
        </button>
        <button
          type="button"
          disabled={ticket.status !== "valid"}
          onClick={() => setTransferOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-white text-xs font-semibold text-ink hover:border-brand-200 hover:bg-brand-50 disabled:opacity-50"
        >
          <Send className="size-4" />
          Transfer
        </button>
        <Link
          href="/refund-request"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-white text-xs font-semibold text-ink hover:border-brand-200 hover:bg-brand-50"
        >
          Refund
        </Link>
      </div>

      {transferOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setTransferOpen(false)}
            aria-label="Close transfer dialog"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-title"
            className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-glow-hover"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 id="transfer-title" className="text-lg font-bold text-ink">
                  Transfer this ticket
                </h2>
                <p className="mt-1 text-sm text-muted">
                  The ticket is reissued to the recipient and your code stops working.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTransferOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-muted hover:bg-brand-50"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <Field label="Recipient name" required htmlFor="recipient-name">
                <Input
                  id="recipient-name"
                  value={recipient.name}
                  onChange={(input) => setRecipient({ ...recipient, name: input.target.value })}
                  placeholder="Chidi Nwosu"
                />
              </Field>
              <Field label="Recipient email" required htmlFor="recipient-email">
                <Input
                  id="recipient-email"
                  type="email"
                  value={recipient.email}
                  onChange={(input) => setRecipient({ ...recipient, email: input.target.value })}
                  placeholder="chidi@example.com"
                />
              </Field>
              <div className="rounded-xl bg-brand-50 p-3 text-xs text-brand-800">
                <p className="font-semibold">Before you continue</p>
                <p className="mt-0.5">
                  Transfers cannot be reversed. The recipient receives a new ticket number and QR
                  code by email.
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTransferOpen(false)}
                  className="h-11 flex-1 rounded-xl border border-line text-sm font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmTransfer}
                  className="h-11 flex-1 rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Transfer ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="hidden" ref={printRef} />
    </>
  );
}

export function TicketMeta({ ticket }: { ticket: Ticket }) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-xs font-bold uppercase tracking-wider text-muted">Ticket number</dt>
        <dd className="mt-0.5 font-mono text-sm text-ink">{ticket.code}</dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wider text-muted">Booking reference</dt>
        <dd className="mt-0.5 font-mono text-sm text-ink">{ticket.orderReference}</dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wider text-muted">Attendee</dt>
        <dd className="mt-0.5 text-ink">{ticket.attendeeName}</dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wider text-muted">Ticket type</dt>
        <dd className="mt-0.5 text-ink">{ticket.ticketTypeName}</dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wider text-muted">Purchased</dt>
        <dd className="mt-0.5 text-ink">{formatDateTime(ticket.purchasedAt)}</dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wider text-muted">Price paid</dt>
        <dd className="mt-0.5 text-ink">
          {ticket.price === 0 ? "Free" : formatMoney(ticket.price)}
        </dd>
      </div>
    </dl>
  );
}

export function TicketStatusNote({ ticket }: { ticket: Ticket }) {
  if (ticket.status === "used") {
    return (
      <Badge tone="neutral">
        Checked in {ticket.checkedInAt ? formatDateTime(ticket.checkedInAt) : ""}
      </Badge>
    );
  }
  if (ticket.status === "transferred") {
    return <Badge tone="warning">Transferred to {ticket.attendeeName}</Badge>;
  }
  if (ticket.status === "refunded") {
    return <Badge tone="danger">Refunded — not valid for entry</Badge>;
  }
  return <Badge tone="success">Valid for entry</Badge>;
}
