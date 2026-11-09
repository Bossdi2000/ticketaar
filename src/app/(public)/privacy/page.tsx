import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page";

export const metadata: Metadata = { title: "Privacy Policy" };

const sections = [
  {
    title: "What we collect",
    body: "When you buy a ticket we collect your name, email address and phone number, plus the names of any attendees you register. Organisers who register provide their name, organisation details, email, phone number and payout bank details.",
  },
  {
    title: "Why we collect it",
    body: "We use your details to issue and deliver tickets, to verify your payment, to answer support requests, and to meet our legal and accounting obligations. Organisers use attendee details to run the event and manage check-in.",
  },
  {
    title: "Payments",
    body: "Card details are handled by the payment provider and never stored on Ticketaar servers. We store only a transaction reference, the amount and the payment status.",
  },
  {
    title: "Sharing",
    body: "We share attendee names and email addresses with the organiser of the event you booked, so they can admit you. We do not sell personal data.",
  },
  {
    title: "Retention",
    body: "Transaction and ticket records are retained for seven years to satisfy financial reporting rules. Marketing preferences can be changed at any time from the unsubscribe link in our emails.",
  },
  {
    title: "Your rights",
    body: "You can request a copy of your data, ask us to correct it, or ask us to delete data we no longer have a legal reason to keep. Email hello@ticketaar.ng and we will respond within 30 days.",
  },
  {
    title: "Cookies",
    body: "We use a small number of cookies and local storage entries to keep your cart and signed-in session working. No advertising trackers are loaded on Ticketaar.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow="Legal"
          title="Privacy Policy"
          description="How Ticketaar handles your personal data. Last updated November 2026."
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
