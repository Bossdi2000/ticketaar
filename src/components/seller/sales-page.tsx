"use client";

import { useMemo, useState } from "react";
import { Download, Search, Banknote, Ticket, TrendingUp, Percent } from "lucide-react";
import { toast } from "sonner";
import { SALES, sellerTotals } from "@/lib/seed/seller";
import { formatDate, formatMoney, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatCard, Panel, TableShell, DashboardHeader } from "@/components/dashboard/ui";
import type { SaleRecord } from "@/lib/seed/seller";

const STATUSES = [
  { id: "all", label: "All" },
  { id: "successful", label: "Successful" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
] as const;

export function SalesPage() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const totals = sellerTotals();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return SALES.filter((sale) => {
      if (status !== "all" && sale.status !== status) return false;
      if (!normalized) return true;
      return [sale.buyer, sale.eventTitle, sale.reference, sale.ticketType]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [status, query]);

  function exportCsv() {
    const header = ["Reference", "Buyer", "Email", "Event", "Ticket type", "Qty", "Amount", "Commission", "Status", "Date"];
    const rows = filtered.map((sale) => [
      sale.reference,
      sale.buyer,
      sale.email,
      sale.eventTitle,
      sale.ticketType,
      sale.quantity,
      sale.amount,
      sale.commission,
      sale.status,
      sale.createdAt,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ticketaar-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} transactions`);
  }

  const pending = SALES.filter((sale) => sale.status === "pending").reduce((sum, sale) => sum + sale.amount, 0);
  const failed = SALES.filter((sale) => sale.status === "failed").length;

  return (
    <div>
      <DashboardHeader
        title="Sales"
        description="Every transaction across your events, with commission broken out."
        actions={
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-brand-50"
          >
            <Download className="size-4" />
            Export CSV
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross sales" value={formatMoney(totals.gross, { compact: true })} change={18.4} icon={<Banknote className="size-4" />} tone="brand" />
        <StatCard label="Tickets sold" value={totals.tickets.toLocaleString()} change={12.1} icon={<Ticket className="size-4" />} />
        <StatCard label="Commission" value={formatMoney(totals.commission, { compact: true })} hint="7.5% platform rate" icon={<Percent className="size-4" />} />
        <StatCard label="Pending payments" value={formatMoney(pending, { compact: true })} hint={`${failed} failed attempts`} icon={<TrendingUp className="size-4" />} />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white shadow-glow">
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setStatus(option.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  status === option.id
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
            <label htmlFor="sales-search" className="sr-only">Search sales</label>
            <input
              id="sales-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buyer, event or reference"
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
              <th scope="col" className="px-4 py-2.5 font-semibold">Qty</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Amount</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Commission</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Date</th>
            </tr>
          }
        >
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                No transactions match those filters.
              </td>
            </tr>
          ) : (
            filtered.map((sale) => <SaleRow key={sale.id} sale={sale} />)
          )}
        </TableShell>
        <p className="border-t border-line px-4 py-2.5 text-xs text-muted">
          Showing {filtered.length} of {SALES.length} transactions
        </p>
      </div>
    </div>
  );
}

function SaleRow({ sale }: { sale: SaleRecord }) {
  return (
    <tr className="hover:bg-brand-50/40">
      <td className="px-4 py-3 font-mono text-xs text-ink">{sale.reference}</td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-ink">{sale.buyer}</p>
        <p className="text-xs text-muted">{sale.email}</p>
      </td>
      <td className="max-w-48 px-4 py-3">
        <p className="truncate text-xs font-medium text-ink">{sale.eventTitle}</p>
        <p className="text-[0.7rem] text-muted">{sale.ticketType}</p>
      </td>
      <td className="px-4 py-3 text-xs text-ink tabular">{sale.quantity}</td>
      <td className="px-4 py-3 text-xs font-semibold text-ink tabular">{formatMoney(sale.amount)}</td>
      <td className="px-4 py-3 text-xs text-muted tabular">{formatMoney(sale.commission)}</td>
      <td className="px-4 py-3">
        <Badge tone={sale.status === "successful" ? "success" : sale.status === "pending" ? "warning" : "danger"}>
          {sale.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-xs text-muted">{formatDate(sale.createdAt, "day")}</td>
    </tr>
  );
}
