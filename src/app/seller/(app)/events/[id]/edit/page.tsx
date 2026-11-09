import type { Metadata } from "next";
import { EditEventClient } from "@/components/seller/edit-event-client";

export const metadata: Metadata = { title: "Edit Event" };

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  return <EditEventClient id={id} />;
}
