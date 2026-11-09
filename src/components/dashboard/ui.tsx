import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  change?: number;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "brand";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5",
        tone === "brand"
          ? "border-brand-700 bg-brand-950 text-white shadow-glow-strong"
          : "border-pink-500/10 bg-white shadow-glow hover:shadow-glow-hover",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            tone === "brand" ? "text-brand-200" : "text-muted",
          )}
        >
          {label}
        </p>
        {icon ? (
          <span
            className={cn(
              "grid size-8 place-items-center rounded-lg",
              tone === "brand" ? "bg-white/10 text-brand-100" : "bg-brand-50 text-brand-600",
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-extrabold tabular">{value}</p>
      <div className="mt-1 flex items-center gap-1.5 text-xs">
        {typeof change === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-bold",
              change > 0 ? "text-success" : change < 0 ? "text-danger" : "text-muted",
              tone === "brand" && (change > 0 ? "text-green-300" : "text-red-300"),
            )}
          >
            {change > 0 ? (
              <ArrowUpRight className="size-3.5" />
            ) : change < 0 ? (
              <ArrowDownRight className="size-3.5" />
            ) : (
              <Minus className="size-3.5" />
            )}
            {Math.abs(change)}%
          </span>
        ) : null}
        {hint ? (
          <span className={tone === "brand" ? "text-brand-200" : "text-muted"}>{hint}</span>
        ) : null}
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  padded = true,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("rounded-2xl border border-pink-500/10 bg-white shadow-glow", className)}>
      {title ? (
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-ink">{title}</h2>
            {description ? <p className="mt-0.5 text-xs text-muted">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={padded ? "p-4" : ""}>{children}</div>
    </section>
  );
}

export function ProgressBar({
  value,
  max = 100,
  label,
  tone = "brand",
}: {
  value: number;
  max?: number;
  label?: string;
  tone?: "brand" | "success" | "warning";
}) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      {label ? (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-ink">{label}</span>
          <span className="text-muted">{pct}%</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-brand-100">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-brand-600",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function MoneyCell({ amount }: { amount: number }) {
  return <span className="tabular">{formatMoney(amount)}</span>;
}

export function TableShell({
  head,
  children,
  className,
}: {
  head: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[42rem] text-left text-sm">
        <thead className="bg-brand-50/60 text-xs uppercase tracking-wider text-muted">
          {head}
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function DashboardHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
