"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Ticket,
  User,
  CheckCircle2,
  Smartphone,
  Building2,
} from "lucide-react";
import { useCart, createOrder, confirmOrderPayment, clearCart } from "@/lib/store";
import { EVENTS, findEvent } from "@/lib/seed/events";
import { formatDate, formatMoney, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input, Field } from "@/components/ui/field";
import { EmptyState } from "@/components/layout/page";

const PAYMENT_METHODS = [
  { id: "card", label: "Card", icon: CreditCard, hint: "Verve, Mastercard, Visa" },
  { id: "transfer", label: "Bank transfer", icon: Building2, hint: "Pay from your bank app" },
  { id: "ussd", label: "USSD", icon: Smartphone, hint: "*737# and similar" },
] as const;

export function CheckoutFlow() {
  const cart = useCart();
  const router = useRouter();
  const [step, setStep] = useState<"details" | "payment">("details");
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("card");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [attendees, setAttendees] = useState<{ name: string; email: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const event = cart ? findEvent(cart.eventSlug) : undefined;

  const lines = useMemo(() => {
    if (!cart || !event) return [];
    return cart.lines
      .map((line) => {
        const type = event.ticketTypes.find((candidate) => candidate.id === line.ticketTypeId);
        return type ? { type, quantity: line.quantity } : null;
      })
      .filter((value): value is { type: NonNullable<typeof value>["type"]; quantity: number } =>
        Boolean(value),
      );
  }, [cart, event]);

  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    setAttendees((current) => {
      const next = Array.from({ length: totalQuantity }, (_, index) =>
        current[index] ?? { name: index === 0 ? form.name : "", email: index === 0 ? form.email : "" },
      );
      return next;
    });
  }, [totalQuantity, form.name, form.email]);

  const subtotal = lines.reduce((sum, line) => sum + line.type.price * line.quantity, 0);
  const serviceFee = Math.round(subtotal * 0.015);
  const total = subtotal + serviceFee;

  if (!cart || !event || lines.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={<Ticket className="size-6" />}
          title="Your cart is empty"
          description="Pick an event and select your tickets to start a booking. You do not need an account."
          action={<Link href="/events" className="h-11 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white">Browse events</Link>}
        />
      </div>
    );
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Enter the name the booking is under";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "Enter a valid phone number";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goToPayment() {
    if (!validate()) return;
    if (attendees.some((attendee) => !attendee.name.trim())) {
      toast.error("Add a name for every attendee");
      return;
    }
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function pay() {
    if (!event) return;
    setProcessing(true);
    const items = lines.map((line) => ({
      ticketTypeId: line.type.id,
      ticketTypeName: line.type.name,
      quantity: line.quantity,
      unitPrice: line.type.price,
    }));

    const order = createOrder(
      event,
      items,
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      },
      attendees.map((attendee) => ({
        name: attendee.name.trim() || form.name.trim(),
        email: attendee.email.trim() || form.email.trim(),
      })),
    );

    await new Promise((resolve) => setTimeout(resolve, 1400));
    confirmOrderPayment(order.id);
    clearCart();
    toast.success("Payment confirmed. Your tickets are ready.");
    router.push(`/payment/success?ref=${order.reference}`);
  }

  return (
    <div className="container-page py-8">
      <Link
        href={`/events/${event.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to event
      </Link>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
          {step === "details" ? "Checkout" : "Payment"}
        </h1>
        <ol className="flex items-center gap-2 text-xs font-semibold">
          <li className={cn("rounded-full px-3 py-1", step === "details" ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-800")}>
            1. Your details
          </li>
          <li className={cn("rounded-full px-3 py-1", step === "payment" ? "bg-brand-600 text-white" : "bg-brand-50 text-muted")}>
            2. Payment
          </li>
          <li className="rounded-full bg-brand-50 px-3 py-1 text-muted">3. Tickets</li>
        </ol>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="space-y-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
          {step === "details" ? (
            <>
              <section className="card-surface p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                  <User className="size-5 text-brand-600" />
                  Buyer details
                </h2>
                <p className="mt-1 text-sm text-muted">
                  We send your tickets to this email. No account required.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" required htmlFor="buyer-name" error={errors.name}>
                    <Input
                      id="buyer-name"
                      autoComplete="name"
                      value={form.name}
                      placeholder="Adaeze Okafor"
                      onChange={(input) => setForm({ ...form, name: input.target.value })}
                    />
                  </Field>
                  <Field label="Email address" required htmlFor="buyer-email" error={errors.email}>
                    <Input
                      id="buyer-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={form.email}
                      placeholder="you@example.com"
                      onChange={(input) => setForm({ ...form, email: input.target.value })}
                    />
                  </Field>
                  <Field
                    label="Phone number"
                    required
                    htmlFor="buyer-phone"
                    error={errors.phone}
                    className="sm:col-span-2"
                  >
                    <Input
                      id="buyer-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      placeholder="+234 801 234 5678"
                      onChange={(input) => setForm({ ...form, phone: input.target.value })}
                    />
                  </Field>
                </div>
              </section>

              <section className="card-surface p-5">
                <h2 className="text-lg font-bold text-ink">Attendees</h2>
                <p className="mt-1 text-sm text-muted">
                  Name each ticket holder. Names appear on the ticket and are checked at the gate.
                </p>
                <div className="mt-4 space-y-3">
                  {attendees.map((attendee, index) => (
                    <div key={index} className="grid gap-3 rounded-xl border border-line p-3 sm:grid-cols-2">
                      <Field label={`Attendee ${index + 1} name`} required htmlFor={`att-${index}`}>
                        <Input
                          id={`att-${index}`}
                          value={attendee.name}
                          onChange={(input) =>
                            setAttendees((current) =>
                              current.map((item, position) =>
                                position === index ? { ...item, name: input.target.value } : item,
                              ),
                            )
                          }
                          placeholder="Ticket holder name"
                        />
                      </Field>
                      <Field label="Attendee email" htmlFor={`att-email-${index}`} hint="Optional">
                        <Input
                          id={`att-email-${index}`}
                          type="email"
                          value={attendee.email}
                          onChange={(input) =>
                            setAttendees((current) =>
                              current.map((item, position) =>
                                position === index ? { ...item, email: input.target.value } : item,
                              ),
                            )
                          }
                          placeholder="attendee@example.com"
                        />
                      </Field>
                    </div>
                  ))}
                </div>
              </section>

              <button
                type="button"
                onClick={goToPayment}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white shadow-brand hover:bg-brand-700"
              >
                Continue to payment
                <ArrowLeft className="size-4 rotate-180" />
              </button>
            </>
          ) : (
            <>
              <section className="card-surface p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                  <CreditCard className="size-5 text-brand-600" />
                  Payment method
                </h2>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {PAYMENT_METHODS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMethod(option.id)}
                      aria-pressed={method === option.id}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors",
                        method === option.id
                          ? "border-brand-600 bg-brand-50"
                          : "border-line bg-white hover:border-brand-200",
                      )}
                    >
                      <option.icon className="size-5 text-brand-600" />
                      <span className="text-sm font-bold text-ink">{option.label}</span>
                      <span className="text-[0.7rem] text-muted">{option.hint}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-xl bg-brand-50 p-4 text-xs leading-relaxed text-brand-800">
                  <p className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                    <span>
                      This build runs in development mode, so no live charge is made. Wire
                      <code className="mx-1 rounded bg-white px-1 py-0.5 font-mono">PAYSTACK_SECRET_KEY</code>
                      and the payment step will initialise and verify a real transaction before any
                      ticket is issued.
                    </span>
                  </p>
                </div>
              </section>

              <section className="card-surface p-5">
                <h2 className="text-lg font-bold text-ink">Booking summary</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Buyer</dt>
                    <dd className="text-right font-medium text-ink">{form.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Email</dt>
                    <dd className="break-all text-right font-medium text-ink">{form.email}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Attendees</dt>
                    <dd className="text-right font-medium text-ink">{totalQuantity}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="mt-3 text-xs font-semibold text-brand-700 hover:underline"
                >
                  Edit details
                </button>
              </section>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="h-12 rounded-xl border border-line px-5 text-sm font-semibold text-ink hover:bg-brand-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={pay}
                  disabled={processing}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white shadow-brand hover:bg-brand-700 disabled:opacity-60"
                >
                  {processing ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Confirming payment
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" />
                      Pay {formatMoney(total)}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="lg:sticky lg:top-32">
          <div className="card-surface overflow-hidden">
            <div className="relative h-32">
              <Image src={event.cover} alt="" fill sizes="352px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <Badge tone="brand" className="bg-white/95">
                  {event.category}
                </Badge>
                <p className="mt-1.5 text-sm font-bold text-white">{event.title}</p>
              </div>
            </div>
            <div className="space-y-3 p-4 text-sm">
              <p className="flex items-center gap-1.5 text-muted">
                <CalendarDays className="size-4" />
                {formatDate(event.startDate)}
              </p>
              <p className="flex items-center gap-1.5 text-muted">
                <MapPin className="size-4" />
                {event.venue}, {event.city}
              </p>
            </div>
            <div className="space-y-2 border-t border-line p-4 text-sm">
              {lines.map((line) => (
                <div key={line.type.id} className="flex justify-between gap-3">
                  <span className="text-muted">
                    {line.type.name} × {line.quantity}
                  </span>
                  <span className="shrink-0 font-medium text-ink tabular">
                    {formatMoney(line.type.price * line.quantity)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between border-t border-line pt-2 text-muted">
                <span>Subtotal</span>
                <span className="tabular">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Service fee</span>
                <span className="tabular">{formatMoney(serviceFee)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold text-ink">
                <span>Total</span>
                <span className="tabular">{formatMoney(total)}</span>
              </div>
            </div>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.7rem] text-muted">
            <ShieldCheck className="size-3.5" />
            Tickets are issued only after payment is verified.
          </p>
        </aside>
      </div>
    </div>
  );
}

export const CHECKOUT_EVENT_COUNT = EVENTS.length;
