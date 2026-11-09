"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, CalendarX2, MapPin } from "lucide-react";
import { EVENTS, CATEGORIES, startingPrice } from "@/lib/seed/events";
import type { Category } from "@/lib/types";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/layout/page";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

const SORTS = [
  { value: "popular", label: "Most popular" },
  { value: "upcoming", label: "Upcoming first" },
  { value: "newest", label: "Newest added" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
] as const;

const PRICE_BANDS = [
  { value: "all", label: "Any price" },
  { value: "free", label: "Free only" },
  { value: "under-20", label: "Under ₦20,000" },
  { value: "20-60", label: "₦20,000 – ₦60,000" },
  { value: "above-60", label: "Above ₦60,000" },
] as const;

const DATE_BANDS = [
  { value: "all", label: "Any date" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "next-month", label: "Next 60 days" },
] as const;

export function EventExplorer() {
  const params = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [price, setPrice] = useState(params.get("price") ?? "all");
  const [date, setDate] = useState("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>(
    (params.get("sort") as (typeof SORTS)[number]["value"]) ?? "popular",
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (city) next.set("city", city);
    if (category) next.set("category", category);
    if (price !== "all") next.set("price", price);
    if (sort !== "popular") next.set("sort", sort);
    const suffix = next.toString();
    router.replace(suffix ? `/events?${suffix}` : "/events", { scroll: false });
  }, [query, city, category, price, sort, router]);

  const cities = useMemo(
    () => [...new Set(EVENTS.map((event) => event.city))].sort(),
    [],
  );

  const results = useMemo(() => {
    const now = Date.now();
    const normalized = query.trim().toLowerCase();

    let list = EVENTS.filter((event) => event.status === "published");

    if (normalized) {
      list = list.filter((event) =>
        [event.title, event.venue, event.city, event.description, event.organizer.name]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      );
    }
    if (city) list = list.filter((event) => event.city === city);
    if (category) list = list.filter((event) => event.category === (category as Category));

    if (price !== "all") {
      list = list.filter((event) => {
        const from = startingPrice(event);
        if (price === "free") return from === 0;
        if (price === "under-20") return from > 0 && from < 20000;
        if (price === "20-60") return from >= 20000 && from <= 60000;
        if (price === "above-60") return from > 60000;
        return true;
      });
    }

    if (date !== "all") {
      list = list.filter((event) => {
        const start = +new Date(event.startDate);
        const days = (start - now) / 86_400_000;
        if (date === "week") return days >= -1 && days <= 7;
        if (date === "month") return days >= -1 && days <= 31;
        if (date === "next-month") return days >= -1 && days <= 60;
        return true;
      });
    }

    const sorted = [...list];
    if (sort === "popular") {
      sorted.sort(
        (a, b) =>
          b.ticketTypes.reduce((sum, t) => sum + t.sold, 0) -
          a.ticketTypes.reduce((sum, t) => sum + t.sold, 0),
      );
    } else if (sort === "upcoming") {
      sorted.sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
    } else if (sort === "newest") {
      sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    } else if (sort === "price-low") {
      sorted.sort((a, b) => startingPrice(a) - startingPrice(b));
    } else {
      sorted.sort((a, b) => startingPrice(b) - startingPrice(a));
    }
    return sorted;
  }, [query, city, category, price, date, sort]);

  const activeCount = [city, category, price !== "all" ? price : "", date !== "all" ? date : ""].filter(
    Boolean,
  ).length;

  function clearAll() {
    setQuery("");
    setCity("");
    setCategory("");
    setPrice("all");
    setDate("all");
    setSort("popular");
  }

  const filters = (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">City</p>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={!city} onClick={() => setCity("")}>
            All
          </FilterChip>
          {cities.map((option) => (
            <FilterChip key={option} active={city === option} onClick={() => setCity(option)}>
              {option}
            </FilterChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Category</p>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={!category} onClick={() => setCategory("")}>
            All
          </FilterChip>
          {CATEGORIES.map((option) => (
            <FilterChip
              key={option.name}
              active={category === option.name}
              onClick={() => setCategory(option.name)}
            >
              {option.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Price</p>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_BANDS.map((band) => (
            <FilterChip
              key={band.value}
              active={price === band.value}
              onClick={() => setPrice(band.value)}
            >
              {band.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Date</p>
        <div className="flex flex-wrap gap-1.5">
          {DATE_BANDS.map((band) => (
            <FilterChip
              key={band.value}
              active={date === band.value}
              onClick={() => setDate(band.value)}
            >
              {band.label}
            </FilterChip>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-page py-5 sm:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-wider text-pink-600 lg:hidden">
            Discover
          </p>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Explore events</h1>
          <p className="mt-1 text-sm text-muted">
            {results.length} event{results.length === 1 ? "" : "s"} matching your filters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="sr-only">
            Sort events
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink focus:border-brand-500 focus:outline-none"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink lg:hidden"
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeCount > 0 ? (
              <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-[0.65rem] font-bold text-white">
                {activeCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-pink-500/15 bg-white p-2 shadow-glow sm:mt-5">
        <Search className="ml-2 size-5 shrink-0 text-muted" aria-hidden="true" />
        <label htmlFor="event-search" className="sr-only">
          Search events
        </label>
        <input
          id="event-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search event, venue, city or organiser"
          className="h-9 w-full min-w-0 bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="grid size-8 place-items-center rounded-lg text-muted hover:bg-brand-50 hover:text-brand-700"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-32 card-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-ink">Filters</p>
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  Reset
                </button>
              ) : null}
            </div>
            {filters}
          </div>
        </aside>

        <div>
          {results.length === 0 ? (
            <EmptyState
              icon={<CalendarX2 className="size-6" />}
              title="No events match those filters"
              description="Try a wider date range, a different city, or clear your filters to see everything happening."
              action={
                <button
                  type="button"
                  onClick={clearAll}
                  className="h-10 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <Stagger className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {results.map((event) => (
                <StaggerItem key={event.id}>
                  <EventCard event={event} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
            aria-label="Close filters"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-bold text-ink">Filters</p>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="grid size-9 place-items-center rounded-lg text-muted hover:bg-brand-50"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>
            {filters}
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="h-11 flex-1 rounded-xl border border-line text-sm font-semibold text-ink"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="h-11 flex-1 rounded-xl bg-brand-600 text-sm font-semibold text-white"
              >
                Show {results.length} events
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-line bg-white text-ink/70 hover:border-brand-200 hover:bg-brand-50",
      )}
    >
      {children}
    </button>
  );
}

export function ExplorerCityNote() {
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted">
      <MapPin className="size-3.5" />
      Events across Lagos, Ibadan and beyond
    </p>
  );
}
