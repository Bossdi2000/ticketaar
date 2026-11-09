import type { EventItem, TicketType } from "@/lib/types";
import type { SellerAccount } from "@/lib/store";

const img = (id: string, w = 1000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

function ticket(
  id: string,
  name: string,
  kind: TicketType["kind"],
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

export const DEMO_SELLER: SellerAccount = {
  id: "seller-demo",
  name: "Tola Adeyemi",
  email: "tola@pulselive.africa",
  organization: "Pulse Live Africa",
  phone: "+234 803 555 0119",
  verified: true,
};

export const SELLER_EVENT_EXTRAS: EventItem[] = [
  {
    id: "evt-pulse-draft",
    slug: "pulse-rooftop-sessions",
    title: "Pulse Rooftop Sessions",
    category: "Music",
    description:
      "An intimate rooftop series with three live acts and a sunset set. Capacity is deliberately small so the sound stays clean.",
    terms: "Strictly 18+. No outside drinks. Doors close at 8pm.",
    cover: img("1470225620780-dba8ba36b745"),
    gallery: [],
    startDate: "2027-01-09T17:00:00+01:00",
    endDate: "2027-01-09T23:00:00+01:00",
    timezone: "Africa/Lagos (WAT)",
    venue: "Noldor Rooftop",
    address: "4A Akin Adesola Street, Victoria Island",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    online: false,
    organizer: { id: "org-pulse", name: "Pulse Live Africa", verified: true, events: 24 },
    status: "draft",
    featured: false,
    trending: false,
    transfersEnabled: true,
    refundPolicy: "Full refund up to 7 days before the event.",
    createdAt: "2026-11-06T10:00:00+01:00",
    ticketTypes: [
      ticket("tt-prs-regular", "Regular", "general", 18000, 150, 0, "Standing access to the rooftop."),
      ticket("tt-prs-vip", "VIP Table", "vip", 120000, 12, 0, "Reserved table for four with bottle service.", 2),
    ],
  },
  {
    id: "evt-pulse-pending",
    slug: "pulse-year-end-party",
    title: "Pulse Year-End Party",
    category: "Parties",
    description:
      "The team closes the year with a members-only party: two DJs, a live percussion set and a late kitchen.",
    terms: "Members and one guest only. Strictly 21+.",
    cover: img("1519671482749-fd09be7ccebf"),
    gallery: [],
    startDate: "2026-12-30T21:00:00+01:00",
    endDate: "2026-12-31T04:00:00+01:00",
    timezone: "Africa/Lagos (WAT)",
    venue: "The Good Beach, Ikoyi",
    address: "1 Oyinkan Abayomi Drive, Ikoyi",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    online: false,
    organizer: { id: "org-pulse", name: "Pulse Live Africa", verified: true, events: 24 },
    status: "pending",
    featured: false,
    trending: false,
    transfersEnabled: true,
    refundPolicy: "Non-refundable inside 72 hours.",
    createdAt: "2026-11-05T10:00:00+01:00",
    ticketTypes: [
      ticket("tt-pyp-regular", "Regular", "general", 25000, 300, 0, "Standing entry."),
      ticket("tt-pyp-vip", "VIP Booth", "vip", 200000, 15, 0, "Booth for six with two bottles.", 1),
    ],
  },
];

export interface SaleRecord {
  id: string;
  reference: string;
  buyer: string;
  email: string;
  eventId: string;
  eventTitle: string;
  ticketType: string;
  quantity: number;
  amount: number;
  commission: number;
  status: "successful" | "pending" | "failed";
  method: "card" | "transfer" | "ussd";
  createdAt: string;
}

const BUYERS = [
  "Adaeze Okafor",
  "Chidi Nwosu",
  "Fatima Bello",
  "Emeka Obi",
  "Zainab Yusuf",
  "Tunde Bakare",
  "Ifeoma Eze",
  "Bola Ajayi",
  "Ngozi Uche",
  "Seyi Adewale",
  "Amina Garba",
  "Kelechi Okoro",
];

const EVENT_POOL = [
  { id: "evt-alte-beats", title: "Altè Beats Concert", types: ["Regular", "VIP Access", "Table for 4"] },
  { id: "evt-founders-night", title: "Founders Night Lagos", types: ["Standard", "Plus One"] },
  { id: "evt-afrobeats-live", title: "Afrobeats Live Experience", types: ["Balcony", "Stalls", "Premium Circle"] },
];

function buildSales(): SaleRecord[] {
  const records: SaleRecord[] = [];
  let seed = 17;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  for (let index = 0; index < 42; index += 1) {
    const event = EVENT_POOL[index % EVENT_POOL.length];
    const type = event.types[Math.floor(random() * event.types.length)];
    const quantity = 1 + Math.floor(random() * 4);
    const unit = type === "Table for 4" ? 350000 : type === "VIP Access" ? 65000 : type === "Plus One" ? 50000 : type === "Premium Circle" ? 95000 : type === "Stalls" ? 45000 : type === "Balcony" ? 22000 : 25000;
    const amount = unit * quantity;
    const status: SaleRecord["status"] =
      index % 17 === 0 ? "failed" : index % 11 === 0 ? "pending" : "successful";
    const daysAgo = Math.floor(random() * 26);
    const date = new Date(Date.UTC(2026, 10, 7 - Math.min(daysAgo, 6)));
    date.setUTCDate(date.getUTCDate() + (index % 20));
    records.push({
      id: `sale-${index + 1}`,
      reference: `TKT-${String(1000 + index)}-${String(7000 + index * 3)}`,
      buyer: BUYERS[index % BUYERS.length],
      email: `${BUYERS[index % BUYERS.length].split(" ")[0].toLowerCase()}@example.com`,
      eventId: event.id,
      eventTitle: event.title,
      ticketType: type,
      quantity,
      amount,
      commission: Math.round(amount * 0.075),
      status,
      method: (["card", "transfer", "ussd"] as const)[index % 3],
      createdAt: date.toISOString(),
    });
  }
  return records.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export const SALES: SaleRecord[] = buildSales();

export const PAYOUTS = [
  { id: "po-201", amount: 1250000, status: "paid", bank: "GTBank", account: "0123456789", requestedAt: "2026-10-02T10:00:00+01:00", paidAt: "2026-10-04T12:30:00+01:00" },
  { id: "po-202", amount: 880000, status: "paid", bank: "GTBank", account: "0123456789", requestedAt: "2026-10-18T10:00:00+01:00", paidAt: "2026-10-20T09:15:00+01:00" },
  { id: "po-203", amount: 640000, status: "processing", bank: "GTBank", account: "0123456789", requestedAt: "2026-11-04T10:00:00+01:00", paidAt: null },
] as const;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "buyer" | "seller" | "admin";
  status: "active" | "suspended" | "restricted";
  joinedAt: string;
  events?: number;
}

export const ADMIN_USERS: AdminUser[] = [
  { id: "u1", name: "Adaeze Okafor", email: "adaeze@example.com", phone: "+234 803 111 2233", role: "buyer", status: "active", joinedAt: "2026-09-14T10:00:00+01:00" },
  { id: "u2", name: "Tola Adeyemi", email: "tola@pulselive.africa", phone: "+234 803 555 0119", role: "seller", status: "active", joinedAt: "2026-08-02T10:00:00+01:00", events: 24 },
  { id: "u3", name: "Chidi Nwosu", email: "chidi@example.com", phone: "+234 806 222 3344", role: "buyer", status: "active", joinedAt: "2026-09-21T10:00:00+01:00" },
  { id: "u4", name: "Lanre Balogun", email: "lanre@lagosnights.ng", phone: "+234 807 333 4455", role: "seller", status: "active", joinedAt: "2026-07-11T10:00:00+01:00", events: 12 },
  { id: "u5", name: "Fatima Bello", email: "fatima@example.com", phone: "+234 809 444 5566", role: "buyer", status: "suspended", joinedAt: "2026-10-01T10:00:00+01:00" },
  { id: "u6", name: "Ifeanyi Eze", email: "ifeanyi@starlight.ng", phone: "+234 810 555 6677", role: "seller", status: "restricted", joinedAt: "2026-06-19T10:00:00+01:00", events: 5 },
  { id: "u7", name: "Zainab Yusuf", email: "zainab@example.com", phone: "+234 811 666 7788", role: "buyer", status: "active", joinedAt: "2026-10-12T10:00:00+01:00" },
  { id: "u8", name: "Ngozi Uche", email: "ngozi@example.com", phone: "+234 812 777 8899", role: "buyer", status: "active", joinedAt: "2026-10-25T10:00:00+01:00" },
  { id: "u9", name: "Musa Ibrahim", email: "musa@example.com", phone: "+234 813 888 9900", role: "buyer", status: "active", joinedAt: "2026-11-01T10:00:00+01:00" },
  { id: "u10", name: "Kemi Adelakun", email: "kemi@example.com", phone: "+234 814 999 0011", role: "buyer", status: "active", joinedAt: "2026-11-03T10:00:00+01:00" },
];

export const AUDIT_LOGS = [
  { id: "a1", actor: "admin@ticketaar.ng", action: "Approved event", target: "Altè Beats Concert", at: "2026-11-07T14:22:00+01:00", ip: "102.89.33.12" },
  { id: "a2", actor: "admin@ticketaar.ng", action: "Suspended user", target: "fatima@example.com", at: "2026-11-07T11:05:00+01:00", ip: "102.89.33.12" },
  { id: "a3", actor: "admin@ticketaar.ng", action: "Changed commission rate", target: "7.0% → 7.5%", at: "2026-11-06T16:40:00+01:00", ip: "102.89.33.12" },
  { id: "a4", actor: "admin@ticketaar.ng", action: "Approved payout", target: "Payout po-202 · ₦880,000", at: "2026-11-05T09:12:00+01:00", ip: "102.89.33.12" },
  { id: "a5", actor: "admin@ticketaar.ng", action: "Rejected event", target: "Unverified warehouse party", at: "2026-11-04T18:03:00+01:00", ip: "102.89.33.12" },
  { id: "a6", actor: "system", action: "Failed admin login", target: "admin@ticketaar.ng", at: "2026-11-04T02:14:00+01:00", ip: "41.203.72.90" },
  { id: "a7", actor: "admin@ticketaar.ng", action: "Processed refund", target: "TKT-1002-7006 · ₦50,000", at: "2026-11-03T13:47:00+01:00", ip: "102.89.33.12" },
];

export const COMMISSION_RATE = 0.075;

export function sellerSales() {
  return SALES;
}

export function salesForEvent(eventId: string) {
  return SALES.filter((sale) => sale.eventId === eventId);
}

export function successfulSales() {
  return SALES.filter((sale) => sale.status === "successful");
}

export function sellerTotals() {
  const success = successfulSales();
  const gross = success.reduce((sum, sale) => sum + sale.amount, 0);
  const commission = success.reduce((sum, sale) => sum + sale.commission, 0);
  const tickets = success.reduce((sum, sale) => sum + sale.quantity, 0);
  return { gross, commission, net: gross - commission, tickets, count: success.length };
}
