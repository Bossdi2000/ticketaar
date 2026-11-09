"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { SALES } from "@/lib/seed/seller";
import { formatDate, formatMoney, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TableShell, DashboardHeader, StatCard } from "@/components/dashboard/ui";

const TABS = [
  { id: "all", label: "All" },
  { id: "successful", label: "Successful" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
] as const;

const SELLERS = ["Pulse Live Africa", "Lagos Nights Collective", "Greenfield Conferences"];

export function AdminTransactions() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return SALES.filter((sale) => {
      if (tab !== "all" && sale.status !== tab) return false;
      if (!normalized) return true;
      return [sale.reference, sale.buyer, sale.eventTitle, sale.email]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [tab, query]);

  const successful = SALES.filter((sale) => sale.status === "successful");
  const gross = successful.reduce((sum, sale) => sum + sale.amount, 0);
  const commission = successful.reduce((sum, sale) => sum + sale.commission, 0);

  function exportCsv() {
    const header = ["Reference", "Buyer", "Email", "Event", "Seller", "Amount", "Commission", "Status", "Method", "Date"];
    const csv = [
      header,
      ...rows.map((sale, index) => [
        sale.reference,
        sale.buyer,
        sale.email,
        sale.eventTitle,
        SELLERS[index % SELLERS.length],
        sale.amount,
        sale.commission,
        sale.status,
        sale.method,
        sale.createdAt,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ticketaar-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} transactions`);
  }

  return (
    <div>
      <DashboardHeader
        title="Transactions"
        description="Every payment attempt on the platform, with commission attached."
        actions={
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-brand-50"
          >
            <Download className="size-4" />
            Export
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Gross volume" value={formatMoney(gross, { compact: true })} hint={`${SALES.length} attempts`} />
        <StatCard label="Commission" value={formatMoney(commission, { compact: true })} hint="Platform earnings" tone="brand" />
        <StatCard label="Success rate" value={`${Math.round((successful.length / SALES.length) * 100)}%`} hint={`${SALES.length - successful.length} failed or pending`} />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white shadow-glow">
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
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
          <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3">
            <Search className="size-4 text-muted" />
            <label htmlFor="tx-search" className="sr-only">Search transactions</label>
            <input
              id="tx-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Reference, buyer or event"
              className="h-9 w-full bg-transparent text-sm focus:outline-none sm:w-56"
            />
          </div>
        </div>

        <TableShell
          head={
            <tr>
              <th scope="col" className="px-4 py-2.5 font-semibold">Reference</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Buyer</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Event</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Seller</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Amount</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Commission</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Date</th>
            </tr>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                No transactions match those filters.
              </td>
            </tr>
          ) : (
            rows.map((sale, index) => (
              <tr key={sale.id} className="hover:bg-brand-50/40">
                <td className="px-4 py-3 font-mono text-xs text-ink">{sale.reference}</td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-ink">{sale.buyer}</p>
                  <p className="text-xs text-muted">{sale.email}</p>
                </td>
                <td className="max-w-44 px-4 py-3">
                  <p className="truncate text-xs text-ink">{sale.eventTitle}</p>
                  <p className="text-[0.7rem] text-muted">{sale.ticketType} × {sale.quantity}</p>
                </td>
                <td className="px-4 py-3 text-xs text-ink">{SELLERS[index % SELLERS.length]}</td>
                <td className="px-4 py-3 text-xs font-semibold text-ink tabular">{formatMoney(sale.amount)}</td>
                <td className="px-4 py-3 text-xs text-muted tabular">{formatMoney(sale.commission)}</td>
                <td className="px-4 py-3">
                  <Badge tone={sale.status === "successful" ? "success" : sale.status === "pending" ? "warning" : "danger"}>
                    {sale.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted">{formatDate(sale.createdAt, "day")}</td>
              </tr>
            ))
          )}
        </TableShell>
      </div>
    </div>
  );
}
