"use client";

import { useMemo, useState } from "react";
import { Download, Search, Users, QrCode, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { SALES } from "@/lib/seed/seller";
import { formatDate, formatMoney, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatCard, TableShell, DashboardHeader } from "@/components/dashboard/ui";

interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  event: string;
  ticketNumber: string;
  purchasedAt: string;
  checkedIn: boolean;
  amount: number;
}

const ATTENDEES: Attendee[] = SALES.flatMap((sale, saleIndex) =>
  Array.from({ length: sale.quantity }, (_, ticketIndex) => ({
    id: `${sale.id}-${ticketIndex}`,
    name:
      ticketIndex === 0
        ? sale.buyer
        : `${sale.buyer.split(" ")[0]} +${ticketIndex}`,
    email: sale.email,
    ticketType: sale.ticketType,
    event: sale.eventTitle,
    ticketNumber: `TKAAR-${String(4000 + saleIndex)}-${String(7100 + ticketIndex)}`,
    purchasedAt: sale.createdAt,
    checkedIn: sale.status === "successful" && (saleIndex + ticketIndex) % 3 !== 0,
    amount: sale.amount / sale.quantity,
  })),
);

const TYPES = ["all", ...new Set(SALES.map((sale) => sale.ticketType))];

export function AttendeesPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [checkedOnly, setCheckedOnly] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return ATTENDEES.filter((attendee) => {
      if (type !== "all" && attendee.ticketType !== type) return false;
      if (checkedOnly && !attendee.checkedIn) return false;
      if (!normalized) return true;
      return [attendee.name, attendee.email, attendee.ticketNumber, attendee.event]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [query, type, checkedOnly]);

  const checkedIn = ATTENDEES.filter((attendee) => attendee.checkedIn).length;

  function exportCsv() {
    const header = ["Name", "Email", "Event", "Ticket type", "Ticket number", "Purchased", "Checked in"];
    const rows = filtered.map((attendee) => [
      attendee.name,
      attendee.email,
      attendee.event,
      attendee.ticketType,
      attendee.ticketNumber,
      attendee.purchasedAt,
      attendee.checkedIn ? "Yes" : "No",
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ticketaar-attendees.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} attendees`);
  }

  return (
    <div>
      <DashboardHeader
        title="Attendees"
        description="Every ticket holder, with check-in status and ticket numbers."
        actions={
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-brand-50"
          >
            <Download className="size-4" />
            Export list
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total attendees" value={ATTENDEES.length.toLocaleString()} icon={<Users className="size-4" />} tone="brand" />
        <StatCard label="Checked in" value={checkedIn.toLocaleString()} hint={`${Math.round((checkedIn / ATTENDEES.length) * 100)}% of attendees`} icon={<CheckCircle2 className="size-4" />} />
        <StatCard label="Awaiting check-in" value={(ATTENDEES.length - checkedIn).toLocaleString()} icon={<Clock className="size-4" />} />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white shadow-glow">
        <div className="flex flex-col gap-3 border-b border-line p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="type-filter" className="sr-only">Filter by ticket type</label>
            <select
              id="type-filter"
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-9 rounded-xl border border-line bg-white px-2.5 text-xs font-medium text-ink focus:border-brand-500 focus:outline-none"
            >
              {TYPES.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All ticket types" : option}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCheckedOnly((value) => !value)}
              aria-pressed={checkedOnly}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold",
                checkedOnly
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-line text-ink/70 hover:bg-brand-50",
              )}
            >
              <QrCode className="size-3.5" />
              Checked in only
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3">
            <Search className="size-4 text-muted" />
            <label htmlFor="attendee-search" className="sr-only">Search attendees</label>
            <input
              id="attendee-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, email or ticket number"
              className="h-9 w-full bg-transparent text-sm focus:outline-none sm:w-64"
            />
          </div>
        </div>

        <TableShell
          head={
            <tr>
              <th scope="col" className="px-4 py-2.5 font-semibold">Attendee</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Event</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Type</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Ticket number</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Purchased</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Check-in</th>
            </tr>
          }
        >
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                No attendees match those filters.
              </td>
            </tr>
          ) : (
            filtered.slice(0, 60).map((attendee) => (
              <tr key={attendee.id} className="hover:bg-brand-50/40">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-ink">{attendee.name}</p>
                  <p className="text-xs text-muted">{attendee.email}</p>
                </td>
                <td className="max-w-48 px-4 py-3">
                  <p className="truncate text-xs text-ink">{attendee.event}</p>
                </td>
                <td className="px-4 py-3 text-xs text-ink">{attendee.ticketType}</td>
                <td className="px-4 py-3 font-mono text-[0.7rem] text-muted">{attendee.ticketNumber}</td>
                <td className="px-4 py-3 text-xs text-muted">{formatDate(attendee.purchasedAt, "day")}</td>
                <td className="px-4 py-3">
                  <Badge tone={attendee.checkedIn ? "success" : "neutral"}>
                    {attendee.checkedIn ? "Checked in" : "Not yet"}
                  </Badge>
                </td>
              </tr>
            ))
          )}
        </TableShell>
        <p className="border-t border-line px-4 py-2.5 text-xs text-muted">
          Showing {Math.min(filtered.length, 60)} of {filtered.length} attendees ·{" "}
          {formatMoney(ATTENDEES.reduce((sum, attendee) => sum + attendee.amount, 0), { compact: true })}{" "}
          in ticket value
        </p>
      </div>
    </div>
  );
}
