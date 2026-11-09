"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Camera, Save, Landmark, BellRing } from "lucide-react";
import { updateSellerProfile, useDb } from "@/lib/store";
import { initials } from "@/lib/utils";
import { Field, Input, Toggle } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader, Panel } from "@/components/dashboard/ui";

export function SellerProfilePage() {
  const db = useDb();
  const session = db.sellerSession;
  const [form, setForm] = useState({
    name: session?.name ?? "",
    email: session?.email ?? "",
    organization: session?.organization ?? "",
    phone: session?.phone ?? "",
  });
  const [bank, setBank] = useState({ bank: "GTBank", accountName: session?.name ?? "", accountNumber: "0123456789" });
  const [prefs, setPrefs] = useState({ sales: true, payouts: true, announcements: false });

  if (!session) return null;

  function save() {
    updateSellerProfile(form);
    toast.success("Profile updated");
  }

  return (
    <div>
      <DashboardHeader
        title="Profile"
        description="Your organiser identity, bank details and notification preferences."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr] lg:items-start">
        <Panel title="Organiser card">
          <div className="flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-2xl bg-brand-600 text-lg font-extrabold text-white">
              {initials(form.name || session.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-ink">
                {form.organization || "Independent organiser"}
              </p>
              <p className="truncate text-xs text-muted">{form.email}</p>
              <div className="mt-1 flex items-center gap-1.5">
                {session.verified ? (
                  <Badge tone="success">
                    <BadgeCheck className="size-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge tone="warning">Verification pending</Badge>
                )}
                <Badge tone="neutral">Organiser</Badge>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toast.info("Image upload connects to Cloudinary once CLOUDINARY_URL is set.")}
            className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-line text-xs font-semibold text-ink hover:bg-brand-50"
          >
            <Camera className="size-3.5" />
            Change profile picture
          </button>
          <dl className="mt-4 space-y-2 border-t border-line pt-3 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Account status</dt>
              <dd className="font-semibold text-success">Active</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Events hosted</dt>
              <dd className="font-semibold text-ink">3 live · 1 draft</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Member since</dt>
              <dd className="font-semibold text-ink">Aug 2026</dd>
            </div>
          </dl>
        </Panel>

        <div className="space-y-4">
          <Panel title="Account details">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" htmlFor="p-name">
                <Input id="p-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </Field>
              <Field label="Organisation" htmlFor="p-org">
                <Input id="p-org" value={form.organization} onChange={(event) => setForm({ ...form, organization: event.target.value })} />
              </Field>
              <Field label="Email" htmlFor="p-email">
                <Input id="p-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </Field>
              <Field label="Phone" htmlFor="p-phone">
                <Input id="p-phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </Field>
            </div>
            <button
              type="button"
              onClick={save}
              className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Save className="size-4" />
              Save changes
            </button>
          </Panel>

          <Panel title="Bank details">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Bank" htmlFor="p-bank">
                <Input id="p-bank" value={bank.bank} onChange={(event) => setBank({ ...bank, bank: event.target.value })} />
              </Field>
              <Field label="Account name" htmlFor="p-acct-name">
                <Input id="p-acct-name" value={bank.accountName} onChange={(event) => setBank({ ...bank, accountName: event.target.value })} />
              </Field>
              <Field label="Account number" htmlFor="p-acct-no" className="sm:col-span-2">
                <Input id="p-acct-no" maxLength={10} value={bank.accountNumber} onChange={(event) => setBank({ ...bank, accountNumber: event.target.value })} className="font-mono" />
              </Field>
            </div>
            <button
              type="button"
              onClick={() => toast.success("Bank details saved")}
              className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl border border-line px-4 text-sm font-semibold text-ink hover:bg-brand-50"
            >
              <Landmark className="size-4" />
              Save bank details
            </button>
          </Panel>

          <Panel title="Notifications">
            <div className="space-y-2">
              <Toggle checked={prefs.sales} onChange={(value) => setPrefs({ ...prefs, sales: value })} label="New sales" description="Email me when a ticket sells." />
              <Toggle checked={prefs.payouts} onChange={(value) => setPrefs({ ...prefs, payouts: value })} label="Payout updates" description="Notify me when a payout is processed." />
              <Toggle checked={prefs.announcements} onChange={(value) => setPrefs({ ...prefs, announcements: value })} label="Platform announcements" description="Product updates and seasonal tips." />
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[0.7rem] text-muted">
              <BellRing className="size-3.5" />
              Preferences are stored on this device in the demo build.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
