# Ticketaar — One Ticket, All Access!

A complete event ticketing platform for Nigerian organisers and buyers. Public buyers can discover events and check out as guests; organisers get a full sales console; administrators get platform-wide moderation and finance tools.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Recharts, lucide-react and qrcode.react.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What is implemented

**Buyer (no account required)**
- Homepage with hero, live ticker, categories, featured, trending, upcoming and recently added events
- Event discovery with search, city/category/price/date filters and sorting
- Event detail page with ticket inventory, limits, terms and refund policy
- Guest checkout with buyer details and per-attendee names
- Payment step with card / transfer / USSD selection
- Automatic digital ticket generation with unique QR codes
- Ticket retrieval by email or booking reference
- Ticket transfer flow (reissues code, invalidates the old one)
- Refund request flow with status tracking
- Transfers dashboard, refund page, about, contact, terms and privacy

**Organiser**
- Registration, login, password reset
- Dashboard with revenue, ticket mix, live events and recent sales
- Six-step event creation wizard (basics, date, location, tickets, settings, review)
- Event list with publish, unpublish, duplicate, cancel and delete-draft actions
- Sales ledger with CSV export
- Attendee list with check-in status and CSV export
- QR verification via camera (BarcodeDetector) with manual ticket-number fallback
- Analytics with revenue trends, event performance and ticket mix
- Payout requests with bank details and balance checks
- Profile, bank details, notification preferences and settings

**Administrator**
- Separate login at `/admin/login`
- Platform dashboard: revenue, commission, transactions, users, events, approval queue
- User management with activate / restrict / suspend
- Event moderation: approve, reject, suspend, review drawer
- Transactions ledger with commission and CSV export
- Commission configuration and per-event breakdown
- Refund review and processing
- Payout approval workflow (pending → approved → processing → paid)
- Platform analytics, notifications, audit log and settings

## Demo credentials

| Role | Email | Password |
| --- | --- | --- |
| Organiser | `tola@pulselive.africa` | `demo1234` |
| Administrator | `admin@ticketaar.ng` | `Ticketaar2026` |

Buyers do not need credentials.

## Data layer (current phase)

This build is the frontend phase, so persistence runs in the browser through `localStorage` (`ticketaar.db.v1` and `ticketaar.cart.v1`). That makes every flow usable today: purchases produce real ticket records, transfers change ownership, check-ins mark tickets used, refunds and payouts move through their states.

The data-access boundary is `src/lib/store.ts` (`useDb`, `createOrder`, `confirmOrderPayment`, `transferTicket`, `checkInTicket`, `submitRefundRequest`, `setRefundStatus`, `requestPayout`, `setPayoutStatus`). Swap those functions for API calls when the backend lands; the UI does not need to change.

Seed data lives in `src/lib/seed/`. Payments are simulated only in the sense that no gateway call is made — the UI labels this on the payment screen and never claims a live charge.

## Next phase: real backend

Add these environment variables and replace the store functions with server calls:

```bash
DATABASE_URL=                 # PostgreSQL (Supabase or Neon)
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
RESEND_API_KEY=
CLOUDINARY_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The schema in `src/lib/types.ts` maps directly to the tables listed in the product spec (users, seller profiles, events, ticket types, orders, order items, payments, digital tickets, check-ins, transfers, refunds, payouts, commissions, notifications, settings, audit logs).

## Design language

- **Brand purple** `#6500E8` with a pink accent (`#FF3EA5`) for gradients and highlights.
- **Signature pink halo**: every card in the product uses `--shadow-glow` (soft pink outer glow plus a purple under-shadow). Hover lifts it to `--shadow-glow-hover`.
- **Mobile is an app**: compact app bar, bottom tab bar with an elevated centre action, horizontal poster rails, safe-area padding and a PWA manifest so it installs to a phone home screen.
- **Motion**: framer-motion runs hero entrances, scroll reveals, staggered grids, parallax city cards, count-up stats and animated checkout steps. All of it respects `prefers-reduced-motion`.

## Project layout

```
src/
  app/(public)/        buyer routes (home, events, checkout, tickets, refunds, legal)
  app/seller/          organiser auth + dashboard routes
  app/admin/           administrator login + console routes
  components/brand/    logo and ticket mark
  components/layout/   app bar, desktop nav, footer, mobile tab bar
  components/events/   event cards, explorer, detail
  components/tickets/  ticket stub, actions, transfers, refunds
  components/seller/   dashboard, wizard, sales, attendees, verification, payouts
  components/admin/    platform dashboard and management screens
  components/motion/   shared reveal / stagger / count-up primitives
  lib/seed/            demo events, sellers, transactions, admin data
  lib/store.ts         browser persistence + data-access boundary
```

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # production server
npm run lint     # eslint
```
