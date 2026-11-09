import type { Metadata } from "next";
import { TicketRetrieve } from "@/components/tickets/ticket-retrieve";

export const metadata: Metadata = {
  title: "Retrieve Tickets",
  description: "Retrieve your Ticketaar tickets by email or booking reference.",
};

export default function Page() {
  return <TicketRetrieve />;
}
