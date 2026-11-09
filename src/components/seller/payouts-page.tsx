"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Wallet, Clock, CheckCircle2, Landmark, ArrowDownToLine } from "lucide-react";
import { PAYOUTS, sellerTotals } from "@/lib/seed/seller";
import { requestPayout, useDb } from "@/lib/store";
import { formatDate, formatMoney, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/field";
import { StatCard, Panel, TableShell, DashboardHeader } from "@/components/dashboard/ui";

const TABS = [
  { id: "all", label: "All payouts" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "paid", label: "Paid" },
] as const;

export function PayoutsPage() {
  const db = useDb();
  const totals = sellerTotals();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [form, setForm] = useState({
    amount: "",
    bank: "",
    accountName: db.sellerSession?.name ?? "",
    accountNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const available = Math.round(totals.net * 0.42);
  const pendingBalance = totals.net - available;

  const allPayouts = [
    ...db.payouts.map((payout) => ({
      id: payout.id,
      amount: payout.amount,
      status: payout.status,
      bank: payout.bank,
      account: payout.accountNumber,
      requestedAt: payout.requestedAt,
      paidAt: null as string | null,
    })),
    ...PAYOUTS.map((payout) => ({
      id: payout.id,
      amount: payout.amount,
      status: payout.status as string,
      bank: payout.bank,
      account: payout.account,
      requestedAt: payout.requestedAt,
      paidAt: payout.paidAt as string | null,
    })),
  ];

  const filtered = allPayouts.filter((payout) => tab === "all" || payout.status === tab);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    const amount = Number(form.amount);
    if (!amount || amount < 10000) next.amount = "Minimum payout is ₦10,000";
    else if (amount > available) next.amount = `You can withdraw up to ${formatMoney(available)}`;
    if (!form.bank.trim()) next.bank = "Select your bank";
    if (!form.accountName.trim()) next.accountName = "Enter the account name";
    if (form.accountNumber.replace(/\D/g, "").length !== 10) next.accountNumber = "Account number must be 10 digits";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    requestPayout({
      amount,
      bank: form.bank.trim(),
      accountName: form.accountName.trim(),
      accountNumber: form.accountNumber.trim(),
    });
    toast.success("Payout requested. An administrator reviews it before processing.");
    setForm({ ...form, amount: "", accountNumber: "" });
  }

  return (
    <div>
      <DashboardHeader
        title="Payouts"
        description="Withdraw your available balance to a verified Nigerian bank account."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total earnings" value={formatMoney(totals.net, { compact: true })} icon={<Wallet className="size-4" />} tone="brand" />
        <StatCard label="Available now" value={formatMoney(available, { compact: true })} hint="Ready to withdraw" icon={<ArrowDownToLine className="size-4" />} />
        <StatCard label="Pending balance" value={formatMoney(pendingBalance, { compact: true })} hint="Clears after event" icon={<Clock className="size-4" />} />
        <StatCard label="Paid out" value={formatMoney(2130000, { compact: true })} hint="2 completed payouts" icon={<CheckCircle2 className="size-4" />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <Panel title="Request a payout" description={`Maximum ${formatMoney(available)}`}>
          <form onSubmit={submit} className="space-y-3">
            <Field label="Amount (₦)" required htmlFor="payout-amount" error={errors.amount} hint="Minimum ₦10,000">
              <Input
                id="payout-amount"
                type="number"
                min={10000}
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                placeholder={String(Math.min(available, 500000))}
              />
            </Field>
            <Field label="Bank" required htmlFor="payout-bank" error={errors.bank}>
              <Input
                id="payout-bank"
                value={form.bank}
                onChange={(event) => setForm({ ...form, bank: event.target.value })}
                placeholder="GTBank"
              />
            </Field>
            <Field label="Account name" required htmlFor="payout-name" error={errors.accountName}>
              <Input
                id="payout-name"
                value={form.accountName}
                onChange={(event) => setForm({ ...form, accountName: event.target.value })}
              />
            </Field>
            <Field label="Account number" required htmlFor="payout-number" error={errors.accountNumber}>
              <Input
                id="payout-number"
                inputMode="numeric"
                maxLength={10}
                value={form.accountNumber}
                onChange={(event) => setForm({ ...form, accountNumber: event.target.value })}
                placeholder="0123456789"
                className="font-mono"
              />
            </Field>
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700"
            >
              <Landmark className="size-4" />
              Request payout
            </button>
            <p className="text-[0.7rem] leading-relaxed text-muted">
              Payouts are reviewed by an administrator and processed to the account above. Account
              name verification runs through Paystack when a live key is configured.
            </p>
          </form>
        </Panel>

        <Panel title="Payout history" padded={false}>
          <div className="flex flex-wrap gap-1.5 border-b border-line p-3">
            {TABS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTab(option.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold",
                  tab === option.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line text-ink/70 hover:bg-brand-50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <TableShell
            head={
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">Reference</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Amount</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Account</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Requested</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            }
          >
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  No payouts in this state.
                </td>
              </tr>
            ) : (
              filtered.map((payout) => (
                <tr key={payout.id} className="hover:bg-brand-50/40">
                  <td className="px-4 py-3 font-mono text-xs text-ink">{payout.id}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-ink tabular">
                    {formatMoney(payout.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-ink">{payout.bank}</p>
                    <p className="font-mono text-[0.7rem] text-muted">{payout.account}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDate(payout.requestedAt, "day")}</td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        payout.status === "paid"
                          ? "success"
                          : payout.status === "rejected"
                            ? "danger"
                            : payout.status === "processing"
                              ? "brand"
                              : "warning"
                      }
                    >
                      {payout.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </TableShell>
        </Panel>
      </div>
    </div>
  );
}
