import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page";

export const metadata: Metadata = { title: "Terms of Service" };

const sections = [
  {
    title: "1. Using Ticketaar",
    body: "Ticketaar is a platform that connects event organisers with people who want to attend. Buyers do not need an account to purchase. Organisers must register and verify their email before publishing an event.",
  },
  {
    title: "2. Ticket purchases",
    body: "A ticket is issued only after the payment gateway confirms your payment. Prices include the advertised ticket value; a service fee is shown separately at checkout. You are responsible for entering an accurate email address, because that is where your tickets are delivered.",
  },
  {
    title: "3. Entry and check-in",
    body: "Every ticket carries a unique code and QR identifier. A ticket is valid for one check-in only. Screenshots may not scan if a ticket has been transferred or refunded. Organisers may refuse entry where the terms of the event are not met.",
  },
  {
    title: "4. Transfers",
    body: "Where an organiser enables transfers, you may reassign a ticket to another person. A transfer invalidates your previous code and issues a new one to the recipient. Transfers cannot be reversed.",
  },
  {
    title: "5. Refunds",
    body: "Refunds follow each event's published policy. Requests are reviewed by the organiser and the platform. Refunded tickets are cancelled and cannot be used for entry.",
  },
  {
    title: "6. Organiser obligations",
    body: "Organisers are responsible for the accuracy of their event information, for honouring the tickets they sell, and for complying with applicable law. Ticketaar may suspend events or accounts that breach these terms.",
  },
  {
    title: "7. Commission and payouts",
    body: "Ticketaar deducts a platform commission from each sale. The rate applied is the rate in force at the time of the transaction and is not applied retroactively. Organisers may request a payout of available earnings to a verified bank account.",
  },
  {
    title: "8. Limitation of liability",
    body: "Ticketaar is not the organiser of any event. We are not liable for cancellations, changes, or the conduct of an organiser, beyond refunding amounts where required by policy and law.",
  },
];

export default function TermsPage() {
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow="Legal"
          title="Terms of Service"
          description="The rules that apply when you buy or sell a ticket on Ticketaar. Last updated November 2026."
        />
        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="card-surface p-5">
              <h2 className="text-base font-bold text-ink">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
