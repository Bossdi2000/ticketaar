"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

const TOPICS = ["Buying tickets", "Selling tickets", "Refunds", "Payouts", "Something else"];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
    toast.success("Message sent. We reply within one working day.");
    event.currentTarget.reset();
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow="Contact"
          title="Talk to the Ticketaar team"
          description="Questions about a booking, a payout, or setting up your first event. We answer every message."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_16rem]">
          <form onSubmit={submit} className="card-surface space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" required htmlFor="contact-name">
                <Input id="contact-name" name="name" required placeholder="Adaeze Okafor" />
              </Field>
              <Field label="Email address" required htmlFor="contact-email">
                <Input id="contact-email" name="email" type="email" required placeholder="you@example.com" />
              </Field>
            </div>
            <Field label="What is this about?" htmlFor="contact-topic">
              <Select id="contact-topic" name="topic">
                {TOPICS.map((topic) => (
                  <option key={topic}>{topic}</option>
                ))}
              </Select>
            </Field>
            <Field label="Booking reference" htmlFor="contact-ref" hint="Optional, if it relates to an order">
              <Input id="contact-ref" name="reference" placeholder="TKT-A1B2-C3D4" className="font-mono" />
            </Field>
            <Field label="Message" required htmlFor="contact-message">
              <Textarea id="contact-message" name="message" required placeholder="Tell us what happened and what you need." />
            </Field>
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700"
            >
              <Send className="size-4" />
              Send message
            </button>
            {sent ? (
              <p className="rounded-xl bg-green-50 p-3 text-xs font-medium text-success">
                Thanks, your message is in the queue.
              </p>
            ) : null}
          </form>

          <aside className="space-y-3">
            {[
              { icon: Mail, label: "Email", value: "info.ticketaar@gmail.com" },
              { icon: Phone, label: "Phone", value: "07010301024" },
              { icon: MapPin, label: "Office", value: "Asokoro, Abuja, Nigeria" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="card-surface p-4">
                <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon className="size-4" />
                </span>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
              </div>
            ))}
            <div className="card-surface p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Support hours</p>
              <p className="mt-1 text-sm text-ink">Mon – Sat, 9am – 7pm WAT</p>
              <p className="mt-0.5 text-xs text-muted">
                Event-day issues are handled around the clock.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
