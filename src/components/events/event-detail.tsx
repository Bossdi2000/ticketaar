"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  CalendarDays,
  MapPin,
  Clock,
  BadgeCheck,
  Minus,
  Plus,
  ShieldCheck,
  ArrowRight,
  Info,
  Users,
  Ticket as TicketIcon,
  Share2,
  Facebook,
  Twitter,
  Link2,
} from "lucide-react";
import type { EventItem } from "@/lib/types";
import { formatDate, formatTime, formatMoney, cn } from "@/lib/utils";
import { ticketsRemaining } from "@/lib/seed/events";
import { setCart } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";

export function EventDetail({ event }: { event: EventItem }) {
  const router = useRouter();
  const [selection, setSelection] = useState<Record<string, number>>({});
  const [shareOpen, setShareOpen] = useState(false);

  const lines = useMemo(
    () =>
      Object.entries(selection)
        .filter(([, quantity]) => quantity > 0)
        .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity })),
    [selection],
  );

  const subtotal = lines.reduce((sum, line) => {
    const type = event.ticketTypes.find((candidate) => candidate.id === line.ticketTypeId);
    return sum + (type ? type.price * line.quantity : 0);
  }, 0);
  const serviceFee = Math.round(subtotal * 0.015);
  const totalCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  function change(ticketTypeId: string, delta: number, max: number) {
    setSelection((current) => {
      const next = Math.max(0, Math.min(max, (current[ticketTypeId] ?? 0) + delta));
      return { ...current, [ticketTypeId]: next };
    });
  }

  function proceed() {
    if (lines.length === 0) {
      toast.error("Select at least one ticket to continue");
      return;
    }
    setCart({ eventSlug: event.slug, lines });
    router.push("/checkout");
  }

  const soldOut = event.ticketTypes.every((type) => ticketsRemaining(type) <= 0);

  return (
    <div className="pb-24 lg:pb-0">
      {/* Cover */}
      <div className="relative h-64 w-full overflow-hidden bg-brand-900 sm:h-80 lg:h-[26rem]">
        <Image
          src={event.cover}
          alt={event.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent" />
        <div className="container-page absolute inset-x-0 bottom-0 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand" className="bg-white/95">
              {event.category}
            </Badge>
            {event.featured ? (
              <Badge tone="warning" className="bg-white/95">
                Featured
              </Badge>
            ) : null}
            {event.online ? (
              <Badge tone="success" className="bg-white/95">
                Online
              </Badge>
            ) : null}
          </div>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            {event.title}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-100">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {formatDate(event.startDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {formatTime(event.startDate)} – {formatTime(event.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {event.venue}, {event.city}
            </span>
          </p>
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_23rem] lg:items-start">
        {/* Main column */}
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold text-ink">About this event</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{event.description}</p>
          </section>

          <section className="card-surface p-5">
            <h2 className="text-lg font-bold text-ink">Event details</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailRow icon={CalendarDays} label="Date">
                {formatDate(event.startDate, "long")}
              </DetailRow>
              <DetailRow icon={Clock} label="Time">
                {formatTime(event.startDate)} – {formatTime(event.endDate)} ({event.timezone})
              </DetailRow>
              <DetailRow icon={MapPin} label="Venue">
                {event.venue}
                <br />
                {event.address}, {event.city}, {event.state}
              </DetailRow>
              <DetailRow icon={Share2} label="Organised by">
                <span className="flex items-center gap-1.5">
                  {event.organizer.name}
                  {event.organizer.verified ? (
                    <BadgeCheck className="size-4 text-brand-600" aria-label="Verified" />
                  ) : null}
                </span>
              </DetailRow>
            </dl>
            {event.online && event.onlineUrl ? (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-800">
                <Info className="mt-0.5 size-4 shrink-0" />
                This event can be attended online. Your join link is included in the confirmation
                email and on your ticket.
              </p>
            ) : null}
            <div className="mt-4 overflow-hidden rounded-xl border border-line">
              <div className="grid-texture flex h-32 items-center justify-center bg-brand-50 text-xs font-medium text-brand-700">
                Map preview · {event.venue}, {event.city}
              </div>
            </div>
          </section>

          <section className="card-surface p-5">
            <h2 className="text-lg font-bold text-ink">Terms and conditions</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{event.terms}</p>
            <h3 className="mt-5 text-sm font-bold text-ink">Refund policy</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{event.refundPolicy}</p>
            <h3 className="mt-5 text-sm font-bold text-ink">Ticket transfers</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {event.transfersEnabled
                ? "Transfers are enabled for this event. You can reassign a ticket to someone else up to 24 hours before the start time."
                : "Transfers are disabled for this event. Tickets are only valid for the named attendee."}
            </p>
          </section>

          <section className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-semibold text-ink">Share</span>
            <button
              type="button"
              onClick={() => setShareOpen((value) => !value)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:border-brand-200 hover:bg-brand-50"
            >
              <Share2 className="size-4" />
              Share event
            </button>
            {shareOpen ? (
              <>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:border-brand-200"
                >
                  <Twitter className="size-4" />
                  X
                </a>
                <a
                  href={`https://facebook.com/sharer/sharer.php?u=https://ticketaar.ng/events/${event.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:border-brand-200"
                >
                  <Facebook className="size-4" />
                  Facebook
                </a>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(
                      `https://ticketaar.ng/events/${event.slug}`,
                    );
                    toast.success("Event link copied");
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:border-brand-200"
                >
                  <Link2 className="size-4" />
                  Copy link
                </button>
              </>
            ) : null}
          </section>
        </div>

        {/* Ticket selector */}
        <aside className="lg:sticky lg:top-32">
          <div className="card-surface overflow-hidden">
            <div className="brand-gradient p-4 text-white">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-100">
                <TicketIcon className="size-3.5" />
                Select tickets
              </p>
              <p className="mt-1 text-sm text-brand-100">No account needed to buy.</p>
            </div>

            <div className="divide-y divide-line">
              {event.ticketTypes.map((type) => {
                const remaining = ticketsRemaining(type);
                const quantity = selection[type.id] ?? 0;
                const capped = Math.min(type.maxPerCustomer, remaining);
                const disabled = remaining === 0;
                return (
                  <div key={type.id} className={cn("p-4", disabled && "opacity-60")}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-ink">{type.name}</p>
                        <p className="mt-0.5 text-xs text-muted">{type.description}</p>
                      </div>
                      <p className="shrink-0 text-sm font-extrabold text-brand-700">
                        {type.price === 0 ? "Free" : formatMoney(type.price)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-muted">
                        {disabled ? (
                          <span className="font-semibold text-danger">Sold out</span>
                        ) : (
                          <>
                            {remaining} left · max {type.maxPerCustomer} per order
                          </>
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => change(type.id, -1, capped)}
                          disabled={quantity === 0}
                          className="grid size-8 place-items-center rounded-lg border border-line text-ink transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:opacity-40"
                          aria-label={`Remove one ${type.name}`}
                        >
                          <Minus className="size-4" />
                        </button>
                        <span
                          className="w-6 text-center text-sm font-bold text-ink tabular"
                          aria-live="polite"
                        >
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => change(type.id, 1, capped)}
                          disabled={disabled || quantity >= capped}
                          className="grid size-8 place-items-center rounded-lg border border-line text-ink transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:opacity-40"
                          aria-label={`Add one ${type.name}`}
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 border-t border-line bg-brand-50/50 p-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="tabular">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Service fee (1.5%)</span>
                <span className="tabular">{formatMoney(serviceFee)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold text-ink">
                <span>Total</span>
                <span className="tabular">{formatMoney(subtotal + serviceFee)}</span>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={proceed}
                disabled={soldOut}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white shadow-brand transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                {soldOut ? "Sold out" : totalCount > 0 ? `Get ${totalCount} ticket${totalCount === 1 ? "" : "s"}` : "Get Tickets"}
                {!soldOut ? <ArrowRight className="size-4" /> : null}
              </button>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[0.7rem] text-muted">
                <ShieldCheck className="size-3.5" />
                Secured by Paystack · Instant QR delivery
              </p>
            </div>
          </div>

          <div className="mt-4 card-surface p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <Users className="size-4 text-brand-600" />
              {Math.max(...event.ticketTypes.map((t) => t.sold))} people are going
            </p>
            <p className="mt-1 text-xs text-muted">
              Organiser: {event.organizer.name} · {event.organizer.events ?? 0} events hosted
            </p>
            <Link
              href="/refund-request"
              className="mt-3 block text-xs font-semibold text-brand-700 hover:underline"
            >
              Need help with a booking? Request a refund
            </Link>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA — sits above the app bottom nav */}
      <div
        className="fixed inset-x-0 z-30 border-t border-pink-500/15 bg-white/95 p-3 backdrop-blur lg:hidden"
        style={{ bottom: "calc(5.25rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted">
              {totalCount > 0 ? `${totalCount} selected` : "From"}
            </p>
            <p className="truncate text-sm font-extrabold text-brand-700">
              {totalCount > 0
                ? formatMoney(subtotal + serviceFee)
                : formatMoney(Math.min(...event.ticketTypes.map((type) => type.price)))}
            </p>
          </div>
          <button
            type="button"
            onClick={proceed}
            disabled={soldOut}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl brand-gradient-pink px-6 font-semibold text-white shadow-brand transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {soldOut ? "Sold out" : totalCount > 0 ? "Checkout" : "Get Tickets"}
          </button>
        </div>
      </div>
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="size-4" />
      </span>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wider text-muted">{label}</dt>
        <dd className="mt-0.5 text-sm leading-relaxed text-ink">{children}</dd>
      </div>
    </div>
  );
}
