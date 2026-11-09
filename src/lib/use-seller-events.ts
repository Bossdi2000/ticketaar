"use client";

import { useMemo } from "react";
import { EVENTS } from "@/lib/seed/events";
import { SELLER_EVENT_EXTRAS } from "@/lib/seed/seller";
import { useDb } from "@/lib/store";
import type { EventItem } from "@/lib/types";

export function useAllEvents(): EventItem[] {
  const db = useDb();
  return useMemo(() => {
    const base = [...EVENTS, ...SELLER_EVENT_EXTRAS];
    const overrides = new Map(db.sellerEvents.map((event) => [event.id, event]));
    const merged = base.map((event) => overrides.get(event.id) ?? event);
    const added = db.sellerEvents.filter(
      (event) => !base.some((candidate) => candidate.id === event.id),
    );
    return [...added, ...merged];
  }, [db.sellerEvents]);
}

export function useSellerEvents(): EventItem[] {
  const db = useDb();
  return useMemo(() => {
    const base = [
      ...EVENTS.filter((event) => event.organizer.id === "org-pulse"),
      ...SELLER_EVENT_EXTRAS,
    ];
    const overrides = new Map(db.sellerEvents.map((event) => [event.id, event]));
    const merged = base.map((event) => overrides.get(event.id) ?? event);
    const added = db.sellerEvents.filter(
      (event) => !base.some((candidate) => candidate.id === event.id),
    );
    return [...added, ...merged];
  }, [db.sellerEvents]);
}
