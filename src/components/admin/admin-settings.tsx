"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Save,
  Palette,
  CreditCard,
  Mail,
  ShieldCheck,
  Wrench,
  Tags,
  Plus,
  X,
  KeyRound,
} from "lucide-react";
import { PLATFORM_SETTINGS } from "@/lib/seed/admin";
import { ADMIN_USERS } from "@/lib/seed/seller";
import { Field, Input, Textarea, Toggle } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader, Panel } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general", label: "General", icon: Wrench },
  { id: "brand", label: "Brand", icon: Palette },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "email", label: "Email", icon: Mail },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "policies", label: "Policies", icon: ShieldCheck },
  { id: "team", label: "Admin team", icon: KeyRound },
] as const;

const DEFAULT_CATEGORIES = [
  "Music",
  "Concerts",
  "Comedy",
  "Sports",
  "Business",
  "Education",
  "Conferences",
  "Festivals",
  "Religious",
  "Parties",
  "Other",
];

export function AdminSettings() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("general");
  const [settings, setSettings] = useState(PLATFORM_SETTINGS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState("");
  const [refundPolicy, setRefundPolicy] = useState(
    "Full refund up to 7 days before an event unless the organiser sets a stricter policy.",
  );

  function save(section: string) {
    toast.success(`${section} settings saved`);
  }

  return (
    <div>
      <DashboardHeader
        title="Platform settings"
        description="Brand, payments, policies and administrator access."
      />

      <div className="grid gap-4 lg:grid-cols-[13rem_1fr] lg:items-start">
        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-1.5 shadow-glow lg:flex-col" aria-label="Settings sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors lg:text-sm",
                tab === item.id
                  ? "bg-brand-600 text-white"
                  : "text-ink/70 hover:bg-brand-50",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {tab === "general" ? (
            <Panel title="General">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Platform name" htmlFor="set-name">
                  <Input id="set-name" value={settings.platformName} onChange={(event) => setSettings({ ...settings, platformName: event.target.value })} />
                </Field>
                <Field label="Support email" htmlFor="set-support">
                  <Input id="set-support" type="email" value={settings.supportEmail} onChange={(event) => setSettings({ ...settings, supportEmail: event.target.value })} />
                </Field>
                <Field label="Currency" htmlFor="set-currency">
                  <Input id="set-currency" value={settings.currency} onChange={(event) => setSettings({ ...settings, currency: event.target.value })} />
                </Field>
                <Field label="Commission (%)" htmlFor="set-rate">
                  <Input id="set-rate" type="number" step="0.1" value={settings.commissionRate} onChange={(event) => setSettings({ ...settings, commissionRate: Number(event.target.value) })} />
                </Field>
              </div>
              <div className="mt-3 space-y-2">
                <Toggle
                  checked={settings.maintenanceMode}
                  onChange={(value) => setSettings({ ...settings, maintenanceMode: value })}
                  label="Maintenance mode"
                  description="Shows a holding page to buyers. Seller and admin consoles stay available."
                />
                <Toggle
                  checked={settings.moderation}
                  onChange={(value) => setSettings({ ...settings, moderation: value })}
                  label="Require event approval"
                  description="New events stay pending until an administrator approves them."
                />
              </div>
              <button type="button" onClick={() => save("General")} className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
                <Save className="size-4" />
                Save general
              </button>
            </Panel>
          ) : null}

          {tab === "brand" ? (
            <Panel title="Brand">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Primary purple", value: "#6500E8" },
                  { label: "Deep purple", value: "#4100A8" },
                  { label: "Light purple", value: "#F1E7FF" },
                ].map((color) => (
                  <div key={color.label} className="rounded-xl border border-line p-3">
                    <div className="h-12 rounded-lg" style={{ backgroundColor: color.value }} />
                    <p className="mt-2 text-xs font-semibold text-ink">{color.label}</p>
                    <p className="font-mono text-[0.7rem] text-muted">{color.value}</p>
                  </div>
                ))}
              </div>
              <Field label="Logo wordmark" htmlFor="set-logo" className="mt-3">
                <Input id="set-logo" value="Ticketaar" readOnly />
              </Field>
              <Field label="Slogan" htmlFor="set-slogan" className="mt-3">
                <Input id="set-slogan" defaultValue="One Ticket, All Access!" />
              </Field>
              <button type="button" onClick={() => save("Brand")} className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
                <Save className="size-4" />
                Save brand
              </button>
            </Panel>
          ) : null}

          {tab === "payments" ? (
            <Panel title="Payment gateway">
              <div className="rounded-xl bg-brand-50 p-3 text-xs text-brand-800">
                <p className="font-bold">Paystack</p>
                <p className="mt-0.5">
                  {settings.paymentProvider} is selected. Add <code className="rounded bg-white px-1">PAYSTACK_SECRET_KEY</code> and{" "}
                  <code className="rounded bg-white px-1">NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</code> to enable live checkout.
                </p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Public key" htmlFor="set-pk" hint="Read from environment in production">
                  <Input id="set-pk" value="pk_test_••••••••••••" readOnly className="font-mono" />
                </Field>
                <Field label="Secret key" htmlFor="set-sk" hint="Never exposed to the browser">
                  <Input id="set-sk" value="sk_test_••••••••••••" readOnly className="font-mono" />
                </Field>
                <Field label="Fixed fee (₦)" htmlFor="set-fee">
                  <Input id="set-fee" type="number" value={settings.fixedFee} onChange={(event) => setSettings({ ...settings, fixedFee: Number(event.target.value) })} />
                </Field>
                <Field label="Webhook URL" htmlFor="set-hook">
                  <Input id="set-hook" value="https://ticketaar.ng/api/paystack/webhook" readOnly className="font-mono text-xs" />
                </Field>
              </div>
              <button type="button" onClick={() => save("Payment")} className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
                <Save className="size-4" />
                Save payment
              </button>
            </Panel>
          ) : null}

          {tab === "email" ? (
            <Panel title="Email delivery">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Provider" htmlFor="set-email-provider">
                  <Input id="set-email-provider" value={settings.emailProvider} readOnly />
                </Field>
                <Field label="From address" htmlFor="set-from">
                  <Input id="set-from" value="tickets@ticketaar.ng" />
                </Field>
              </div>
              <Field label="API key" htmlFor="set-resend" className="mt-3" hint="Set RESEND_API_KEY in the server environment">
                <Input id="set-resend" value="re_••••••••••••" readOnly className="font-mono" />
              </Field>
              <button type="button" onClick={() => save("Email")} className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
                <Save className="size-4" />
                Save email
              </button>
            </Panel>
          ) : null}

          {tab === "categories" ? (
            <Panel title="Event categories">
              <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <span key={category} className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800">
                    {category}
                    {category !== "Other" ? (
                      <button
                        type="button"
                        onClick={() => setCategories((current) => current.filter((item) => item !== category))}
                        aria-label={`Remove ${category}`}
                        className="text-brand-600 hover:text-danger"
                      >
                        <X className="size-3" />
                      </button>
                    ) : null}
                  </span>
                ))}
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const value = newCategory.trim();
                  if (!value || categories.includes(value)) return;
                  setCategories((current) => [...current.slice(0, -1), value, "Other"]);
                  setNewCategory("");
                  toast.success(`${value} added`);
                }}
                className="mt-4 flex gap-2"
              >
                <Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Add a category" />
                <button type="submit" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
                  <Plus className="size-4" />
                  Add
                </button>
              </form>
            </Panel>
          ) : null}

          {tab === "policies" ? (
            <Panel title="Policies">
              <Field label="Refund policy" htmlFor="set-refund">
                <Textarea id="set-refund" value={refundPolicy} onChange={(event) => setRefundPolicy(event.target.value)} />
              </Field>
              <Field label="Terms of service" htmlFor="set-terms" className="mt-3">
                <Textarea id="set-terms" defaultValue="Standard platform terms apply. Organisers are responsible for the events they publish." />
              </Field>
              <button type="button" onClick={() => save("Policy")} className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
                <Save className="size-4" />
                Save policies
              </button>
            </Panel>
          ) : null}

          {tab === "team" ? (
            <Panel title="Administrator accounts" padded={false}>
              <ul className="divide-y divide-line">
                {[
                  { name: "Platform Admin", email: "admin@ticketaar.ng", role: "Super admin" },
                  { name: "Finance Desk", email: "finance@ticketaar.ng", role: "Finance" },
                  { name: "Trust & Safety", email: "safety@ticketaar.ng", role: "Moderator" },
                ].map((admin) => (
                  <li key={admin.email} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{admin.name}</p>
                      <p className="text-xs text-muted">{admin.email}</p>
                    </div>
                    <Badge tone={admin.role === "Super admin" ? "brand" : "neutral"}>{admin.role}</Badge>
                  </li>
                ))}
              </ul>
              <p className="border-t border-line p-4 text-xs text-muted">
                {ADMIN_USERS.filter((user) => user.role === "admin").length} administrator recorded in
                user records. Permission changes are written to the audit log.
              </p>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
