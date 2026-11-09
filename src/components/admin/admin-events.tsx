"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, XCircle, Ban, CalendarDays, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAllEvents } from "@/lib/use-seller-events";
import { upsertSellerEvent, pushNotification } from "@/lib/store";
import { formatDate, formatMoney, cn } from "@/lib/utils";
import { EventStatusBadge, Badge } from "@/components/ui/badge";
import { DashboardHeader, Panel } from "@/components/dashboard/ui";
import { EmptyState } from "@/components/layout/page";
import type { EventItem, EventStatus } from "@/lib/types";

const FILTERS: { id: "all" | EventStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Draft" },
  { id: "rejected", label: "Rejected" },
  { id: "cancelled", label: "Cancelled" },
];

export function AdminEvents({ approvalsOnly = false }: { approvalsOnly?: boolean }) {
  const events = useAllEvents();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>(
    approvalsOnly ? "pending" : "all",
  );
  const [open, setOpen] = useState<EventItem | null>(null);

  const filtered = useMemo(
    () => events.filter((event) => filter === "all" || event.status === filter),
    [events, filter],
  );

  function decide(event: EventItem, status: EventStatus, message: string) {
    upsertSellerEvent({ ...event, status });
    pushNotification({
      audience: "seller",
      title: status === "published" ? "Event approved" : "Event needs attention",
      body: `${event.title} is now ${status}.`,
    });
    setOpen(null);
    toast.success(message);
  }

  return (
    <div>
      <DashboardHeader
        title={approvalsOnly ? "Event approvals" : "Events"}
        description={
          approvalsOnly
            ? "Review submitted events before they appear in the public directory."
            : "Every event on the platform, with moderation controls."
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((option) => {
          const count =
            option.id === "all"
              ? events.length
              : events.filter((event) => event.status === option.id).length;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                filter === option.id
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-line bg-white text-ink/70 hover:bg-brand-50",
              )}
            >
              {option.label}
              <span className="ml-1 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<CheckCircle2 className="size-6" />}
            title="Nothing in this queue"
            description="When sellers submit events they appear here for review."
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {filtered.map((event) => (
            <article key={event.id} className="rounded-2xl border border-line bg-white p-3 shadow-glow">
              <div className="flex gap-3">
                <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-brand-100">
                  <Image src={event.cover} alt="" fill sizes="112px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <EventStatusBadge status={event.status} />
                    <Badge tone="neutral">{event.category}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm font-bold text-ink">{event.title}</p>
                  <p className="text-xs text-muted">{event.organizer.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <CalendarDays className="size-3.5" />
                    {formatDate(event.startDate, "day")} · {event.city}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-brand-700">
                    {event.ticketTypes.length} ticket types · from{" "}
                    {formatMoney(Math.min(...event.ticketTypes.map((type) => type.price)))}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => setOpen(event)}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-xs font-semibold text-ink hover:bg-brand-50"
                >
                  <ExternalLink className="size-3.5" />
                  Review
                </button>
                {event.status !== "published" ? (
                  <button
                    type="button"
                    onClick={() => decide(event, "published", `${event.title} approved and published`)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-success px-2.5 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    <CheckCircle2 className="size-3.5" />
                    Approve
                  </button>
                ) : null}
                {event.status !== "rejected" ? (
                  <button
                    type="button"
                    onClick={() => decide(event, "rejected", `${event.title} rejected`)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-danger px-2.5 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    <XCircle className="size-3.5" />
                    Reject
                  </button>
                ) : null}
                {event.status === "published" ? (
                  <button
                    type="button"
                    onClick={() => decide(event, "cancelled", `${event.title} suspended`)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 px-2.5 text-xs font-semibold text-danger hover:bg-red-50"
                  >
                    <Ban className="size-3.5" />
                    Suspend
                  </button>
                ) : null}
                <Link
                  href={`/events/${event.slug}`}
                  className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                >
                  Public page
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-0 sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setOpen(null)}
            aria-label="Close review"
          />
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-2xl">
            <div className="relative h-40 overflow-hidden rounded-xl">
              <Image src={open.cover} alt="" fill sizes="640px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <EventStatusBadge status={open.status} />
                <p className="mt-1 text-lg font-extrabold text-white">{open.title}</p>
                <p className="text-xs text-brand-100">{open.organizer.name} · {open.city}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{open.description}</p>
            <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-muted">Date</dt>
                <dd className="font-medium text-ink">{formatDate(open.startDate, "long")}</dd>
              </div>
              <div>
                <dt className="text-muted">Venue</dt>
                <dd className="font-medium text-ink">{open.venue}, {open.city}</dd>
              </div>
              <div>
                <dt className="text-muted">Refund policy</dt>
                <dd className="font-medium text-ink">{open.refundPolicy}</dd>
              </div>
              <div>
                <dt className="text-muted">Transfers</dt>
                <dd className="font-medium text-ink">{open.transfersEnabled ? "Enabled" : "Disabled"}</dd>
              </div>
            </dl>
            <div className="mt-3 rounded-xl border border-line p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Tickets</p>
              <ul className="mt-1.5 divide-y divide-line">
                {open.ticketTypes.map((type) => (
                  <li key={type.id} className="flex justify-between py-1.5 text-xs">
                    <span className="text-ink">{type.name} · {type.quantity} available</span>
                    <span className="font-semibold text-brand-700">{formatMoney(type.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => decide(open, "published", `${open.title} approved and published`)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-success text-sm font-semibold text-white hover:bg-green-700"
              >
                <CheckCircle2 className="size-4" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => decide(open, "rejected", `${open.title} rejected`)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-danger text-sm font-semibold text-white hover:bg-red-700"
              >
                <XCircle className="size-4" />
                Reject
              </button>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line px-4 text-sm font-semibold text-ink hover:bg-brand-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <Panel title="Moderation policy">
          <p className="text-sm leading-relaxed text-muted">
            Only events with status <strong className="text-ink">published</strong> appear in the
            public directory. Rejected events notify the organiser with a reason so they can resubmit.
            Suspending a published event hides it immediately but does not void tickets already sold.
          </p>
        </Panel>
      </div>
    </div>
  );
}
