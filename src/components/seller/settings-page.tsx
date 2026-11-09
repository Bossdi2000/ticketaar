"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, ShieldCheck, Percent, Trash2, LogOut, KeyRound, MonitorSmartphone } from "lucide-react";
import { resetDemoData, signOutSeller, updateSellerProfile, useDb } from "@/lib/store";
import { Field, Input, Toggle } from "@/components/ui/field";
import { DashboardHeader, Panel } from "@/components/dashboard/ui";
import { formatMoney } from "@/lib/utils";

export function SellerSettingsPage() {
  const db = useDb();
  const router = useRouter();
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prefs, setPrefs] = useState({ twoFactor: false, marketing: true, autoPublish: false });

  function changePassword(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!passwords.current) next.current = "Enter your current password";
    if (passwords.next.length < 8) next.next = "Use at least 8 characters";
    if (passwords.next !== passwords.confirm) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setPasswords({ current: "", next: "", confirm: "" });
    toast.success("Password updated");
  }

  return (
    <div>
      <DashboardHeader
        title="Settings"
        description="Security, account preferences and platform controls."
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Panel title="Password">
          <form onSubmit={changePassword} className="space-y-3">
            <Field label="Current password" htmlFor="s-current" error={errors.current}>
              <Input
                id="s-current"
                type="password"
                autoComplete="current-password"
                value={passwords.current}
                onChange={(event) => setPasswords({ ...passwords, current: event.target.value })}
              />
            </Field>
            <Field label="New password" htmlFor="s-next" error={errors.next} hint="At least 8 characters">
              <Input
                id="s-next"
                type="password"
                autoComplete="new-password"
                value={passwords.next}
                onChange={(event) => setPasswords({ ...passwords, next: event.target.value })}
              />
            </Field>
            <Field label="Confirm new password" htmlFor="s-confirm" error={errors.confirm}>
              <Input
                id="s-confirm"
                type="password"
                autoComplete="new-password"
                value={passwords.confirm}
                onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
              />
            </Field>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <KeyRound className="size-4" />
              Update password
            </button>
          </form>
        </Panel>

        <Panel title="Security">
          <div className="space-y-2">
            <Toggle
              checked={prefs.twoFactor}
              onChange={(value) => setPrefs({ ...prefs, twoFactor: value })}
              label="Two-factor authentication"
              description="Require a one-time code from your authenticator app."
            />
            <Toggle
              checked={prefs.autoPublish}
              onChange={(value) => setPrefs({ ...prefs, autoPublish: value })}
              label="Skip review for verified events"
              description="Available after your first three approved events."
            />
            <Toggle
              checked={prefs.marketing}
              onChange={(value) => setPrefs({ ...prefs, marketing: value })}
              label="Product and marketing emails"
              description="Occasional guidance on selling more tickets."
            />
          </div>
          <div className="mt-4 space-y-2 rounded-xl border border-line p-3 text-xs">
            <p className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted">
                <MonitorSmartphone className="size-3.5" />
                Last sign-in device
              </span>
              <span className="font-medium text-ink">Chrome · Lagos, NG</span>
            </p>
            <p className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted">
                <ShieldCheck className="size-3.5" />
                Email verified
              </span>
              <span className="font-medium text-success">Yes</span>
            </p>
          </div>
        </Panel>

        <Panel title="Platform fees">
          <div className="flex items-start gap-3 rounded-xl bg-brand-50 p-3">
            <Percent className="mt-0.5 size-4 shrink-0 text-brand-700" />
            <div className="text-sm">
              <p className="font-bold text-brand-900">7.5% commission</p>
              <p className="mt-0.5 text-xs text-brand-800">
                Charged per successful transaction. At ₦{formatMoney(100000, { compact: false }).replace("₦", "")} in sales you keep ₦92,500.
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Commission is locked to each transaction at the time of sale. Rate changes never apply
            retroactively to historical sales.
          </p>
        </Panel>

        <Panel title="Danger zone">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                signOutSeller();
                router.replace("/seller/login");
              }}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-line text-sm font-semibold text-ink hover:bg-brand-50"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
            <button
              type="button"
              onClick={() => {
                resetDemoData();
                toast.success("Local demo data cleared");
                router.replace("/seller/login");
              }}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 text-sm font-semibold text-danger hover:bg-red-50"
            >
              <Trash2 className="size-4" />
              Clear local demo data
            </button>
            <p className="flex items-center gap-1.5 text-[0.7rem] text-muted">
              <Lock className="size-3.5" />
              Account deletion requires email confirmation. Contact support.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
