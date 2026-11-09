export type Category =
  | "Music"
  | "Concerts"
  | "Comedy"
  | "Sports"
  | "Business"
  | "Education"
  | "Conferences"
  | "Festivals"
  | "Religious"
  | "Parties"
  | "Other";

export type EventStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "cancelled"
  | "completed";

export type TicketKind = "general" | "early-bird" | "vip" | "vvip" | "table";

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sold: number;
  maxPerCustomer: number;
  salesStart: string;
  salesEnd: string;
  kind: TicketKind;
}

export interface Organizer {
  id: string;
  name: string;
  verified: boolean;
  events?: number;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  category: Category;
  description: string;
  terms: string;
  cover: string;
  gallery: string[];
  startDate: string;
  endDate: string;
  timezone: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  country: string;
  online: boolean;
  onlineUrl?: string;
  organizer: Organizer;
  ticketTypes: TicketType[];
  status: EventStatus;
  featured: boolean;
  trending: boolean;
  transfersEnabled: boolean;
  refundPolicy: string;
  createdAt: string;
}

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface BuyerDetails {
  name: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  reference: string;
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  buyer: BuyerDetails;
  attendees?: { name: string; email: string }[];
  items: OrderItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export type TicketStatus = "valid" | "used" | "refunded" | "transferred";

export interface Ticket {
  id: string;
  code: string;
  orderId: string;
  orderReference: string;
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  attendeeName: string;
  attendeeEmail: string;
  status: TicketStatus;
  purchasedAt: string;
  checkedInAt?: string;
  transferredTo?: { name: string; email: string; at: string };
}

export type RefundStatus = "pending" | "approved" | "rejected" | "processed";

export interface RefundRequest {
  id: string;
  reference: string;
  orderReference: string;
  email: string;
  ticketCodes: string[];
  reason: string;
  explanation: string;
  status: RefundStatus;
  createdAt: string;
}

export interface CartLine {
  ticketTypeId: string;
  quantity: number;
}

export interface Cart {
  eventSlug: string;
  lines: CartLine[];
}
