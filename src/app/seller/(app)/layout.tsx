"use client";

import {
  LayoutDashboard,
  CalendarDays,
  ReceiptText,
  Users,
  QrCode,
  BarChart3,
  Wallet,
  Bell,
  User,
  Settings,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";
import { useDb } from "@/lib/store";

const nav: NavItem[] = [
  { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/events", label: "Events", icon: CalendarDays },
  { href: "/seller/sales", label: "Sales", icon: ReceiptText },
  { href: "/seller/attendees", label: "Attendees", icon: Users },
  { href: "/seller/verification", label: "Verification", icon: QrCode },
  { href: "/seller/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/seller/payouts", label: "Payouts", icon: Wallet },
  { href: "/seller/notifications", label: "Notifications", icon: Bell },
  { href: "/seller/profile", label: "Profile", icon: User },
  { href: "/seller/settings", label: "Settings", icon: Settings },
];

export default function SellerAppLayout({ children }: { children: React.ReactNode }) {
  const db = useDb();
  const unread = db.notifications.filter(
    (notification) => notification.audience === "seller" && !notification.read,
  ).length;

  const items = nav.map((item) =>
    item.href === "/seller/notifications" && unread > 0 ? { ...item, badge: unread } : item,
  );

  return (
    <DashboardShell variant="seller" nav={items} title="Ticketaar Organiser">
      {children}
    </DashboardShell>
  );
}
