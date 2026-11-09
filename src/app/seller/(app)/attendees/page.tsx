import type { Metadata } from "next";
import { AttendeesPage } from "@/components/seller/attendees-page";

export const metadata: Metadata = { title: "Attendees" };

export default function Page() {
  return <AttendeesPage />;
}
