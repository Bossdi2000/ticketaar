import type { Category, EventItem, TicketKind, TicketType } from "@/lib/types";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

function ticket(
  id: string,
  name: string,
  kind: TicketKind,
  price: number,
  quantity: number,
  sold: number,
  description: string,
  maxPerCustomer = 6,
): TicketType {
  return {
    id,
    name,
    description,
    price,
    quantity,
    sold,
    maxPerCustomer,
    kind,
    salesStart: "2026-09-01T09:00:00+01:00",
    salesEnd: "2026-12-20T23:59:00+01:00",
  };
}

export const CATEGORIES: { name: Category; icon: string; blurb: string }[] = [
  { name: "Music", icon: "Music", blurb: "Live bands and DJ sets" },
  { name: "Concerts", icon: "Mic2", blurb: "Big-stage headline shows" },
  { name: "Comedy", icon: "Laugh", blurb: "Stand-up and open mic nights" },
  { name: "Sports", icon: "Trophy", blurb: "Matches, races and fitness" },
  { name: "Business", icon: "Briefcase", blurb: "Summits and networking" },
  { name: "Education", icon: "GraduationCap", blurb: "Workshops and bootcamps" },
  { name: "Conferences", icon: "Presentation", blurb: "Industry gatherings" },
  { name: "Festivals", icon: "Sparkles", blurb: "Multi-day celebrations" },
  { name: "Religious", icon: "Church", blurb: "Services and conventions" },
  { name: "Parties", icon: "PartyPopper", blurb: "Nightlife and afterparties" },
  { name: "Other", icon: "CalendarDays", blurb: "Everything else worth attending" },
];

const ORG = {
  pulse: { id: "org-pulse", name: "Pulse Live Africa", verified: true, events: 1 },
};

export const EVENTS: EventItem[] = [
  {
    id: "evt-alte-beats",
    slug: "alte-beats-concert",
    title: "Altè Beats Concert",
    category: "Concerts",
    description:
      "The sound of a new generation, all on one stage. Altè Beats Concert brings together the artists reshaping Afrobeats, alté and R&B for a single electric night in Victoria Island. Expect a full live band, surprise guest appearances and a production built for the front row.",
    terms:
      "Tickets are non-refundable within 72 hours of the event. Valid ID required at entry. No outside food or drinks. Re-entry is not permitted once you leave the venue.",
    cover: img("1470229722913-7c0e2dbbafd3"),
    gallery: [
      img("1501281668745-f7f57925c3b4"),
      img("1493225457124-a3eb161ffa5f"),
      img("1459749411175-04bf5292ceea"),
    ],
    startDate: "2026-11-21T19:00:00+01:00",
    endDate: "2026-11-22T02:00:00+01:00",
    timezone: "Africa/Lagos (WAT)",
    venue: "Eko Convention Centre",
    address: "Plot 1415 Adetokunbo Ademola Street, Victoria Island",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    online: false,
    organizer: ORG.pulse,
    status: "published",
    featured: true,
    trending: true,
    transfersEnabled: true,
    refundPolicy: "Full refund up to 7 days before the event. 50% refund up to 72 hours before.",
    createdAt: "2026-09-12T10:00:00+01:00",
    ticketTypes: [
      ticket("tt-ab-early", "Early Bird", "early-bird", 15000, 200, 200, "Limited first-release access. Sold out.", 4),
      ticket("tt-ab-regular", "Regular", "general", 25000, 800, 612, "Standard standing access to the main arena.", 6),
      ticket("tt-ab-vip", "VIP Access", "vip", 65000, 150, 121, "Fast-track entry, raised platform and dedicated bar.", 4),
      ticket("tt-ab-table", "Table for 4", "table", 350000, 20, 14, "Reserved table with bottle service for four guests.", 2),
    ],
  },
];

export const TICKER_ITEMS = [
  "Tickets are live for Altè Beats Concert",
  "Secure checkout with instant QR delivery",
  "Tickets from ₦15,000 while stock lasts",
  "No account needed to buy tickets",
];

export function ticketsRemaining(tt: TicketType) {
  return Math.max(0, tt.quantity - tt.sold);
}

export function startingPrice(event: EventItem) {
  return Math.min(...event.ticketTypes.map((t) => t.price));
}

export function isSoldOut(event: EventItem) {
  return event.ticketTypes.every((t) => ticketsRemaining(t) <= 0);
}

export function findEvent(slug: string) {
  return EVENTS.find((event) => event.slug === slug);
}

export const EVENT_BY_ID = new Map(EVENTS.map((event) => [event.id, event]));
