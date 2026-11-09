"use client";

import { useMemo, useState } from "react";
import { Check, X, Loader2, Wallet, Landmark, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { setPayoutStatus, useDb } from "@/lib/store";
import { PAYOUTS } from "@/lib/seed/seller";
import { formatDate, formatMoney, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatCard, Panel, TableShell, DashboardHeader } from "@/components/dashboard/ui";
import type { PayoutRequest } from "@/lib/store";

const TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "paid", label: "Paid" },
  { id: "rejected", label: "Rejected" },
] as const;

type Row = {
  id: string;
  amount: number;
  status: PayoutRequest["status"];
  bank: string;
  account: string;
  accountName: string;
  requestedAt: string;
};

export function AdminPayouts() {
  const db = useDb();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");

  const rows = useMemo<Row[]>(() => {
    const seeded: Row[] = PAYOUTS.map((payout) => ({
      id: payout.id,
      amount: payout.amount,
      status: payout.status as PayoutRequest["status"],
      bank: payout.bank,
      account: payout.account,
      accountName: "Pulse Live Africa",
      requestedAt: payout.requestedAt,
    }));
    const local: Row[] = db.payouts.map((payout) => ({
      id: payout.id,
      amount: payout.amount,
      status: payout.status,
      bank: payout.bank,
      account: payout.accountNumber,
      accountName: payout.accountName,
      requestedAt: payout.requestedAt,
    }));
    const merged = [...local, ...seeded].map((row) => ({
      ...row,
      status: db.payoutStatuses[row.id] ?? row.status,
    }));
    const seen = new Set<string>();
    return merged.filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });
  }, [db.payouts, db.payoutStatuses]);

  const filtered = rows.filter((row) => tab === "all" || row.status === tab);
  const pendingValue = rows
    .filter((row) => row.status === "pending" || row.status === "approved")
    .reduce((sum, row) => sum + row.amount, 0);

  function decide(row: Row, status: PayoutRequest["status"]) {
    setPayoutStatus(row.id, status);
    toast.success(`Payout marked ${status}`);
  }

  return (
    <div>
      <DashboardHeader
        title="Payouts"
        description="Verify seller withdrawals, approve them, then mark them paid once the transfer clears."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Awaiting action" value={formatMoney(pendingValue, { compact: true })} icon={<Wallet className="size-4" />} tone="brand" />
        <StatCard label="Pending requests" value={String(rows.filter((row) => row.status === "pending").length)} />
        <StatCard label="Processing" value={String(rows.filter((row) => row.status === "processing").length)} />
        <StatCard label="Paid out" value={formatMoney(rows.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.amount, 0), { compact: true })} />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white shadow-glow">
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
              <th scope="col" className="px-4 py-2.5 font-semibold">Seller</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Amount</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Account</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Requested</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Actions</th>
            </tr>
          }
        >
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
                No payouts in this state.
              </td>
            </tr>
          ) : (
            filtered.map((row) => (
              <tr key={row.id} className="hover:bg-brand-50/40">
                <td className="px-4 py-3 font-mono text-xs text-ink">{row.id}</td>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-ink">{row.accountName}</p>
                  <p className="flex items-center gap-1 text-[0.65rem] text-success">
                    <BadgeCheck className="size-3" />
                    Verified
                  </p>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-ink tabular">{formatMoney(row.amount)}</td>
                <td className="px-4 py-3">
                  <p className="text-xs text-ink">{row.bank}</p>
                  <p className="font-mono text-[0.65rem] text-muted">{row.account}</p>
                </td>
                <td className="px-4 py-3 text-xs text-muted">{formatDate(row.requestedAt, "day")}</td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      row.status === "paid"
                        ? "success"
                        : row.status === "rejected"
                          ? "danger"
                          : row.status === "processing"
                            ? "brand"
                            : "warning"
                    }
                  >
                    {row.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {row.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => decide(row, "approved")}
                          className="grid size-7 place-items-center rounded-lg bg-success text-white hover:bg-green-700"
                          aria-label="Approve payout"
                        >
                          <Check className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => decide(row, "rejected")}
                          className="grid size-7 place-items-center rounded-lg bg-danger text-white hover:bg-red-700"
                          aria-label="Reject payout"
                        >
                          <X className="size-3.5" />
                        </button>
                      </>
                    ) : row.status === "approved" ? (
                      <button
                        type="button"
                        onClick={() => decide(row, "processing")}
                        className="inline-flex h-7 items-center gap-1 rounded-lg border border-line px-2 text-[0.65rem] font-semibold text-ink hover:bg-brand-50"
                      >
                        <Loader2 className="size-3" />
                        Processing
                      </button>
                    ) : row.status === "processing" ? (
                      <button
                        type="button"
                        onClick={() => decide(row, "paid")}
                        className="inline-flex h-7 items-center gap-1 rounded-lg bg-brand-600 px-2 text-[0.65rem] font-semibold text-white hover:bg-brand-700"
                      >
                        <Landmark className="size-3" />
                        Mark paid
                      </button>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </TableShell>
      </div>

      <div className="mt-4">
        <Panel title="Payout controls">
          <p className="text-sm leading-relaxed text-muted">
            Only administrators can move a payout from pending to paid. Verify the account name
            against the seller&apos;s profile before approving. Once marked paid, the balance is
            deducted from the seller&apos;s available funds.
          </p>
        </Panel>
      </div>
    </div>
  );
}
