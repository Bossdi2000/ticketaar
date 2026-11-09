import type { Metadata } from "next";
import { TransfersPage } from "@/components/tickets/transfers-page";

export const metadata: Metadata = { title: "Transfer Tickets" };

export default function Page() {
  return <TransfersPage />;
}
