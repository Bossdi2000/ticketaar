import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Ticket, ArrowUpRight, BadgeCheck, Clock } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { formatDate, formatMoney, formatTime, cn } from "@/lib/utils";
import { startingPrice, ticketsRemaining, isSoldOut } from "@/lib/seed/events";
import { Badge } from "@/components/ui/badge";

export function EventCard({
  event,
  className,
  variant = "grid",
}: {
  event: EventItem;
  className?: string;
  variant?: "grid" | "row" | "compact" | "tile";
}) {
  const price = startingPrice(event);
  const soldOut = isSoldOut(event);
  const remaining = event.ticketTypes.reduce((sum, t) => sum + ticketsRemaining(t), 0);
  const sold = event.ticketTypes.reduce((sum, t) => sum + t.sold, 0);
  const capacity = event.ticketTypes.reduce((sum, t) => sum + t.quantity, 0);

  if (variant === "compact") {
    return (
      <Link
        href={`/events/${event.slug}`}
        className={cn(
          "group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-brand-50",
          className,
        )}
      >
        <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-100">
          <Image src={event.cover} alt="" fill sizes="64px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink group-hover:text-brand-700">
            {event.title}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {formatDate(event.startDate, "day")} · {event.city}
          </p>
        </div>
        <span className="ml-auto text-sm font-bold text-brand-700">
          {price === 0 ? "Free" : formatMoney(price, { compact: true })}
        </span>
      </Link>
    );
  }

  /* Mobile app tile: tall poster card with date chip and pink halo */
  if (variant === "tile") {
    return (
      <Link
        href={`/events/${event.slug}`}
        className={cn(
          "group relative block w-[15.5rem] overflow-hidden rounded-2xl bg-white",
          "shadow-glow ring-1 ring-pink-500/10 transition-transform active:scale-[0.98]",
          className,
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={event.cover}
            alt=""
            fill
            sizes="248px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute left-2.5 top-2.5 rounded-lg bg-white/95 px-2 py-1 text-center leading-none backdrop-blur">
            <span className="block text-[0.6rem] font-bold uppercase tracking-wide text-brand-600">
              {new Date(event.startDate).toLocaleDateString("en-NG", { month: "short", timeZone: "Africa/Lagos" })}
            </span>
            <span className="mt-0.5 block text-sm font-extrabold text-ink">
              {new Date(event.startDate).toLocaleDateString("en-NG", { day: "numeric", timeZone: "Africa/Lagos" })}
            </span>
          </div>
          {soldOut ? (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-danger px-2 py-0.5 text-[0.6rem] font-bold text-white">
              Sold out
            </span>
          ) : remaining < 60 ? (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-warning px-2 py-0.5 text-[0.6rem] font-bold text-white">
              {remaining} left
            </span>
          ) : null}
          <p className="absolute inset-x-2.5 bottom-2.5 line-clamp-2 text-sm font-bold leading-snug text-white">
            {event.title}
          </p>
        </div>
        <div className="space-y-1 p-3">
          <p className="flex items-center gap-1 text-[0.68rem] text-muted">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{event.venue}, {event.city}</span>
          </p>
          <div className="flex items-end justify-between pt-0.5">
            <div>
              <p className="text-[0.6rem] uppercase tracking-wide text-muted">From</p>
              <p className="text-sm font-extrabold text-brand-700">
                {price === 0 ? "Free" : formatMoney(price)}
              </p>
            </div>
            <span className="rounded-lg bg-brand-600 px-2.5 py-1 text-[0.65rem] font-bold text-white">
              Get ticket
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <Link
        href={`/events/${event.slug}`}
        className={cn(
          "group flex flex-col gap-4 rounded-2xl border border-pink-500/10 bg-white p-3 shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-glow-hover sm:flex-row",
          className,
        )}
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-brand-100 sm:aspect-square sm:w-40">
          <Image
            src={event.cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 160px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col py-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge tone="brand">{event.category}</Badge>
              <h3 className="mt-2 line-clamp-2 text-base font-bold text-ink group-hover:text-brand-700">
                {event.title}
              </h3>
            </div>
            {event.organizer.verified ? (
              <BadgeCheck className="size-5 shrink-0 text-brand-600" aria-label="Verified organiser" />
            ) : null}
          </div>
          <div className="mt-2 space-y-1 text-sm text-muted">
            <p className="flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0" />
              {formatDate(event.startDate)} · {event.city}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" />
              {event.venue}
            </p>
          </div>
          <div className="mt-auto flex items-end justify-between pt-3">
            <p className="text-sm text-muted">
              From{" "}
              <span className="text-base font-bold text-brand-700">
                {price === 0 ? "Free" : formatMoney(price)}
              </span>
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
              View details
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-pink-500/10 bg-white shadow-glow transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-hover",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-100">
        <Image
          src={event.cover}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <Badge tone="brand" className="bg-white/95 backdrop-blur">
            {event.category}
          </Badge>
          {soldOut ? (
            <Badge tone="danger" className="bg-white/95 backdrop-blur">
              Sold out
            </Badge>
          ) : remaining < 60 ? (
            <Badge tone="warning" className="bg-white/95 backdrop-blur">
              {remaining} left
            </Badge>
          ) : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="rounded-lg bg-white/95 px-2 py-1 text-[0.7rem] font-bold text-brand-800 backdrop-blur">
            {formatDate(event.startDate, "day")}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-ink group-hover:text-brand-700">
          {event.title}
        </h3>
        <div className="mt-2 space-y-1 text-xs text-muted">
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {event.venue}, {event.city}
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" />
            {formatDate(event.startDate)} · {formatTime(event.startDate)}
          </p>
        </div>

        <div className="mt-2.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full brand-gradient-pink"
              style={{ width: `${Math.min(100, Math.round((sold / capacity) * 100))}%` }}
            />
          </div>
          <p className="mt-1 text-[0.68rem] text-muted">
            {sold.toLocaleString()} of {capacity.toLocaleString()} tickets claimed
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-line pt-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-wide text-muted">From</p>
            <p className="text-base font-extrabold text-brand-700">
              {price === 0 ? "Free" : formatMoney(price)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
            <Ticket className="size-3.5" />
            Get tickets
          </span>
        </div>
      </div>
    </Link>
  );
}
