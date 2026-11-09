"use client";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ShieldCheck,
  ReceiptText,
  Percent,
  RotateCcw,
  Wallet,
  BarChart3,
  Bell,
  ScrollText,
  Settings,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";
import { useDb } from "@/lib/store";
import { SEED_REFUNDS } from "@/lib/seed/admin";

const nav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/event-approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/admin/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/admin/commissions", label: "Commissions", icon: Percent },
  { href: "/admin/refunds", label: "Refunds", icon: RotateCcw },
  { href: "/admin/payouts", label: "Payouts", icon: Wallet },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/audit-logs", label: "Audit logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const db = useDb();
  const pendingRefunds =
    db.refunds.filter((refund) => refund.status === "pending").length +
    SEED_REFUNDS.filter((refund) => refund.status === "pending").length;
  const unread = db.notifications.filter(
    (notification) => notification.audience === "admin" && !notification.read,
  ).length;

  const items = nav.map((item) => {
    if (item.href === "/admin/refunds" && pendingRefunds > 0) {
      return { ...item, badge: pendingRefunds };
    }
    if (item.href === "/admin/notifications" && unread > 0) {
      return { ...item, badge: unread };
    }
    return item;
  });

  return (
    <DashboardShell variant="admin" nav={items} title="Ticketaar Admin">
      {children}
    </DashboardShell>
  );
}
