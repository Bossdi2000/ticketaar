import type { Metadata } from "next";
import { EventsManager } from "@/components/seller/events-manager";

export const metadata: Metadata = { title: "My Events" };

export default function Page() {
  return <EventsManager />;
}
