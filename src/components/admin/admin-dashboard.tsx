"use client";

import { useMemo } from "react";
import Link from "next/link";
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
import {
  CalendarDays,
  Users,
  Store,
  ReceiptText,
  Banknote,
  Percent,
  ShieldCheck,
  RotateCcw,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { useDb } from "@/lib/store";
import { useAllEvents } from "@/lib/use-seller-events";
import { SALES, ADMIN_USERS, AUDIT_LOGS } from "@/lib/seed/seller";
import { SEED_REFUNDS } from "@/lib/seed/admin";
import { formatDate, formatMoney, formatDateTime, cn } from "@/lib/utils";
import { StatCard, Panel, ProgressBar, TableShell, DashboardHeader } from "@/components/dashboard/ui";
import { Badge } from "@/components/ui/badge";

export function AdminDashboard() {
  const db = useDb();
  const events = useAllEvents();

  const success = SALES.filter((sale) => sale.status === "successful");
  const revenue = success.reduce((sum, sale) => sum + sale.amount, 0);
  const commission = success.reduce((sum, sale) => sum + sale.commission, 0);
  const tickets = success.reduce((sum, sale) => sum + sale.quantity, 0);

  const pendingEvents = events.filter((event) => event.status === "pending");
  const pendingRefunds =
    db.refunds.filter((refund) => refund.status === "pending").length +
    SEED_REFUNDS.filter((refund) => refund.status === "pending").length;
  const pendingPayouts = db.payouts.filter((payout) => payout.status === "pending").length + 1;

  const revenueSeries = useMemo(() => {
    const buckets = new Map<string, { label: string; revenue: number; commission: number }>();
    for (let offset = 29; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      buckets.set(date.toISOString().slice(0, 10), {
        label: date.toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
        revenue: 0,
        commission: 0,
      });
    }
    success.forEach((sale) => {
      const bucket = buckets.get(sale.createdAt.slice(0, 10));
      if (bucket) {
        bucket.revenue += sale.amount;
        bucket.commission += sale.commission;
      }
    });
    return [...buckets.values()];
  }, [success]);

  const growth = useMemo(
    () => [
      { month: "Jun", buyers: 620, sellers: 18 },
      { month: "Jul", buyers: 780, sellers: 22 },
      { month: "Aug", buyers: 940, sellers: 27 },
      { month: "Sep", buyers: 1180, sellers: 31 },
      { month: "Oct", buyers: 1490, sellers: 38 },
      { month: "Nov", buyers: 1860, sellers: 44 },
    ],
    [],
  );

  const eventPerformance = useMemo(
    () =>
      [...events]
        .filter((event) => event.status === "published")
        .map((event) => ({
          name: event.title.length > 18 ? `${event.title.slice(0, 18)}…` : event.title,
          sold: event.ticketTypes.reduce((sum, type) => sum + type.sold, 0),
        }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 6),
    [events],
  );

  return (
    <div>
      <DashboardHeader
        title="Platform overview"
        description="Every event, seller and naira moving through Ticketaar."
        actions={
          <>
            <Link
              href="/admin/event-approvals"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-brand-50"
            >
              <ShieldCheck className="size-4" />
              Approvals
              {pendingEvents.length > 0 ? (
                <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-[0.6rem] font-bold text-white">
                  {pendingEvents.length}
                </span>
              ) : null}
            </Link>
            <Link
              href="/admin/settings"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Platform settings
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Platform revenue" value={formatMoney(revenue, { compact: true })} change={21.6} hint="vs last month" icon={<Banknote className="size-4" />} tone="brand" />
        <StatCard label="Commission earned" value={formatMoney(commission, { compact: true })} hint="7.5% average rate" icon={<Percent className="size-4" />} />
        <StatCard label="Transactions" value={SALES.length.toLocaleString()} change={9.3} hint={`${tickets.toLocaleString()} tickets`} icon={<ReceiptText className="size-4" />} />
        <StatCard label="Total users" value={ADMIN_USERS.length.toLocaleString()} change={14.8} hint={`${ADMIN_USERS.filter((user) => user.role === "seller").length} sellers`} icon={<Users className="size-4" />} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total events" value={String(events.length)} hint={`${events.filter((event) => event.status === "published").length} published`} icon={<CalendarDays className="size-4" />} />
        <StatCard label="Pending approvals" value={String(pendingEvents.length)} hint="Awaiting review" icon={<ShieldCheck className="size-4" />} />
        {pendingRefunds > 0 ? (
          <Link href="/admin/refunds">
            <StatCard label="Pending refunds" value={String(pendingRefunds)} hint="Needs a decision" icon={<RotateCcw className="size-4" />} />
          </Link>
        ) : (
          <StatCard label="Pending refunds" value="0" hint="All reviewed" icon={<RotateCcw className="size-4" />} />
        )}
        <Link href="/admin/payouts">
          <StatCard label="Pending payouts" value={String(pendingPayouts)} hint="Seller withdrawals" icon={<Wallet className="size-4" />} />
        </Link>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Panel title="Revenue and commission" description="Last 30 days across all sellers">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gmvFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6500e8" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#6500e8" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="feeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ac6bff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#ac6bff" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece7f6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#777777" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#777777" }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} />
                <Tooltip formatter={(value) => formatMoney(Number(value))} contentStyle={{ borderRadius: 12, border: "1px solid #ece7f6", fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6500e8" strokeWidth={2.5} fill="url(#gmvFill)" />
                <Area type="monotone" dataKey="commission" name="Commission" stroke="#ac6bff" strokeWidth={2} fill="url(#feeFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Recent activity" description="Audit trail highlights">
          <ul className="space-y-3">
            {AUDIT_LOGS.slice(0, 5).map((log) => (
              <li key={log.id} className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink">{log.action}</p>
                  <p className="truncate text-xs text-muted">{log.target}</p>
                  <p className="text-[0.65rem] text-muted">{formatDateTime(log.at)}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/admin/audit-logs" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
            Full audit log
            <ArrowRight className="size-3.5" />
          </Link>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Top events by tickets sold">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventPerformance} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece7f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#777777" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "#777777" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #ece7f6", fontSize: 12 }} />
                <Bar dataKey="sold" name="Tickets" fill="#6500e8" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="User growth" description="Buyers and sellers by month">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece7f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#777777" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#777777" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #ece7f6", fontSize: 12 }} />
                <Area type="monotone" dataKey="buyers" stroke="#6500e8" fill="#6500e8" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="sellers" stroke="#ac6bff" fill="#ac6bff" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted">
              <span className="size-2 rounded-full bg-brand-600" /> Buyers
            </span>
            <span className="flex items-center gap-1.5 text-muted">
              <span className="size-2 rounded-full bg-brand-400" /> Sellers
            </span>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Approvals queue" padded={false}>
          {pendingEvents.length === 0 ? (
            <p className="p-4 text-sm text-muted">Nothing waiting for review.</p>
          ) : (
            <ul className="divide-y divide-line">
              {pendingEvents.slice(0, 4).map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{event.title}</p>
                    <p className="text-xs text-muted">{event.organizer.name}</p>
                  </div>
                  <Link href="/admin/event-approvals" className="text-xs font-semibold text-brand-700 hover:underline">
                    Review
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Latest transactions" padded={false}>
          <TableShell
            head={
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">Reference</th>
                <th scope="col" className="px-3 py-2 font-semibold">Amount</th>
                <th scope="col" className="px-3 py-2 font-semibold">Status</th>
              </tr>
            }
          >
            {SALES.slice(0, 5).map((sale) => (
              <tr key={sale.id}>
                <td className="px-3 py-2 font-mono text-[0.7rem] text-ink">{sale.reference}</td>
                <td className="px-3 py-2 text-xs text-ink tabular">{formatMoney(sale.amount, { compact: true })}</td>
                <td className="px-3 py-2">
                  <Badge tone={sale.status === "successful" ? "success" : sale.status === "pending" ? "warning" : "danger"}>
                    {sale.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </TableShell>
        </Panel>

        <Panel title="Event mix">
          <ul className="space-y-3">
            {[
              { label: "Concerts & music", value: 42 },
              { label: "Conferences", value: 24 },
              { label: "Festivals", value: 18 },
              { label: "Sports", value: 16 },
            ].map((item) => (
              <li key={item.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-ink">{item.label}</span>
                  <span className="text-muted">{item.value}%</span>
                </div>
                <ProgressBar value={item.value} max={100} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            {events.length} events total · {formatDate(new Date().toISOString(), "day")} snapshot
          </p>
        </Panel>
      </div>
    </div>
  );
}
