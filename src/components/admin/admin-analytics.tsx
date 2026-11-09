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
import { Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { SALES, ADMIN_USERS, PAYOUTS } from "@/lib/seed/seller";
import { SEED_REFUNDS } from "@/lib/seed/admin";
import { formatMoney, cn } from "@/lib/utils";
import { StatCard, Panel, TableShell, DashboardHeader, ProgressBar } from "@/components/dashboard/ui";

const RANGES = [7, 30, 90] as const;

export function AdminAnalytics() {
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const successful = SALES.filter((sale) => sale.status === "successful");
  const gross = successful.reduce((sum, sale) => sum + sale.amount, 0);
  const commission = successful.reduce((sum, sale) => sum + sale.commission, 0);

  const series = useMemo(() => {
    const buckets = new Map<string, { label: string; gross: number; commission: number }>();
    for (let offset = range - 1; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      buckets.set(date.toISOString().slice(0, 10), {
        label: date.toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
        gross: 0,
        commission: 0,
      });
    }
    successful.forEach((sale) => {
      const bucket = buckets.get(sale.createdAt.slice(0, 10));
      if (bucket) {
        bucket.gross += sale.amount;
        bucket.commission += sale.commission;
      }
    });
    return [...buckets.values()];
  }, [successful, range]);

  const sellerPerformance = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; tickets: number }>();
    successful.forEach((sale, index) => {
      const name = ADMIN_USERS.filter((user) => user.role === "seller")[index % 3]?.name ?? "Independent";
      const current = map.get(name) ?? { name, revenue: 0, tickets: 0 };
      current.revenue += sale.amount;
      current.tickets += sale.quantity;
      map.set(name, current);
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [successful]);

  const topSeller = sellerPerformance[0];

  function exportReport() {
    const rows = [
      ["Metric", "Value"],
      ["Gross volume", gross],
      ["Commission", commission],
      ["Transactions", successful.length],
      ["Refund requests", SEED_REFUNDS.length],
      ["Payouts", PAYOUTS.length],
      ...sellerPerformance.map((seller) => [seller.name, seller.revenue]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ticketaar-platform-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Platform report exported");
  }

  return (
    <div>
      <DashboardHeader
        title="Analytics"
        description="Platform-wide revenue, seller performance and refund activity."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-lg border border-line bg-white p-0.5">
              {RANGES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRange(option)}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs font-semibold",
                    range === option ? "bg-brand-600 text-white" : "text-muted hover:bg-brand-50",
                  )}
                >
                  {option}d
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={exportReport}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-brand-50"
            >
              <Download className="size-3.5" />
              Export report
            </button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross volume" value={formatMoney(gross, { compact: true })} change={21.6} icon={<TrendingUp className="size-4" />} tone="brand" />
        <StatCard label="Platform commission" value={formatMoney(commission, { compact: true })} change={19.2} />
        <StatCard label="Transactions" value={successful.length.toLocaleString()} change={9.3} />
        <StatCard label="Refund rate" value="4.8%" hint={`${SEED_REFUNDS.length} requests`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Revenue vs commission" description={`Last ${range} days`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6500e8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6500e8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece7f6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#777777" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#777777" }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} />
                <Tooltip formatter={(value) => formatMoney(Number(value))} contentStyle={{ borderRadius: 12, border: "1px solid #ece7f6", fontSize: 12 }} />
                <Area type="monotone" dataKey="gross" name="Gross" stroke="#6500e8" strokeWidth={2.5} fill="url(#adminGross)" />
                <Area type="monotone" dataKey="commission" name="Commission" stroke="#ac6bff" strokeWidth={2} fill="#ac6bff" fillOpacity={0.12} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Platform insights">
          <ul className="space-y-3">
            <li className="rounded-xl bg-brand-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Top seller</p>
              <p className="mt-1 font-semibold text-ink">{topSeller?.name ?? "—"}</p>
              <p className="text-xs text-muted">
                {topSeller ? `${formatMoney(topSeller.revenue, { compact: true })} · ${topSeller.tickets} tickets` : ""}
              </p>
            </li>
            <li className="rounded-xl bg-brand-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Refund exposure</p>
              <p className="mt-1 font-semibold text-ink">₦{formatMoney(185000, { compact: true }).replace("₦", "")}</p>
              <p className="text-xs text-muted">Across pending and approved requests</p>
            </li>
            <li className="rounded-xl bg-brand-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Payout liability</p>
              <p className="mt-1 font-semibold text-ink">
                {formatMoney(rowsTotal(), { compact: true })}
              </p>
              <p className="text-xs text-muted">Pending and processing withdrawals</p>
            </li>
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Seller performance" padded={false}>
          <TableShell
            head={
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">Seller</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Revenue</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Tickets</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Share</th>
              </tr>
            }
          >
            {sellerPerformance.map((seller) => (
              <tr key={seller.name} className="hover:bg-brand-50/40">
                <td className="px-4 py-3 text-sm font-medium text-ink">{seller.name}</td>
                <td className="px-4 py-3 text-xs text-ink tabular">{formatMoney(seller.revenue)}</td>
                <td className="px-4 py-3 text-xs text-muted tabular">{seller.tickets}</td>
                <td className="w-40 px-4 py-3">
                  <ProgressBar value={seller.revenue} max={sellerPerformance[0].revenue} />
                </td>
              </tr>
            ))}
          </TableShell>
        </Panel>

        <Panel title="Transactions by month">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { month: "Jun", value: 182 },
                  { month: "Jul", value: 241 },
                  { month: "Aug", value: 296 },
                  { month: "Sep", value: 358 },
                  { month: "Oct", value: 421 },
                  { month: "Nov", value: 498 },
                ]}
                margin={{ top: 8, right: 8, left: -22, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ece7f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#777777" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#777777" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #ece7f6", fontSize: 12 }} />
                <Bar dataKey="value" fill="#6500e8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function rowsTotal() {
  return PAYOUTS.filter((payout) => payout.status !== "paid").reduce(
    (sum, payout) => sum + payout.amount,
    0,
  );
}
