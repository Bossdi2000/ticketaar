"use client";

import { useSyncExternalStore } from "react";
import type {
  BuyerDetails,
  Cart,
  EventItem,
  Order,
  OrderItem,
  RefundRequest,
  RefundStatus,
  Ticket,
} from "@/lib/types";
import { bookingReference, ticketCode } from "@/lib/utils";

export interface AppNotification {
  id: string;
  audience: "buyer" | "seller" | "admin";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface SellerAccount {
  id: string;
  name: string;
  email: string;
  organization: string;
  phone: string;
  verified: boolean;
}

export interface PayoutRequest {
  id: string;
  amount: number;
  bank: string;
  accountName: string;
  accountNumber: string;
  status: "pending" | "approved" | "processing" | "paid" | "rejected";
  requestedAt: string;
}

export interface Db {
  orders: Order[];
  tickets: Ticket[];
  refunds: RefundRequest[];
  sellerEvents: EventItem[];
  sellerSession: SellerAccount | null;
  adminSession: { email: string; name: string } | null;
  notifications: AppNotification[];
  payouts: PayoutRequest[];
  userStatuses: Record<string, "active" | "suspended" | "restricted">;
  refundStatuses: Record<string, RefundRequest["status"]>;
  payoutStatuses: Record<string, PayoutRequest["status"]>;
}

const DB_KEY = "ticketaar.db.v1";
const CART_KEY = "ticketaar.cart.v1";

const EMPTY_DB: Db = {
  orders: [],
  tickets: [],
  refunds: [],
  sellerEvents: [],
  sellerSession: null,
  adminSession: null,
  notifications: [],
  payouts: [],
  userStatuses: {},
  refundStatuses: {},
  payoutStatuses: {},
};

let dbCache: Db | null = null;
const dbListeners = new Set<() => void>();

function cloneDb(db: Db): Db {
  return {
    ...db,
    orders: [...db.orders],
    tickets: [...db.tickets],
    refunds: [...db.refunds],
    sellerEvents: [...db.sellerEvents],
    notifications: [...db.notifications],
    payouts: [...(db.payouts ?? [])],
    userStatuses: { ...(db.userStatuses ?? {}) },
    refundStatuses: { ...(db.refundStatuses ?? {}) },
    payoutStatuses: { ...(db.payoutStatuses ?? {}) },
  };
}

function readDb(): Db {
  if (dbCache) return dbCache;
  if (typeof window === "undefined") return EMPTY_DB;
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    dbCache = raw ? { ...cloneDb(EMPTY_DB), ...JSON.parse(raw) } : cloneDb(EMPTY_DB);
  } catch {
    dbCache = cloneDb(EMPTY_DB);
  }
  return dbCache as Db;
}

function commit(next: Db) {
  dbCache = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(DB_KEY, JSON.stringify(next));
    } catch {
      /* storage full or blocked */
    }
  }
  dbListeners.forEach((listener) => listener());
}

