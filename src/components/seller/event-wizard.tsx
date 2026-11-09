"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  ImageIcon,
  CalendarDays,
  MapPin,
  Ticket,
  Settings2,
  Eye,
  Save,
  Send,
  Info,
} from "lucide-react";
import type { Category, EventItem, TicketKind, TicketType } from "@/lib/types";
import { CATEGORIES } from "@/lib/seed/events";
import { upsertSellerEvent } from "@/lib/store";
import { cn, formatDate, formatMoney, formatTime, slugify } from "@/lib/utils";
import { Field, Input, Textarea, Select, Toggle } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard/ui";

const STEPS = [
  { id: 1, label: "Basics", icon: Info },
  { id: 2, label: "Date & time", icon: CalendarDays },
  { id: 3, label: "Location", icon: MapPin },
  { id: 4, label: "Tickets", icon: Ticket },
  { id: 5, label: "Settings", icon: Settings2 },
  { id: 6, label: "Review", icon: Eye },
];

const COVERS = [
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=70",
];

const KINDS: { value: TicketKind; label: string }[] = [
  { value: "general", label: "General admission" },
  { value: "early-bird", label: "Early bird" },
  { value: "vip", label: "VIP" },
  { value: "vvip", label: "VVIP" },
  { value: "table", label: "Table reservation" },
];

interface TicketDraft {
  id: string;
  name: string;
  kind: TicketKind;
  price: string;
  quantity: string;
  maxPerCustomer: string;
  description: string;
  salesStart: string;
  salesEnd: string;
}

function blankTicket(index: number): TicketDraft {
  return {
    id: `draft-ticket-${Date.now()}-${index}`,
    name: index === 0 ? "Regular" : "VIP Access",
    kind: index === 0 ? "general" : "vip",
    price: index === 0 ? "25000" : "65000",
    quantity: index === 0 ? "500" : "100",
    maxPerCustomer: "6",
    description: index === 0 ? "Standard access to the event." : "Fast-track entry and raised viewing.",
    salesStart: "2026-11-01",
    salesEnd: "2026-12-20",
  };
}

