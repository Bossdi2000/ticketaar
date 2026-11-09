import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EVENTS, findEvent } from "@/lib/seed/events";
import { EventDetail } from "@/components/events/event-detail";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return EVENTS.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const event = findEvent(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.description.slice(0, 155),
    openGraph: { images: [event.cover] },
  };
}

export default async function EventPage({ params }: { params: Params }) {
  const { slug } = await params;
  const event = findEvent(slug);
  if (!event) notFound();
  return <EventDetail event={event} />;
}
