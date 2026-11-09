import type { Metadata } from "next";
import { TicketList } from "@/components/tickets/ticket-list";

export const metadata: Metadata = { title: "My Tickets" };

export default function Page() {
  return <TicketList />;
}
