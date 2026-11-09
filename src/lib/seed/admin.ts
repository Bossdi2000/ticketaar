import type { RefundRequest } from "@/lib/types";

export const ADMIN_EMAIL = "admin@ticketaar.ng";
export const ADMIN_PASSWORD = "Ticketaar2026";
export const ADMIN_NAME = "Platform Admin";

export const SEED_REFUNDS: RefundRequest[] = [
  {
    id: "ref-seed-1",
    reference: "TKT-1004-7012",
    orderReference: "TKT-1004-7012",
    email: "adaeze@example.com",
    ticketCodes: ["TKAAR-4004-7100", "TKAAR-4004-7101"],
    reason: "I can no longer attend",
    explanation: "Travel plans changed and I will be out of Lagos that weekend.",
    status: "pending",
    createdAt: "2026-11-06T09:12:00+01:00",
  },
  {
    id: "ref-seed-2",
    reference: "TKT-1009-7027",
    orderReference: "TKT-1009-7027",
    email: "chidi@example.com",
    ticketCodes: ["TKAAR-4009-7100"],
    reason: "The event was cancelled or moved",
    explanation: "The organiser announced a new date that I cannot make.",
    status: "approved",
    createdAt: "2026-11-05T15:40:00+01:00",
  },
  {
    id: "ref-seed-3",
    reference: "TKT-1014-7042",
    orderReference: "TKT-1014-7042",
    email: "fatima@example.com",
    ticketCodes: ["TKAAR-4014-7100"],
    reason: "Duplicate charge",
    explanation: "My card was charged twice for the same booking.",
    status: "processed",
    createdAt: "2026-11-03T11:05:00+01:00",
  },
  {
    id: "ref-seed-4",
    reference: "TKT-1020-7060",
    orderReference: "TKT-1020-7060",
    email: "emeka@example.com",
    ticketCodes: ["TKAAR-4020-7100", "TKAAR-4020-7101", "TKAAR-4020-7102"],
    reason: "I bought the wrong ticket",
    explanation: "I meant to buy the regular ticket, not VIP.",
    status: "rejected",
    createdAt: "2026-11-02T08:22:00+01:00",
  },
];

export const PLATFORM_SETTINGS = {
  platformName: "Ticketaar",
  commissionRate: 7.5,
  fixedFee: 100,
  paymentProvider: "Paystack",
  emailProvider: "Resend",
  supportEmail: "info.ticketaar@gmail.com",
  maintenanceMode: false,
  moderation: true,
  currency: "NGN",
};
