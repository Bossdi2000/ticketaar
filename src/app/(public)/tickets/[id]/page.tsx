import type { Metadata } from "next";
import { TicketDetail } from "@/components/tickets/ticket-detail";

export const metadata: Metadata = { title: "Your Ticket" };

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  return <TicketDetail id={id} />;
}
