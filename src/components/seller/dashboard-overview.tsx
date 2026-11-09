"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Banknote,
  CalendarDays,
  Ticket,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { useDb } from "@/lib/store";
import { EVENTS } from "@/lib/seed/events";
import { SALES, SELLER_EVENT_EXTRAS, sellerTotals } from "@/lib/seed/seller";
import { formatDate, formatMoney, cn } from "@/lib/utils";
import { StatCard, Panel, ProgressBar, TableShell, DashboardHeader } from "@/components/dashboard/ui";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";

const RANGES = [
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
] as const;

const CHART_COLORS = ["#6500e8", "#8a2bf5", "#ac6bff", "#cda6ff"];

export function SellerDashboard() {
  const db = useDb();
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("30");
  const totals = sellerTotals();

  const sellerEvents = useMemo(() => {
    const base = [
      ...EVENTS.filter((event) => event.organizer.id === "org-pulse"),
      ...SELLER_EVENT_EXTRAS,
    ];
    const overrides = new Map(db.sellerEvents.map((event) => [event.id, event]));
    return base.map((event) => overrides.get(event.id) ?? event);
  }, [db.sellerEvents]);

  const upcoming = sellerEvents.filter((event) => event.status === "published");
  const pending = sellerEvents.filter((event) => event.status === "pending");

  const chartData = useMemo(() => {
    const days = Number(range);
    const buckets = new Map<string, { label: string; revenue: number; tickets: number }>();
    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = date.toISOString().slice(0, 10);
      buckets.set(key, {
        label: date.toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
        revenue: 0,
        tickets: 0,
      });
    }
    SALES.forEach((sale) => {
      if (sale.status !== "successful") return;
      const key = sale.createdAt.slice(0, 10);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.revenue += sale.amount;
        bucket.tickets += sale.quantity;
      }
    });
    return [...buckets.values()];
  }, [range]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    SALES.filter((sale) => sale.status === "successful").forEach((sale) => {
      map.set(sale.ticketType, (map.get(sale.ticketType) ?? 0) + sale.amount);
    });
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, []);

  const recent = SALES.slice(0, 6);
  const available = Math.round(totals.net * 0.42);

  return (
    <div>
      <DashboardHeader
        title="Dashboard"
        description={`Here is how ${db.sellerSession?.organization ?? "your events"} are performing.`}
        actions={
          <>
            <LinkButton href="/seller/sales" variant="outline" size="md">
              View sales
            </LinkButton>
            <LinkButton href="/seller/events/create" size="md">
              <Plus className="size-4" />
              Create event
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total sales"
          value={formatMoney(totals.gross, { compact: true })}
          change={18.4}
          hint="vs last month"
          icon={<Banknote className="size-4" />}
          tone="brand"
        />
        <StatCard
          label="Tickets sold"
          value={totals.tickets.toLocaleString()}
          change={12.1}
          hint="across all events"
          icon={<Ticket className="size-4" />}
        />
        <StatCard
          label="Active events"
          value={String(upcoming.length)}
          hint={`${pending.length} awaiting approval`}
          icon={<CalendarDays className="size-4" />}
        />
        <StatCard
          label="Available balance"
          value={formatMoney(available, { compact: true })}
          hint={`Commission ${formatMoney(totals.commission, { compact: true })}`}
          icon={<Wallet className="size-4" />}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Panel
          title="Revenue"
          description="Confirmed ticket sales over the selected period"
          action={
            <div className="flex gap-1 rounded-lg bg-brand-50 p-0.5">
              {RANGES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRange(option.id)}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-semibold transition-colors",
                    range === option.id ? "bg-white text-brand-700 shadow-sm" : "text-muted",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6500e8" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6500e8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece7f6" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#777777" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#777777" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  formatter={(value) => [formatMoney(Number(value)), "Revenue"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #ece7f6", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6500e8"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 border-t border-line pt-3">
            {[
              { label: "Gross", value: formatMoney(totals.gross, { compact: true }) },
              { label: "Commission", value: formatMoney(totals.commission, { compact: true }) },
              { label: "Net earnings", value: formatMoney(totals.net, { compact: true }) },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-[0.68rem] uppercase tracking-wide text-muted">{stat.label}</p>
                <p className="text-sm font-extrabold text-ink tabular">{stat.value}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Ticket mix" description="Revenue by ticket category">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={3}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatMoney(Number(value))}
                  contentStyle={{ borderRadius: 12, border: "1px solid #ece7f6", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {categoryData.map((entry, index) => (
              <li key={entry.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-ink">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  {entry.name}
                </span>
                <span className="font-semibold text-muted tabular">
                  {formatMoney(entry.value, { compact: true })}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Panel
          title="Recent sales"
          description="Latest confirmed and pending transactions"
          action={
            <Link href="/seller/sales" className="text-xs font-semibold text-brand-700 hover:underline">
              View all
            </Link>
          }
          padded={false}
        >
          <TableShell
            head={
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">Buyer</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Event</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Qty</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Amount</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            }
          >
            {recent.map((sale) => (
              <tr key={sale.id} className="hover:bg-brand-50/40">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{sale.buyer}</p>
                  <p className="text-xs text-muted">{formatDate(sale.createdAt, "day")}</p>
                </td>
                <td className="max-w-44 px-4 py-3">
                  <p className="truncate text-xs font-medium text-ink">{sale.eventTitle}</p>
                  <p className="text-[0.7rem] text-muted">{sale.ticketType}</p>
                </td>
                <td className="px-4 py-3 text-xs text-ink tabular">{sale.quantity}</td>
                <td className="px-4 py-3 text-xs font-semibold text-ink tabular">
                  {formatMoney(sale.amount)}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      sale.status === "successful"
                        ? "success"
                        : sale.status === "pending"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {sale.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </TableShell>
        </Panel>

        <Panel title="Live events" description="Sales progress by event">
          <ul className="space-y-4">
            {upcoming.map((event) => {
              const sold = event.ticketTypes.reduce((sum, type) => sum + type.sold, 0);
              const capacity = event.ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
              return (
                <li key={event.id}>
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div>
                      <p className="line-clamp-1 text-sm font-semibold text-ink">{event.title}</p>
                      <p className="text-xs text-muted">
                        {formatDate(event.startDate, "day")} · {sold}/{capacity} sold
                      </p>
                    </div>
                    <Link
                      href={`/seller/events/${event.id}`}
                      className="grid size-7 shrink-0 place-items-center rounded-lg text-brand-700 hover:bg-brand-50"
                      aria-label={`Open ${event.title}`}
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                  <ProgressBar value={sold} max={capacity} tone={sold / capacity > 0.85 ? "warning" : "brand"} />
                </li>
              );
            })}
          </ul>
          <div className="mt-4 rounded-xl bg-brand-50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold text-brand-800">
              <TrendingUp className="size-3.5" />
              Best seller
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">Altè Beats Concert</p>
            <p className="text-xs text-muted">₦{formatMoney(4125000, { compact: true }).replace("₦", "")} in ticket sales</p>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Quick actions">
          <div className="grid gap-2">
            <LinkButton href="/seller/events/create" size="md">
              <Plus className="size-4" />
              Create a new event
            </LinkButton>
            <LinkButton href="/seller/verification" variant="outline" size="md">
              <Users className="size-4" />
              Open check-in scanner
            </LinkButton>
            <LinkButton href="/seller/payouts" variant="outline" size="md">
              <Wallet className="size-4" />
              Request a payout
            </LinkButton>
          </div>
        </Panel>
        <Panel title="Recent activity" className="lg:col-span-2">
          <ul className="space-y-3">
            {db.notifications.slice(0, 5).map((notification) => (
              <li key={notification.id} className="flex items-start gap-3">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-brand-500" />
                <div>
                  <p className="text-sm font-medium text-ink">{notification.title}</p>
                  <p className="text-xs text-muted">{notification.body}</p>
                </div>
              </li>
            ))}
            {db.notifications.length === 0 ? (
              <li className="text-sm text-muted">
                No activity yet. New sales and approvals will appear here.
              </li>
            ) : null}
          </ul>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Tickets sold by day">
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece7f6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#777777" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "#777777" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #ece7f6", fontSize: 12 }} />
                <Bar dataKey="tickets" fill="#8a2bf5" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