export function EventWizard({ initial, mode = "create" }: { initial?: EventItem; mode?: "create" | "edit" }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    category: (initial?.category ?? "Music") as Category,
    description: initial?.description ?? "",
    cover: initial?.cover ?? COVERS[0],
    organizer: initial?.organizer.name ?? "Pulse Live Africa",
    contactEmail: "events@pulselive.africa",
    contactPhone: "+234 803 555 0119",
    startDate: initial?.startDate.slice(0, 10) ?? "",
    startTime: initial ? new Date(initial.startDate).toTimeString().slice(0, 5) : "19:00",
    endDate: initial?.endDate.slice(0, 10) ?? "",
    endTime: initial ? new Date(initial.endDate).toTimeString().slice(0, 5) : "23:00",
    timezone: initial?.timezone ?? "Africa/Lagos (WAT)",
    venue: initial?.venue ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    country: initial?.country ?? "Nigeria",
    online: initial?.online ?? false,
    onlineUrl: initial?.onlineUrl ?? "",
    refundPolicy: initial?.refundPolicy ?? "Full refund up to 7 days before the event.",
    terms: initial?.terms ?? "",
    transfers: initial?.transfersEnabled ?? true,
    visibility: "public",
    requireAttendeeDetails: true,
  });

  const [tickets, setTickets] = useState<TicketDraft[]>(
    initial
      ? initial.ticketTypes.map((type) => ({
          id: type.id,
          name: type.name,
          kind: type.kind,
          price: String(type.price),
          quantity: String(type.quantity),
          maxPerCustomer: String(type.maxPerCustomer),
          description: type.description,
          salesStart: type.salesStart.slice(0, 10),
          salesEnd: type.salesEnd.slice(0, 10),
        }))
      : [blankTicket(0)],
  );

  const capacity = tickets.reduce((sum, type) => sum + (Number(type.quantity) || 0), 0);
  const lowest = Math.min(...tickets.map((type) => Number(type.price) || 0));

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateTicket(id: string, patch: Partial<TicketDraft>) {
    setTickets((current) =>
      current.map((ticket) => (ticket.id === id ? { ...ticket, ...patch } : ticket)),
    );
  }

  function validateStep(current: number) {
    const next: Record<string, string> = {};
    if (current === 1) {
      if (!form.title.trim()) next.title = "Give your event a name";
      if (form.description.trim().length < 30) next.description = "Write at least 30 characters";
    }
    if (current === 2) {
      if (!form.startDate) next.startDate = "Choose a start date";
      if (!form.endDate) next.endDate = "Choose an end date";
      if (form.startDate && form.endDate && form.endDate < form.startDate) {
        next.endDate = "The end date cannot be before the start date";
      }
    }
    if (current === 3) {
      if (!form.online) {
        if (!form.venue.trim()) next.venue = "Enter the venue name";
        if (!form.address.trim()) next.address = "Enter the address";
        if (!form.city.trim()) next.city = "Enter the city";
      } else if (!form.onlineUrl.trim()) {
        next.onlineUrl = "Add the link attendees should use";
      }
    }
    if (current === 4) {
      if (tickets.length === 0) next.tickets = "Add at least one ticket type";
      tickets.forEach((ticket, index) => {
        if (!ticket.name.trim()) next[`ticket-${index}-name`] = "Name required";
        if (Number(ticket.quantity) <= 0) next[`ticket-${index}-quantity`] = "Quantity required";
        if (Number(ticket.price) < 0) next[`ticket-${index}-price`] = "Price required";
      });
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function next() {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(6, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStep((current) => Math.max(1, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildEvent(status: EventItem["status"]): EventItem {
    const start = safeIso(form.startDate, form.startTime);
    const end = safeIso(form.endDate, form.endTime);
    const ticketTypes: TicketType[] = tickets.map((ticket, index) => ({
      id: initial?.ticketTypes[index]?.id ?? `${slugify(form.title)}-${ticket.kind}-${index}`,
      name: ticket.name,
      description: ticket.description,
      price: Number(ticket.price) || 0,
      quantity: Number(ticket.quantity) || 0,
      sold: initial?.ticketTypes[index]?.sold ?? 0,
      maxPerCustomer: Number(ticket.maxPerCustomer) || 1,
      kind: ticket.kind,
      salesStart: `${ticket.salesStart}T09:00:00+01:00`,
      salesEnd: `${ticket.salesEnd}T23:59:00+01:00`,
    }));

    return {
      id: initial?.id ?? `evt-${Date.now()}`,
      slug: initial?.slug ?? `${slugify(form.title)}-${Date.now().toString().slice(-4)}`,
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      terms: form.terms.trim() || "Standard event terms apply.",
      cover: form.cover,
      gallery: initial?.gallery ?? [],
      startDate: start,
      endDate: end,
      timezone: form.timezone,
      venue: form.online ? "Online event" : form.venue.trim(),
      address: form.online ? form.onlineUrl : form.address.trim(),
      city: form.online ? "Online" : form.city.trim(),
      state: form.online ? "Online" : form.state.trim(),
      country: form.online ? "Online" : form.country.trim(),
      online: form.online,
      onlineUrl: form.online ? form.onlineUrl : undefined,
      organizer: {
        id: "org-pulse",
        name: form.organizer.trim() || "Independent organiser",
        verified: true,
        events: 24,
      },
      ticketTypes,
      status,
      featured: false,
      trending: false,
      transfersEnabled: form.transfers,
      refundPolicy: form.refundPolicy,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
  }

  function save(event: React.SyntheticEvent) {
    event.preventDefault();
    if (!validateStep(step)) return;
    const status: EventItem["status"] = step === 6 ? "pending" : "draft";
    upsertSellerEvent(buildEvent(status));
    toast.success(
      status === "pending"
        ? "Event submitted for approval. You can still edit it while it is reviewed."
        : "Draft saved",
    );
    router.push("/seller/events");
  }

  const preview = useMemo(() => (form.title ? buildEvent("draft") : null), [form, tickets]);

  return (
    <div>
      <DashboardHeader
        title={mode === "edit" ? "Edit event" : "Create an event"}
        description={
          mode === "edit"
            ? "Update the details. Changes to published events apply immediately."
            : "Six steps. You can save a draft at any point and come back."
        }
        actions={
          <button
            type="button"
            onClick={save}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-brand-50"
          >
            <Save className="size-4" />
            Save draft
          </button>
        }
      />

      <ol className="mb-5 flex flex-wrap gap-1.5">
        {STEPS.map((item) => (
          <li key={item.id} className="flex-1">
            <button
              type="button"
              onClick={() => setStep(item.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors",
                step === item.id
                  ? "border-brand-600 bg-brand-600 text-white"
                  : step > item.id
                    ? "border-green-200 bg-green-50 text-success"
                    : "border-line bg-white text-muted hover:border-brand-200",
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-[0.65rem] font-bold",
                  step === item.id
                    ? "bg-white/20"
                    : step > item.id
                      ? "bg-success text-white"
                      : "bg-brand-50 text-brand-700",
                )}
              >
                {step > item.id ? <Check className="size-3.5" /> : item.id}
              </span>
              <span className="hidden truncate text-xs font-semibold sm:block">{item.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <form onSubmit={save}>
        <div className="grid gap-4 xl:grid-cols-[1fr_20rem] xl:items-start">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-glow">
            {step === 1 ? (
              <div className="space-y-4">
                <StepTitle title="Basic information" body="What is the event called and what should people expect?" />
                <Field label="Event name" required htmlFor="evt-title" error={errors.title}>
                  <Input
                    id="evt-title"
                    value={form.title}
                    onChange={(event) => update("title", event.target.value)}
                    placeholder="Altè Beats Concert"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Category" required htmlFor="evt-category">
                    <Select
                      id="evt-category"
                      value={form.category}
                      onChange={(event) => update("category", event.target.value as Category)}
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category.name}>{category.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Organiser name" required htmlFor="evt-organizer">
                    <Input
                      id="evt-organizer"
                      value={form.organizer}
                      onChange={(event) => update("organizer", event.target.value)}
                    />
                  </Field>
                </div>
                <Field
                  label="Description"
                  required
                  htmlFor="evt-description"
                  error={errors.description}
                  hint="Tell people what to expect. Minimum 30 characters."
                >
                  <Textarea
                    id="evt-description"
                    value={form.description}
                    onChange={(event) => update("description", event.target.value)}
                    placeholder="A live band, a headline set and a room built for the front row…"
                    className="min-h-32"
                  />
                </Field>

                <div>
                  <p className="mb-2 text-sm font-medium text-ink">Cover image</p>
                  <div className="grid grid-cols-3 gap-2">
                    {COVERS.map((cover) => (
                      <button
                        key={cover}
                        type="button"
                        onClick={() => update("cover", cover)}
                        className={cn(
                          "relative aspect-[16/10] overflow-hidden rounded-lg border-2",
                          form.cover === cover ? "border-brand-600" : "border-transparent opacity-80 hover:opacity-100",
                        )}
                        aria-label="Choose cover image"
                        aria-pressed={form.cover === cover}
                      >
                        <Image src={cover} alt="" fill sizes="180px" className="object-cover" />
                        {form.cover === cover ? (
                          <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-brand-600 text-white">
                            <Check className="size-3" />
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                  <Field label="Or paste an image URL" htmlFor="evt-cover" className="mt-3">
                    <Input
                      id="evt-cover"
                      value={form.cover}
                      onChange={(event) => update("cover", event.target.value)}
                      placeholder="https://…"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact email" htmlFor="evt-contact-email">
                    <Input
                      id="evt-contact-email"
                      type="email"
                      value={form.contactEmail}
                      onChange={(event) => update("contactEmail", event.target.value)}
                    />
                  </Field>
                  <Field label="Contact phone" htmlFor="evt-contact-phone">
                    <Input
                      id="evt-contact-phone"
                      type="tel"
                      value={form.contactPhone}
                      onChange={(event) => update("contactPhone", event.target.value)}
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <StepTitle title="Date and time" body="When does it start and when does it end?" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Start date" required htmlFor="evt-start-date" error={errors.startDate}>
                    <Input
                      id="evt-start-date"
                      type="date"
                      value={form.startDate}
                      onChange={(event) => update("startDate", event.target.value)}
                    />
                  </Field>
                  <Field label="Start time" required htmlFor="evt-start-time">
                    <Input
                      id="evt-start-time"
                      type="time"
                      value={form.startTime}
                      onChange={(event) => update("startTime", event.target.value)}
                    />
                  </Field>
                  <Field label="End date" required htmlFor="evt-end-date" error={errors.endDate}>
                    <Input
                      id="evt-end-date"
                      type="date"
                      value={form.endDate}
                      onChange={(event) => update("endDate", event.target.value)}
                    />
                  </Field>
                  <Field label="End time" required htmlFor="evt-end-time">
                    <Input
                      id="evt-end-time"
                      type="time"
                      value={form.endTime}
                      onChange={(event) => update("endTime", event.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Time zone" htmlFor="evt-tz">
                  <Select
                    id="evt-tz"
                    value={form.timezone}
                    onChange={(event) => update("timezone", event.target.value)}
                  >
                    <option>Africa/Lagos (WAT)</option>
                    <option>Africa/Accra (GMT)</option>
                    <option>Africa/Nairobi (EAT)</option>
                    <option>Europe/London (GMT/BST)</option>
                  </Select>
                </Field>
                <div className="rounded-xl bg-brand-50 p-3 text-xs text-brand-800">
                  Doors open one hour before the start time by default. You can change this later
                  from event settings.
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <StepTitle title="Location" body="Where is it happening, or is it online?" />
                <Toggle
                  checked={form.online}
                  onChange={(value) => update("online", value)}
                  label="This is an online event"
                  description="Attendees receive a join link with their ticket."
                />
                {form.online ? (
                  <Field label="Online event link" required htmlFor="evt-online" error={errors.onlineUrl}>
                    <Input
                      id="evt-online"
                      value={form.onlineUrl}
                      onChange={(event) => update("onlineUrl", event.target.value)}
                      placeholder="https://stream.example.com/your-event"
                    />
                  </Field>
                ) : (
                  <>
                    <Field label="Venue name" required htmlFor="evt-venue" error={errors.venue}>
                      <Input
                        id="evt-venue"
                        value={form.venue}
                        onChange={(event) => update("venue", event.target.value)}
                        placeholder="Eko Convention Centre"
                      />
                    </Field>
                    <Field label="Full address" required htmlFor="evt-address" error={errors.address}>
                      <Input
                        id="evt-address"
                        value={form.address}
                        onChange={(event) => update("address", event.target.value)}
                        placeholder="Plot 1415 Adetokunbo Ademola Street"
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="City" required htmlFor="evt-city" error={errors.city}>
                        <Input
                          id="evt-city"
                          value={form.city}
                          onChange={(event) => update("city", event.target.value)}
                          placeholder="Lagos"
                        />
                      </Field>
                      <Field label="State" htmlFor="evt-state">
                        <Input
                          id="evt-state"
                          value={form.state}
                          onChange={(event) => update("state", event.target.value)}
                          placeholder="Lagos"
                        />
                      </Field>
                      <Field label="Country" htmlFor="evt-country">
                        <Input
                          id="evt-country"
                          value={form.country}
                          onChange={(event) => update("country", event.target.value)}
                        />
                      </Field>
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-4">
                <StepTitle
                  title="Tickets"
                  body="Create as many ticket categories as you need. Free tickets are fine."
                />
                {errors.tickets ? (
                  <p className="text-xs font-medium text-danger">{errors.tickets}</p>
                ) : null}
                <div className="space-y-3">
                  {tickets.map((ticket, index) => (
                    <div key={ticket.id} className="rounded-xl border border-line p-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone="brand">Ticket {index + 1}</Badge>
                        {tickets.length > 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setTickets((current) => current.filter((item) => item.id !== ticket.id))
                            }
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-danger hover:bg-red-50"
                          >
                            <Trash2 className="size-3.5" />
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Field label="Ticket name" required htmlFor={`t-name-${index}`} error={errors[`ticket-${index}-name`]}>
                          <Input
                            id={`t-name-${index}`}
                            value={ticket.name}
                            onChange={(event) => updateTicket(ticket.id, { name: event.target.value })}
                          />
                        </Field>
                        <Field label="Type" htmlFor={`t-kind-${index}`}>
                          <Select
                            id={`t-kind-${index}`}
                            value={ticket.kind}
                            onChange={(event) => updateTicket(ticket.id, { kind: event.target.value as TicketKind })}
                          >
                            {KINDS.map((kind) => (
                              <option key={kind.value} value={kind.value}>
                                {kind.label}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Field label="Price (₦)" required htmlFor={`t-price-${index}`} error={errors[`ticket-${index}-price`]}>
                          <Input
                            id={`t-price-${index}`}
                            type="number"
                            min={0}
                            value={ticket.price}
                            onChange={(event) => updateTicket(ticket.id, { price: event.target.value })}
                          />
                        </Field>
                        <Field label="Quantity" required htmlFor={`t-qty-${index}`} error={errors[`ticket-${index}-quantity`]}>
                          <Input
                            id={`t-qty-${index}`}
                            type="number"
                            min={1}
                            value={ticket.quantity}
                            onChange={(event) => updateTicket(ticket.id, { quantity: event.target.value })}
                          />
                        </Field>
                        <Field label="Max per customer" htmlFor={`t-max-${index}`}>
                          <Input
                            id={`t-max-${index}`}
                            type="number"
                            min={1}
                            value={ticket.maxPerCustomer}
                            onChange={(event) => updateTicket(ticket.id, { maxPerCustomer: event.target.value })}
                          />
                        </Field>
                        <Field label="Sales close" htmlFor={`t-end-${index}`}>
                          <Input
                            id={`t-end-${index}`}
                            type="date"
                            value={ticket.salesEnd}
                            onChange={(event) => updateTicket(ticket.id, { salesEnd: event.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label="Description" htmlFor={`t-desc-${index}`} className="mt-3">
                        <Input
                          id={`t-desc-${index}`}
                          value={ticket.description}
                          onChange={(event) => updateTicket(ticket.id, { description: event.target.value })}
                        />
                      </Field>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setTickets((current) => [...current, blankTicket(current.length)])}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                >
                  <Plus className="size-4" />
                  Add another ticket type
                </button>

                <div className="grid gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-800 sm:grid-cols-3">
                  <p>
                    <span className="block font-bold">Capacity</span>
                    {capacity.toLocaleString()} tickets
                  </p>
                  <p>
                    <span className="block font-bold">Lowest price</span>
                    {formatMoney(lowest)}
                  </p>
                  <p>
                    <span className="block font-bold">Categories</span>
                    {tickets.length}
                  </p>
                </div>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="space-y-4">
                <StepTitle title="Settings" body="Refunds, transfers, visibility and attendee information." />
                <Field label="Refund policy" htmlFor="evt-refund">
                  <Textarea
                    id="evt-refund"
                    value={form.refundPolicy}
                    onChange={(event) => update("refundPolicy", event.target.value)}
                    className="min-h-20"
                  />
                </Field>
                <Field label="Terms and conditions" htmlFor="evt-terms">
                  <Textarea
                    id="evt-terms"
                    value={form.terms}
                    onChange={(event) => update("terms", event.target.value)}
                    placeholder="Entry requirements, age limits, prohibited items…"
                    className="min-h-20"
                  />
                </Field>
                <Toggle
                  checked={form.transfers}
                  onChange={(value) => update("transfers", value)}
                  label="Allow ticket transfers"
                  description="Ticket holders can reassign their ticket to someone else."
                />
                <Toggle
                  checked={form.requireAttendeeDetails}
                  onChange={(value) => update("requireAttendeeDetails", value)}
                  label="Collect attendee names"
                  description="Ask buyers for the name of every ticket holder at checkout."
                />
                <Field label="Visibility" htmlFor="evt-visibility">
                  <Select
                    id="evt-visibility"
                    value={form.visibility}
                    onChange={(event) => update("visibility", event.target.value)}
                  >
                    <option value="public">Public — listed on Ticketaar</option>
                    <option value="unlisted">Unlisted — link only</option>
                  </Select>
                </Field>
              </div>
            ) : null}

            {step === 6 ? (
              <div className="space-y-4">
                <StepTitle title="Preview and publish" body="Check everything before you submit." />
                {preview ? (
                  <div className="overflow-hidden rounded-xl border border-line">
                    <div className="relative h-40">
                      <Image src={preview.cover} alt="" fill sizes="640px" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <Badge tone="brand" className="bg-white/95">
                          {preview.category}
                        </Badge>
                        <p className="mt-1.5 text-lg font-extrabold text-white">
                          {preview.title || "Untitled event"}
                        </p>
                        <p className="text-xs text-brand-100">
                          {preview.startDate ? formatDate(preview.startDate) : "Date not set"} ·{" "}
                          {preview.venue || "Venue not set"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      <p className="text-sm leading-relaxed text-muted">{preview.description}</p>
                      <ul className="divide-y divide-line">
                        {preview.ticketTypes.map((type) => (
                          <li key={type.id} className="flex items-center justify-between py-2 text-sm">
                            <span>
                              <span className="font-semibold text-ink">{type.name}</span>
                              <span className="ml-2 text-xs text-muted">{type.quantity} available</span>
                            </span>
                            <span className="font-bold text-brand-700">
                              {type.price === 0 ? "Free" : formatMoney(type.price)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-800">
                  <p className="font-bold">What happens when you publish</p>
                  <p className="mt-1">
                    Your event is submitted for review. Once approved it appears in the public
                    directory and tickets go on sale immediately. This usually takes under 24 hours.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700"
                  >
                    <Send className="size-4" />
                    Publish event
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-white font-semibold text-ink hover:bg-brand-50"
                  >
                    <Save className="size-4" />
                    Save as draft
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={back}
                disabled={step === 1}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line px-4 text-sm font-semibold text-ink hover:bg-brand-50 disabled:opacity-40"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>
              {step < 6 ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </button>
              ) : null}
            </div>
          </div>

          <aside className="sticky top-24 space-y-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-glow">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Live summary</p>
              <p className="mt-2 line-clamp-2 text-sm font-bold text-ink">
                {form.title || "Untitled event"}
              </p>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Date</dt>
                  <dd className="text-right font-medium text-ink">
                    {form.startDate ? formatDate(form.startDate, "day") : "—"}
                    {form.startTime ? ` · ${formatTime(`2026-01-01T${form.startTime}:00+01:00`)}` : ""}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Venue</dt>
                  <dd className="max-w-[10rem] truncate text-right font-medium text-ink">
                    {form.online ? "Online" : form.venue || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Capacity</dt>
                  <dd className="text-right font-medium text-ink tabular">{capacity}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">From</dt>
                  <dd className="text-right font-medium text-ink">
                    {tickets.length ? formatMoney(lowest) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Transfers</dt>
                  <dd className="text-right font-medium text-ink">{form.transfers ? "On" : "Off"}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-xs leading-relaxed text-brand-800">
              <p className="flex items-center gap-1.5 font-bold">
                <ImageIcon className="size-3.5" />
                Cover quality matters
              </p>
              <p className="mt-1">
                Events with a clear 16:10 cover and a description over 150 characters sell about
                twice as fast.
              </p>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

function StepTitle({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mt-0.5 text-sm text-muted">{body}</p>
    </div>
  );
}

function safeIso(date: string, time: string) {
  if (!date) return new Date().toISOString();
  const parsed = new Date(`${date}T${time || "00:00"}:00+01:00`);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}