function subscribeDb(listener: () => void) {
  dbListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === DB_KEY) {
      dbCache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    dbListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDb(): Db {
  return useSyncExternalStore(subscribeDb, readDb, () => EMPTY_DB);
}

function update(fn: (db: Db) => Db) {
  commit(fn(cloneDb(readDb())));
}

export function resetDemoData() {
  commit(cloneDb(EMPTY_DB));
}

/* ------------------------------- orders ---------------------------------- */

export function createOrder(
  event: EventItem,
  items: OrderItem[],
  buyer: BuyerDetails,
  attendees?: { name: string; email: string }[],
): Order {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const serviceFee = Math.round(subtotal * 0.015);
  const order: Order = {
    id: `ord-${Date.now()}`,
    reference: bookingReference(),
    eventId: event.id,
    eventSlug: event.slug,
    eventTitle: event.title,
    eventDate: event.startDate,
    venue: `${event.venue}, ${event.city}`,
    buyer,
    attendees,
    items,
    subtotal,
    serviceFee,
    total: subtotal + serviceFee,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  update((db) => ({ ...db, orders: [order, ...db.orders] }));
  return order;
}

export function confirmOrderPayment(orderId: string) {
  const db = readDb();
  const order = db.orders.find((candidate) => candidate.id === orderId);
  if (!order || order.status === "paid") return null;

  const tickets: Ticket[] = [];
  let attendeeIndex = 0;
  order.items.forEach((item) => {
    for (let i = 0; i < item.quantity; i += 1) {
      const attendee = order.attendees?.[attendeeIndex];
      attendeeIndex += 1;
      tickets.push({
        id: `tkt-${crypto.randomUUID()}`,
        code: ticketCode(),
        orderId: order.id,
        orderReference: order.reference,
        eventId: order.eventId,
        eventSlug: order.eventSlug,
        eventTitle: order.eventTitle,
        eventDate: order.eventDate,
        venue: order.venue,
        ticketTypeId: item.ticketTypeId,
        ticketTypeName: item.ticketTypeName,
        price: item.unitPrice,
        attendeeName: attendee?.name?.trim() || order.buyer.name,
        attendeeEmail: attendee?.email?.trim() || order.buyer.email,
        status: "valid",
        purchasedAt: new Date().toISOString(),
      });
    }
  });

  update((current) => ({
    ...current,
    orders: current.orders.map((candidate) =>
      candidate.id === orderId ? { ...candidate, status: "paid" as const } : candidate,
    ),
    tickets: [...tickets, ...current.tickets],
    notifications: [
      {
        id: `ntf-${Date.now()}`,
        audience: "buyer",
        title: "Tickets are ready",
        body: `${tickets.length} ticket${tickets.length === 1 ? "" : "s"} issued for ${order.eventTitle}.`,
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        id: `ntf-${Date.now()}-seller`,
        audience: "seller",
        title: "New sale",
        body: `${order.buyer.name} bought ${tickets.length} ticket${tickets.length === 1 ? "" : "s"} for ${order.eventTitle}.`,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...current.notifications,
    ],
  }));

  return tickets;
}

export function failOrder(orderId: string) {
  update((db) => ({
    ...db,
    orders: db.orders.map((order) =>
      order.id === orderId ? { ...order, status: "failed" as const } : order,
    ),
  }));
}

export function findOrderByReference(reference: string) {
  return readDb().orders.find(
    (order) => order.reference.toLowerCase() === reference.trim().toLowerCase(),
  );
}

export function findOrderById(id: string) {
  return readDb().orders.find((order) => order.id === id);
}

/* ------------------------------- tickets --------------------------------- */

export function findTicket(id: string) {
  return readDb().tickets.find((ticket) => ticket.id === id);
}

export function ticketsForOrder(orderId: string) {
  return readDb().tickets.filter((ticket) => ticket.orderId === orderId);
}

export function transferTicket(ticketId: string, recipient: { name: string; email: string }) {
  update((db) => ({
    ...db,
    tickets: db.tickets.map((ticket) =>
      ticket.id === ticketId
        ? {
            ...ticket,
            status: "transferred" as const,
            attendeeName: recipient.name,
            attendeeEmail: recipient.email,
            code: ticketCode(),
            transferredTo: { ...recipient, at: new Date().toISOString() },
          }
        : ticket,
    ),
    notifications: [
      {
        id: `ntf-${Date.now()}`,
        audience: "buyer",
        title: "Ticket transferred",
        body: `Your ticket for ${ticketId} was transferred to ${recipient.name}. The previous code is now invalid.`,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...db.notifications,
    ],
  }));
}

export function checkInTicket(code: string) {
  const db = readDb();
  const ticket = db.tickets.find(
    (candidate) => candidate.code.toLowerCase() === code.trim().toLowerCase(),
  );
  if (!ticket) return { result: "invalid" as const };
  if (ticket.status === "used") return { result: "used" as const, ticket };
  if (ticket.status === "refunded" || ticket.status === "transferred") {
    return { result: "invalid" as const, ticket };
  }
  update((current) => ({
    ...current,
    tickets: current.tickets.map((candidate) =>
      candidate.id === ticket.id
        ? { ...candidate, status: "used" as const, checkedInAt: new Date().toISOString() }
        : candidate,
    ),
  }));
  return { result: "valid" as const, ticket };
}

export function findTicketsByEmailOrReference(email: string, reference: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRef = reference.trim().toLowerCase();
  const db = readDb();
  return db.tickets.filter(
    (ticket) =>
      (normalizedEmail &&
        (ticket.attendeeEmail.toLowerCase() === normalizedEmail ||
          db.orders.find((order) => order.id === ticket.orderId)?.buyer.email.toLowerCase() ===
            normalizedEmail)) ||
      (normalizedRef && ticket.orderReference.toLowerCase() === normalizedRef),
  );
}

/* ------------------------------- refunds --------------------------------- */

export function submitRefundRequest(input: {
  reference: string;
  email: string;
  ticketCodes: string[];
  reason: string;
  explanation: string;
}) {
  const request: RefundRequest = {
    id: `ref-${Date.now()}`,
    orderReference: input.reference,
    reference: input.reference,
    email: input.email,
    ticketCodes: input.ticketCodes,
    reason: input.reason,
    explanation: input.explanation,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  update((db) => ({
    ...db,
    refunds: [request, ...db.refunds],
    notifications: [
      {
        id: `ntf-${Date.now()}`,
        audience: "buyer",
        title: "Refund request received",
        body: `We received your request for booking ${input.reference}. Review takes up to 5 working days.`,
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        id: `ntf-${Date.now()}-admin`,
        audience: "admin",
        title: "New refund request",
        body: `Booking ${input.reference} requested a refund.`,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...db.notifications,
    ],
  }));
  return request;
}

export function setRefundStatus(id: string, status: RefundStatus) {
  update((db) => ({
    ...db,
    refunds: db.refunds.map((request) =>
      request.id === id ? { ...request, status } : request,
    ),
    refundStatuses: { ...db.refundStatuses, [id]: status },
    tickets:
      status === "processed"
        ? db.tickets.map((ticket) =>
            requestTicketCodes(db, id).includes(ticket.code)
              ? { ...ticket, status: "refunded" as const }
              : ticket,
          )
        : db.tickets,
  }));
}

function requestTicketCodes(db: Db, refundId: string) {
  return db.refunds.find((request) => request.id === refundId)?.ticketCodes ?? [];
}

/* -------------------------------- seller --------------------------------- */

export function signInSeller(account: SellerAccount) {
  update((db) => ({
    ...db,
    sellerSession: account,
    notifications: db.notifications,
  }));
}

export function signOutSeller() {
  update((db) => ({ ...db, sellerSession: null }));
}

export function updateSellerProfile(patch: Partial<SellerAccount>) {
  update((db) => ({
    ...db,
    sellerSession: db.sellerSession ? { ...db.sellerSession, ...patch } : db.sellerSession,
  }));
}

export function requestPayout(input: {
  amount: number;
  bank: string;
  accountName: string;
  accountNumber: string;
}) {
  const payout: PayoutRequest = {
    id: `po-${Date.now()}`,
    ...input,
    status: "pending",
    requestedAt: new Date().toISOString(),
  };
  update((db) => ({
    ...db,
    payouts: [payout, ...db.payouts],
    notifications: [
      {
        id: `ntf-${Date.now()}-admin`,
        audience: "admin",
        title: "New payout request",
        body: `${input.accountName} requested ${input.amount.toLocaleString()} NGN.`,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...db.notifications,
    ],
  }));
  return payout;
}

export function setPayoutStatus(id: string, status: PayoutRequest["status"]) {
  update((db) => ({
    ...db,
    payouts: db.payouts.map((payout) => (payout.id === id ? { ...payout, status } : payout)),
    payoutStatuses: { ...db.payoutStatuses, [id]: status },
  }));
}

export function setUserStatus(
  userId: string,
  status: "active" | "suspended" | "restricted",
) {
  update((db) => ({
    ...db,
    userStatuses: { ...db.userStatuses, [userId]: status },
  }));
}

export function addSellerEvent(event: EventItem) {
  update((db) => ({ ...db, sellerEvents: [event, ...db.sellerEvents] }));
}

export function upsertSellerEvent(event: EventItem) {
  update((db) => ({
    ...db,
    sellerEvents: db.sellerEvents.some((candidate) => candidate.id === event.id)
      ? db.sellerEvents.map((candidate) => (candidate.id === event.id ? event : candidate))
      : [event, ...db.sellerEvents],
  }));
}

export function deleteSellerEvent(id: string) {
  update((db) => ({
    ...db,
    sellerEvents: db.sellerEvents.filter((event) => event.id !== id),
  }));
}

export function updateSellerEvent(id: string, patch: Partial<EventItem>) {
  update((db) => ({
    ...db,
    sellerEvents: db.sellerEvents.map((event) =>
      event.id === id ? { ...event, ...patch } : event,
    ),
  }));
}

export function signInAdmin(account: { email: string; name: string }) {
  update((db) => ({ ...db, adminSession: account }));
}

export function signOutAdmin() {
  update((db) => ({ ...db, adminSession: null }));
}

export function pushNotification(notification: Omit<AppNotification, "id" | "createdAt" | "read">) {
  update((db) => ({
    ...db,
    notifications: [
      {
        ...notification,
        id: `ntf-${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...db.notifications,
    ],
  }));
}

export function markNotificationsRead(audience: AppNotification["audience"]) {
  update((db) => ({
    ...db,
    notifications: db.notifications.map((notification) =>
      notification.audience === audience ? { ...notification, read: true } : notification,
    ),
  }));
}

/* --------------------------------- cart ---------------------------------- */

let cartCache: Cart | null = null;
const cartListeners = new Set<() => void>();

function readCart(): Cart | null {
  if (cartCache) return cartCache;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    cartCache = raw ? (JSON.parse(raw) as Cart) : null;
  } catch {
    cartCache = null;
  }
  return cartCache;
}

function commitCart(cart: Cart | null) {
  cartCache = cart;
  if (typeof window !== "undefined") {
    if (cart) window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    else window.localStorage.removeItem(CART_KEY);
  }
  cartListeners.forEach((listener) => listener());
}

function subscribeCart(listener: () => void) {
  cartListeners.add(listener);
  return () => cartListeners.delete(listener);
}

export function useCart(): Cart | null {
  return useSyncExternalStore(subscribeCart, readCart, () => null);
}

export function setCart(cart: Cart | null) {
  commitCart(cart);
}

export function clearCart() {
  commitCart(null);
}

export function cartCount(cart: Cart | null) {
  if (!cart) return 0;
  return cart.lines.reduce((sum, line) => sum + line.quantity, 0);
}
