"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Ticket,
  Banknote,
  Users,
  Pencil,
  ExternalLink,
  Clock,
} from "lucide-react";
import { useSellerEvents } from "@/lib/use-seller-events";
import { SALES } from "@/lib/seed/seller";
import { formatDate, formatMoney, formatTime } from "@/lib/utils";
import { EventStatusBadge, Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { StatCard, Panel, ProgressBar, DashboardHeader } from "@/components/dashboard/ui";

export function SellerEventDetail({ id }: { id: string }) {
  const events = useSellerEvents();
  const event = events.find((candidate) => candidate.id === id);

  const sales = useMemo(() => SALES.filter((sale) => sale.eventId === id), [id]);

  if (!event) {
    return (
      <div>
        <DashboardHeader title="Event not found" description="It may have been deleted." />
        <LinkButton href="/seller/events" variant="outline">
          <ArrowLeft className="size-4" />
          Back to events
        </LinkButton>
      </div>
    );
  }

  const sold = event.ticketTypes.reduce((sum, type) => sum + type.sold, 0);
  const capacity = event.ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
  const revenue = event.ticketTypes.reduce((sum, type) => sum + type.price * type.sold, 0);
  const checkedIn = event.ticketTypes.reduce(
    (sum, type) => sum + Math.round(type.sold * 0.62),
    0,
  );

  return (
    <div>
      <Link
        href="/seller/events"
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand-700"
      >
        <ArrowLeft className="size-3.5" />
        All events
      </Link>

      <DashboardHeader
        title={event.title}
        description={`${event.category} · ${formatDate(event.startDate)}`}
        actions={
          <>
            <LinkButton href={`/events/${event.slug}`} variant="outline" size="md">
              <ExternalLink className="size-4" />
              Preview
            </LinkButton>
            <LinkButton href={`/seller/events/${event.id}/edit`} size="md">
              <Pencil className="size-4" />
              Edit event
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tickets sold" value={`${sold}/${capacity}`} hint={`${Math.round((sold / capacity) * 100)}% of capacity`} icon={<Ticket className="size-4" />} tone="brand" />
        <StatCard label="Revenue" value={formatMoney(revenue, { compact: true })} change={14.2} icon={<Banknote className="size-4" />} />
        <StatCard label="Checked in" value={checkedIn.toLocaleString()} hint="62% of attendees" icon={<Users className="size-4" />} />
        <StatCard label="Orders" value={String(sales.length || Math.round(sold / 2))} hint="Paid transactions" icon={<CalendarDays className="size-4" />} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Event information">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl sm:w-48">
              <Image src={event.cover} alt="" fill sizes="192px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <EventStatusBadge status={event.status} />
                <Badge tone="neutral">{event.category}</Badge>
                {event.online ? <Badge tone="success">Online</Badge> : null}
              </div>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                {event.description}
              </p>
              <dl className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-muted">
                  <CalendarDays className="size-3.5" />
                  {formatDate(event.startDate, "long")}
                </div>
                <div className="flex items-center gap-1.5 text-muted">
                  <Clock className="size-3.5" />
                  {formatTime(event.startDate)} – {formatTime(event.endDate)}
                </div>
                <div className="flex items-center gap-1.5 text-muted">
                  <MapPin className="size-3.5" />
                  {event.venue}, {event.city}
                </div>
              </dl>
            </div>
          </div>
        </Panel>

        <Panel title="Ticket performance">
          <ul className="space-y-4">
            {event.ticketTypes.map((type) => (
              <li key={type.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink">{type.name}</span>
                  <span className="text-muted">
                    {type.sold}/{type.quantity}
                  </span>
                </div>
                <ProgressBar
                  value={type.sold}
                  max={type.quantity}
                  tone={type.sold / type.quantity > 0.9 ? "warning" : "brand"}
                />
                <p className="mt-1 text-[0.7rem] text-muted">
                  {type.price === 0 ? "Free" : formatMoney(type.price)} ·{" "}
                  {formatMoney(type.price * type.sold, { compact: true })} gross
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Recent orders for this event" padded={false}>
          {sales.length === 0 ? (
            <p className="p-4 text-sm text-muted">
              No recorded orders for this event in the demo ledger yet.
            </p>
          ) : (
            <div className="divide-y divide-line">
              {sales.slice(0, 8).map((sale) => (
                <div key={sale.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{sale.buyer}</p>
                    <p className="text-xs text-muted">
                      {sale.quantity} × {sale.ticketType} · {sale.reference}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink tabular">{formatMoney(sale.amount)}</p>
                    <Badge
                      tone={
                        sale.status === "successful"
                          ? "success"
                          : sale.status === "pending"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {sale.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
