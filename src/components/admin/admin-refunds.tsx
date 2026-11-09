"use client";

import { useMemo, useState } from "react";
import { Check, X, CreditCard, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { setRefundStatus, useDb } from "@/lib/store";
import { SEED_REFUNDS } from "@/lib/seed/admin";
import { formatDateTime, cn } from "@/lib/utils";
import { Badge, RefundStatusBadge } from "@/components/ui/badge";
import { StatCard, Panel, DashboardHeader } from "@/components/dashboard/ui";
import type { RefundRequest, RefundStatus } from "@/lib/types";

const TABS = [
  { id: "all", label: "All requests" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "processed", label: "Processed" },
] as const;

export function AdminRefunds() {
  const db = useDb();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");

  const requests = useMemo(() => {
    const base: RefundRequest[] = [...db.refunds, ...SEED_REFUNDS];
    const seen = new Set<string>();
    return base
      .filter((request) => {
        if (seen.has(request.id)) return false;
        seen.add(request.id);
        return true;
      })
      .map((request) => ({
        ...request,
        status: db.refundStatuses[request.id] ?? request.status,
      }));
  }, [db.refunds, db.refundStatuses]);

  const filtered = requests.filter((request) => tab === "all" || request.status === tab);

  function decide(request: RefundRequest, status: RefundStatus) {
    setRefundStatus(request.id, status);
    toast.success(`Refund ${status}`);
  }

  return (
    <div>
      <DashboardHeader
        title="Refund requests"
        description="Review buyer requests and process approved refunds through the gateway."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="All requests" value={String(requests.length)} icon={<RotateCcw className="size-4" />} tone="brand" />
        <StatCard label="Pending" value={String(requests.filter((request) => request.status === "pending").length)} hint="Needs a decision" />
        <StatCard label="Approved" value={String(requests.filter((request) => request.status === "approved").length)} hint="Awaiting processing" />
        <StatCard label="Processed" value={String(requests.filter((request) => request.status === "processed").length)} hint="Refunded to buyer" />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {TABS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setTab(option.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold",
              tab === option.id
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-line bg-white text-ink/70 hover:bg-brand-50",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <Panel>
            <p className="text-sm text-muted">No refund requests in this state.</p>
          </Panel>
        ) : (
          filtered.map((request) => (
            <article key={request.id} className="rounded-2xl border border-line bg-white p-4 shadow-glow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-semibold text-ink">{request.orderReference}</p>
                    <RefundStatusBadge status={request.status} />
                    <Badge tone="neutral">{request.ticketCodes.length} tickets</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">{request.email}</p>
                </div>
                <p className="text-xs text-muted">{formatDateTime(request.createdAt)}</p>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-brand-50 p-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-brand-600">Reason</p>
                  <p className="mt-0.5 text-sm font-medium text-ink">{request.reason}</p>
                  <p className="mt-1 text-xs text-muted">{request.explanation}</p>
                </div>
                <div className="rounded-xl border border-line p-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">Tickets</p>
                  <ul className="mt-1 space-y-1">
                    {request.ticketCodes.map((code) => (
                      <li key={code} className="font-mono text-[0.7rem] text-ink">
                        {code}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
                {request.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => decide(request, "approved")}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-success px-3 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      <Check className="size-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(request, "rejected")}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-danger px-3 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      <X className="size-3.5" />
                      Reject
                    </button>
                  </>
                ) : null}
                {request.status === "approved" ? (
                  <button
                    type="button"
                    onClick={() => decide(request, "processed")}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    <CreditCard className="size-3.5" />
                    Process refund
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => toast.info("Refund details opened in the transaction ledger")}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-3 text-xs font-semibold text-ink hover:bg-brand-50"
                >
                  View transaction
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-4">
        <Panel title="Refund rules">
          <ul className="space-y-2 text-sm text-muted">
            <li>Refunds follow the organiser&apos;s published policy for the event.</li>
            <li>Processing a refund cancels the tickets, so they can no longer be scanned at the gate.</li>
            <li>Gateway refunds require a live Paystack secret key. Without one the status is recorded but nothing is charged back.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
