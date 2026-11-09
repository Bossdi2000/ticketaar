import { Suspense } from "react";
import type { Metadata } from "next";
import { EventExplorer } from "@/components/events/event-explorer";

export const metadata: Metadata = {
  title: "Explore Events",
  description:
    "Search and filter concerts, conferences, comedy nights, festivals and sports events across Nigeria.",
};

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-10">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-brand-100" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-2xl bg-brand-100/60" />
            ))}
          </div>
        </div>
      }
    >
      <EventExplorer />
    </Suspense>
  );
}
