"use client";

import { useMemo, useState } from "react";
import { Percent, Save, Info } from "lucide-react";
import { toast } from "sonner";
import { SALES, COMMISSION_RATE } from "@/lib/seed/seller";
import { formatMoney } from "@/lib/utils";
import { Field, Input } from "@/components/ui/field";
import { StatCard, Panel, TableShell, DashboardHeader } from "@/components/dashboard/ui";

export function AdminCommissions() {
  const [rate, setRate] = useState((COMMISSION_RATE * 100).toFixed(1));
  const [fixedFee, setFixedFee] = useState("100");

  const successful = SALES.filter((sale) => sale.status === "successful");
  const gross = successful.reduce((sum, sale) => sum + sale.amount, 0);
  const commission = successful.reduce((sum, sale) => sum + sale.commission, 0);

  const byEvent = useMemo(() => {
    const map = new Map<string, { name: string; gross: number; commission: number }>();
    successful.forEach((sale) => {
      const current = map.get(sale.eventTitle) ?? {
        name: sale.eventTitle,
        gross: 0,
        commission: 0,
      };
      current.gross += sale.amount;
      current.commission += sale.commission;
      map.set(sale.eventTitle, current);
    });
    return [...map.values()].sort((a, b) => b.gross - a.gross);
  }, [successful]);

  return (
    <div>
      <DashboardHeader
        title="Commissions"
        description="Set the platform rate and audit what each event earns you."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Total commission" value={formatMoney(commission, { compact: true })} icon={<Percent className="size-4" />} tone="brand" />
        <StatCard label="Gross volume" value={formatMoney(gross, { compact: true })} hint="Across all sellers" />
        <StatCard label="Effective rate" value={`${((commission / gross) * 100).toFixed(1)}%`} hint="Weighted average" />
        <StatCard label="Transactions" value={successful.length.toLocaleString()} hint="Commission-bearing" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.5fr] lg:items-start">
        <Panel title="Commission settings">
          <div className="space-y-3">
            <Field label="Platform commission (%)" htmlFor="c-rate" hint="Applied to new transactions only">
              <Input
                id="c-rate"
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
              />
            </Field>
            <Field label="Fixed fee per transaction (₦)" htmlFor="c-fee">
              <Input
                id="c-fee"
                type="number"
                min="0"
                value={fixedFee}
                onChange={(event) => setFixedFee(event.target.value)}
              />
            </Field>
            <button
              type="button"
              onClick={() =>
                toast.success(`Commission set to ${rate}% with a ₦${fixedFee} fixed fee`)
              }
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Save className="size-4" />
              Save rate
            </button>
            <p className="flex items-start gap-1.5 rounded-xl bg-brand-50 p-3 text-[0.7rem] leading-relaxed text-brand-800">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Rate changes never alter historical transactions. Each sale keeps the rate that was in
              force when it was paid.
            </p>
          </div>
        </Panel>

        <Panel title="Commission by event" padded={false}>
          <TableShell
            head={
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">Event</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Gross</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Commission</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Seller net</th>
              </tr>
            }
          >
            {byEvent.map((event) => (
              <tr key={event.name} className="hover:bg-brand-50/40">
                <td className="px-4 py-3 text-xs font-medium text-ink">{event.name}</td>
                <td className="px-4 py-3 text-xs text-ink tabular">{formatMoney(event.gross)}</td>
                <td className="px-4 py-3 text-xs font-semibold text-brand-700 tabular">
                  {formatMoney(event.commission)}
                </td>
                <td className="px-4 py-3 text-xs text-muted tabular">
                  {formatMoney(event.gross - event.commission)}
                </td>
              </tr>
            ))}
          </TableShell>
        </Panel>
      </div>
    </div>
  );
}
