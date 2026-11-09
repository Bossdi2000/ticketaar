"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Play,
  Pause,
  Ban,
  Trash2,
  CalendarDays,
  Ticket,
  Banknote,
} from "lucide-react";
import { upsertSellerEvent, deleteSellerEvent } from "@/lib/store";
import { useSellerEvents } from "@/lib/use-seller-events";
import { formatDate, formatMoney, cn } from "@/lib/utils";
import { EventStatusBadge, Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/ui";
import { EmptyState } from "@/components/layout/page";
import type { EventItem, EventStatus } from "@/lib/types";

const FILTERS: { id: "all" | EventStatus; label: string }[] = [
  { id: "all", label: "All events" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Drafts" },
  { id: "pending", label: "Pending" },
  { id: "cancelled", label: "Cancelled" },
];

export function EventsManager() {
  const events = useSellerEvents();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return events.filter((event) => {
      if (filter !== "all" && event.status !== filter) return false;
      if (normalized && !event.title.toLowerCase().includes(normalized)) return false;
      return true;
    });
  }, [events, filter, query]);

  function setStatus(event: EventItem, status: EventStatus, message: string) {
    upsertSellerEvent({ ...event, status });
    setOpenMenu(null);
    toast.success(message);
  }

  function duplicate(event: EventItem) {
    const copy: EventItem = {
      ...event,
      id: `evt-${Date.now()}`,
      slug: `${event.slug}-copy-${Date.now().toString().slice(-4)}`,
      title: `${event.title} (copy)`,
      status: "draft",
      featured: false,
      trending: false,
      createdAt: new Date().toISOString(),
      ticketTypes: event.ticketTypes.map((type) => ({
        ...type,
        id: `${type.id}-copy-${Date.now().toString().slice(-4)}`,
        sold: 0,
      })),
    };
    upsertSellerEvent(copy);
    setOpenMenu(null);
    toast.success("Event duplicated as a draft");
  }

  function remove(event: EventItem) {
    if (event.status !== "draft") {
      toast.error("Only drafts can be deleted. Cancel a published event instead.");
      setOpenMenu(null);
      return;
    }
    deleteSellerEvent(event.id);
    setOpenMenu(null);
    toast.success("Draft deleted");
  }

  return (
    <div>
      <DashboardHeader
        title="Events"
        description="Create, publish and monitor every event you run on Ticketaar."
        actions={
          <LinkButton href="/seller/events/create" size="md">
            <Plus className="size-4" />
            Create event
          </LinkButton>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === option.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line bg-white text-ink/70 hover:border-brand-200 hover:bg-brand-50",
                )}
              >
                {option.label}
                <span className="ml-1 opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="size-4 text-muted" />
          <label htmlFor="event-search" className="sr-only">
            Search events
          </label>
          <input
            id="event-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your events"
            className="h-9 w-48 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<CalendarDays className="size-6" />}
            title="No events here yet"
            description="Create your first event and publish it in minutes. Drafts stay private until you are ready."
            action={<LinkButton href="/seller/events/create">Create an event</LinkButton>}
          />
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {filtered.map((event) => {
            const sold = event.ticketTypes.reduce((sum, type) => sum + type.sold, 0);
            const capacity = event.ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
            const revenue = event.ticketTypes.reduce(
              (sum, type) => sum + type.price * type.sold,
              0,
            );
            return (
              <article
                key={event.id}
                className="relative flex flex-col gap-3 rounded-2xl border border-line bg-white p-3 shadow-glow sm:flex-row sm:items-center"
              >
                <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl bg-brand-100 sm:h-16 sm:w-24">
                  <Image src={event.cover} alt="" fill sizes="96px" className="object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/seller/events/${event.id}`}
                      className="text-sm font-bold text-ink hover:text-brand-700"
                    >
                      {event.title}
                    </Link>
                    <EventStatusBadge status={event.status} />
                    <Badge tone="neutral">{event.category}</Badge>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {formatDate(event.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Ticket className="size-3.5" />
                      {sold}/{capacity} sold
                    </span>
                    <span className="flex items-center gap-1">
                      <Banknote className="size-3.5" />
                      {formatMoney(revenue, { compact: true })}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/seller/events/${event.id}`}
                    className="grid size-9 place-items-center rounded-lg border border-line text-muted hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                    aria-label={`View ${event.title}`}
                  >
                    <Eye className="size-4" />
                  </Link>
                  <Link
                    href={`/seller/events/${event.id}/edit`}
                    className="grid size-9 place-items-center rounded-lg border border-line text-muted hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                    aria-label={`Edit ${event.title}`}
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenu(openMenu === event.id ? null : event.id)}
                      className="grid size-9 place-items-center rounded-lg border border-line text-muted hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                      aria-label={`More actions for ${event.title}`}
                      aria-expanded={openMenu === event.id}
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                    {openMenu === event.id ? (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-10 cursor-default"
                          onClick={() => setOpenMenu(null)}
                          aria-label="Close menu"
                        />
                        <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-line bg-white p-1 shadow-glow-hover">
                          {event.status === "published" ? (
                            <MenuButton
                              icon={Pause}
                              label="Unpublish"
                              onClick={() => setStatus(event, "draft", "Event unpublished")}
                            />
                          ) : event.status === "draft" || event.status === "pending" ? (
                            <MenuButton
                              icon={Play}
                              label="Publish event"
                              onClick={() => setStatus(event, "published", "Event published")}
                            />
                          ) : null}
                          <MenuButton icon={Copy} label="Duplicate" onClick={() => duplicate(event)} />
                          <MenuButton
                            icon={Ban}
                            label="Cancel event"
                            onClick={() => setStatus(event, "cancelled", "Event cancelled")}
                          />
                          <MenuButton
                            icon={Trash2}
                            label="Delete draft"
                            danger
                            onClick={() => remove(event)}
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium hover:bg-brand-50",
        danger ? "text-danger hover:bg-red-50" : "text-ink",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
