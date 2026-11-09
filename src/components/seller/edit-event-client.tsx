"use client";

import { useSellerEvents } from "@/lib/use-seller-events";
import { EventWizard } from "@/components/seller/event-wizard";
import { DashboardHeader } from "@/components/dashboard/ui";
import { LinkButton } from "@/components/ui/button";

export function EditEventClient({ id }: { id: string }) {
  const events = useSellerEvents();
  const event = events.find((candidate) => candidate.id === id);

  if (!event) {
    return (
      <div>
        <DashboardHeader title="Event not found" description="It may have been deleted." />
        <LinkButton href="/seller/events" variant="outline">
          Back to events
        </LinkButton>
      </div>
    );
  }

  return <EventWizard mode="edit" initial={event} />;
}
