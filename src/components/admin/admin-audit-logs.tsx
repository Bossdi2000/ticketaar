"use client";

import { useMemo, useState } from "react";
import { Search, ScrollText, ShieldCheck, Download } from "lucide-react";
import { toast } from "sonner";
import { AUDIT_LOGS } from "@/lib/seed/seller";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TableShell, DashboardHeader, StatCard, Panel } from "@/components/dashboard/ui";

const ACTIONS = ["all", "Approved event", "Rejected event", "Suspended user", "Changed commission rate", "Approved payout", "Processed refund"];

export function AdminAuditLogs() {
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("all");

  const logs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return AUDIT_LOGS.filter((log) => {
      if (action !== "all" && log.action !== action) return false;
      if (!normalized) return true;
      return [log.actor, log.action, log.target, log.ip].join(" ").toLowerCase().includes(normalized);
    });
  }, [query, action]);

  function exportLogs() {
    const header = ["Timestamp", "Actor", "Action", "Target", "IP"];
    const csv = [
      header,
      ...logs.map((log) => [log.at, log.actor, log.action, log.target, log.ip]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ticketaar-audit-log.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Audit log exported");
  }

  return (
    <div>
      <DashboardHeader
        title="Audit logs"
        description="An immutable trail of every administrative action."
        actions={
          <button
            type="button"
            onClick={exportLogs}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-brand-50"
          >
            <Download className="size-4" />
            Export
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Events recorded" value={String(AUDIT_LOGS.length)} icon={<ScrollText className="size-4" />} tone="brand" />
        <StatCard label="Failed logins" value={String(AUDIT_LOGS.filter((log) => log.action.includes("login")).length)} hint="Last 7 days" />
        <StatCard label="Moderated items" value={String(AUDIT_LOGS.filter((log) => /event|user/i.test(log.action)).length)} hint="Approvals and suspensions" />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white shadow-glow">
        <div className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3">
            <Search className="size-4 text-muted" />
            <label htmlFor="audit-search" className="sr-only">Search audit log</label>
            <input
              id="audit-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Actor, action, target or IP"
              className="h-9 w-full bg-transparent text-sm focus:outline-none sm:w-64"
            />
          </div>
          <label htmlFor="audit-action" className="sr-only">Filter by action</label>
          <select
            id="audit-action"
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="h-9 rounded-xl border border-line bg-white px-2.5 text-xs font-medium text-ink focus:border-brand-500 focus:outline-none"
          >
            {ACTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All actions" : option}
              </option>
            ))}
          </select>
        </div>

        <TableShell
          head={
            <tr>
              <th scope="col" className="px-4 py-2.5 font-semibold">Timestamp</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Actor</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Action</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Target</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">IP</th>
            </tr>
          }
        >
          {logs.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                No audit entries match those filters.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="hover:bg-brand-50/40">
                <td className="px-4 py-3 text-xs text-muted">{formatDateTime(log.at)}</td>
                <td className="px-4 py-3 font-mono text-[0.7rem] text-ink">{log.actor}</td>
                <td className="px-4 py-3">
                  <Badge tone={log.action.includes("Failed") ? "danger" : "brand"}>{log.action}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-ink">{log.target}</td>
                <td className="px-4 py-3 font-mono text-[0.7rem] text-muted">{log.ip}</td>
              </tr>
            ))
          )}
        </TableShell>
        <p className="border-t border-line px-4 py-2.5 text-xs text-muted">
          {logs.length} entries · retained for 7 years
        </p>
      </div>

      <div className="mt-4">
        <Panel title="Why this matters">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />
            Financial actions, moderation decisions and permission changes must be traceable to a
            named administrator. This log is append-only; entries cannot be edited or deleted from
            the console.
          </p>
        </Panel>
      </div>
    </div>
  );
}
