"use client";

import { Bell, CheckCheck, Ticket, Wallet, CalendarDays } from "lucide-react";
import { markNotificationsRead, useDb } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";
import { DashboardHeader, Panel } from "@/components/dashboard/ui";
import { EmptyState } from "@/components/layout/page";

const iconFor = (title: string) => {
  if (/payout/i.test(title)) return Wallet;
  if (/sale|ticket/i.test(title)) return Ticket;
  if (/event|approv/i.test(title)) return CalendarDays;
  return Bell;
};

export function NotificationsPage() {
  const db = useDb();
  const notifications = db.notifications.filter(
    (notification) => notification.audience === "seller",
  );
  const unread = notifications.filter((notification) => !notification.read).length;

  return (
    <div>
      <DashboardHeader
        title="Notifications"
        description={`${unread} unread of ${notifications.length}`}
        actions={
          <button
            type="button"
            onClick={() => markNotificationsRead("seller")}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-brand-50"
          >
            <CheckCheck className="size-4" />
            Mark all read
          </button>
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-6" />}
          title="No notifications yet"
          description="New sales, event approvals and payout updates will appear here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = iconFor(notification.title);
            return (
              <article
                key={notification.id}
                className={`flex items-start gap-3 rounded-2xl border p-4 ${
                  notification.read ? "border-line bg-white" : "border-brand-200 bg-brand-50/60"
                }`}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-ink">{notification.title}</p>
                    {!notification.read ? <span className="size-1.5 rounded-full bg-brand-600" /> : null}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{notification.body}</p>
                  <p className="mt-1 text-[0.7rem] text-muted">
                    {formatDateTime(notification.createdAt)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        <Panel title="Notification channels">
          <p className="text-sm text-muted">
            Email notifications are sent through Resend once <code className="rounded bg-brand-50 px-1 py-0.5 text-xs">RESEND_API_KEY</code> is configured. In-app notifications are always on.
          </p>
        </Panel>
      </div>
    </div>
  );
}
