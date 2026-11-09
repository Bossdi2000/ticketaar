import * as React from "react";
import { cn } from "@/lib/utils";
import type { EventStatus, OrderStatus, RefundStatus, TicketStatus } from "@/lib/types";

type Tone = "brand" | "success" | "danger" | "warning" | "neutral";

const tones: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-800 border-brand-200",
  success: "bg-green-50 text-success border-green-200",
  danger: "bg-red-50 text-danger border-red-200",
  warning: "bg-amber-50 text-warning border-amber-200",
  neutral: "bg-brand-50 text-muted border-line",
};

export function Badge({
  tone = "brand",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const eventTone: Record<EventStatus, Tone> = {
  draft: "neutral",
  pending: "warning",
  published: "success",
  rejected: "danger",
  cancelled: "danger",
  completed: "brand",
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return <Badge tone={eventTone[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}

const orderTone: Record<OrderStatus, Tone> = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  refunded: "neutral",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={orderTone[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}

const ticketTone: Record<TicketStatus, Tone> = {
  valid: "success",
  used: "neutral",
  refunded: "danger",
  transferred: "warning",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge tone={ticketTone[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}

const refundTone: Record<RefundStatus, Tone> = {
  pending: "warning",
  approved: "brand",
  rejected: "danger",
  processed: "success",
};

export function RefundStatusBadge({ status }: { status: RefundStatus }) {
  return <Badge tone={refundTone[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}
