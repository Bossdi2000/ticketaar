import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow="About Ticketaar"
          title="One Ticket, All Access!"
          description="Ticketaar is a Nigerian event ticketing platform built for organisers who want to sell out fast and for people who want to find a good night without friction."
        />

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
          <p>
            We started Ticketaar because buying a ticket in Nigeria was harder than it needed to be.
            Long forms, forced account creation, tickets that arrive hours later, and organisers
            tracking sales on paper. We rebuilt the whole flow around two ideas: buyers should never
            need an account, and organisers should see every naira in real time.
          </p>
          <p>
            Every ticket issued on Ticketaar carries a unique QR code that can only be checked in
            once. Payments are verified before any ticket exists, so organisers never hand over entry
            to an unconfirmed transaction. Payouts, commissions and refunds all run through the same
            audited ledger.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Events hosted", value: "1,240+" },
            { label: "Tickets issued", value: "128,000+" },
            { label: "Organisers", value: "480" },
          ].map((stat) => (
            <div key={stat.label} className="card-surface p-5 text-center">
              <p className="text-2xl font-extrabold text-brand-700 tabular">{stat.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 card-surface p-6">
          <h2 className="text-lg font-bold text-ink">What we hold ourselves to</h2>
          <ul className="mt-3 space-y-3 text-sm text-muted">
            <li>
              <strong className="text-ink">No forced sign-up.</strong> Browsing and buying work
              without an account. We send everything to your email instead.
            </li>
            <li>
              <strong className="text-ink">No unverified tickets.</strong> A ticket only exists after
              payment is confirmed by the gateway.
            </li>
            <li>
              <strong className="text-ink">No hidden money.</strong> Commission rates are published
              and locked to each transaction at the time of sale.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
