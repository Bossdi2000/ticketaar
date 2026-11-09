import type { Metadata } from "next";
import { EventWizard } from "@/components/seller/event-wizard";

export const metadata: Metadata = { title: "Create Event" };

export default function Page() {
  return <EventWizard />;
}
