"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, TrendingUp, Ticket, Banknote, Users } from "lucide-react";
import { toast } from "sonner";
import { SALES, sellerTotals } from "@/lib/seed/seller";
import { formatMoney, cn } from "@/lib/utils";
import { StatCard, Panel, ProgressBar, DashboardHeader } from "@/components/dashboard/ui";
import { Badge } from "@/components/ui/badge";

const RANGES = [
  { id: 7, label: "7 days" },
  { id: 30, label: "30 days" },
  { id: 90, label: "90 days" },
] as const;

export function AnalyticsPage() {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const totals = sellerTotals();

  const daily = useMemo(() => {
    const buckets = new Map<string, { label: string; revenue: number; tickets: number }>();
    for (let offset = range - 1; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = date.toISOString().slice(0, 10);
      buckets.set(key, {
        label: date.toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
        revenue: 0,
        tickets: 0,
      });
    }
    SALES.filter((sale) => sale.status === "successful").forEach((sale) => {
      const bucket = buckets.get(sale.createdAt.slice(0, 10));
      if (bucket) {
        bucket.revenue += sale.amount;
        bucket.tickets += sale.quantity;
      }
    });
    return [...buckets.values()];
  }, [range]);

  const byEvent = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; tickets: number }>();
    SALES.filter((sale) => sale.status === "successful").forEach((sale) => {
      const current = map.get(sale.eventTitle) ?? { name: sale.eventTitle, revenue: 0, tickets: 0 };
      current.revenue += sale.amount;
      current.tickets += sale.quantity;
      map.set(sale.eventTitle, current);
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, []);

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    SALES.filter((sale) => sale.status === "successful").forEach((sale) => {
      map.set(sale.ticketType, (map.get(sale.ticketType) ?? 0) + sale.quantity);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const best = byEvent[0];
  const bestType = byType[0];

  function exportReport() {
    const rows = [
      ["Metric", "Value"],
      ["Gross sales", totals.gross],
      ["Commission", totals.commission],
      ["Net earnings", totals.net],
      ["Tickets sold", totals.tickets],
      ["Transactions", totals.count],
      ...byEvent.map((event) => [event.name, event.revenue]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ticketaar-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics report exported");
  }

  return (
    <div>
      <DashboardHeader
        title="Analytics"
        description="Revenue trends, ticket mix and event performance."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-lg border border-line bg-white p-0.5">
              {RANGES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRange(option.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs font-semibold",
                    range === option.id ? "bg-brand-600 text-white" : "text-muted hover:bg-brand-50",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={exportReport}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-brand-50"
            >
              <Download className="size-3.5" />
              Export
            </button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Net earnings" value={formatMoney(totals.net, { compact: true })} change={16.8} icon={<Banknote className="size-4" />} tone="brand" />
        <StatCard label="Tickets sold" value={totals.tickets.toLocaleString()} change={11.4} icon={<Ticket className="size-4" />} />
        <StatCard label="Avg. order value" value={formatMoney(Math.round(totals.gross / Math.max(1, totals.count)))} change={4.2} icon={<TrendingUp className="size-4" />} />
        <StatCard label="Repeat buyers" value="21%" hint="Bought more than once" icon={<Users className="size-4" />} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Revenue trend" description={`Confirmed sales over the last ${range} days`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6500e8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6500e8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece7f6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#777777" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#777777" }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} />
                <Tooltip formatter={(value) => [formatMoney(Number(value)), "Revenue"]} contentStyle={{ borderRadius: 12, border: "1px solid #ece7f6", fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#6500e8" strokeWidth={2.5} fill="url(#analyticsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Key insights">
          <ul className="space-y-3 text-sm">
            <li className="rounded-xl bg-brand-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Best-selling event</p>
              <p className="mt-1 font-semibold text-ink">{best?.name ?? "—"}</p>
              <p className="text-xs text-muted">
                {best ? `${best.tickets} tickets · ${formatMoney(best.revenue, { compact: true })}` : ""}
              </p>
            </li>
            <li className="rounded-xl bg-brand-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Top ticket category</p>
              <p className="mt-1 font-semibold text-ink">{bestType?.[0] ?? "—"}</p>
              <p className="text-xs text-muted">{bestType ? `${bestType[1]} tickets sold` : ""}</p>
            </li>
            <li className="rounded-xl bg-brand-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Growth</p>
              <p className="mt-1 font-semibold text-success">+16.8% vs previous period</p>
              <p className="text-xs text-muted">Driven by VIP and table bookings</p>
            </li>
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Tickets sold by day">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece7f6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#777777" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "#777777" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #ece7f6", fontSize: 12 }} />
                <Bar dataKey="tickets" fill="#8a2bf5" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Event performance">
          <ul className="space-y-3">
            {byEvent.map((event) => (
              <li key={event.name}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-semibold text-ink">{event.name}</span>
                  <span className="shrink-0 text-muted tabular">{formatMoney(event.revenue, { compact: true })}</span>
                </div>
                <ProgressBar value={event.revenue} max={byEvent[0].revenue} />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {byType.map(([name, count]) => (
              <Badge key={name} tone="neutral">
                {name} · {count}
              </Badge>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
