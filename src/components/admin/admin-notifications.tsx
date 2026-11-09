"use client";

import { Bell, CheckCheck } from "lucide-react";
import { markNotificationsRead, useDb } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";
import { DashboardHeader, Panel } from "@/components/dashboard/ui";
import { EmptyState } from "@/components/layout/page";

export function AdminNotifications() {
  const db = useDb();
  const notifications = db.notifications.filter(
    (notification) => notification.audience === "admin",
  );

  return (
    <div>
      <DashboardHeader
        title="Notifications"
        description="Refund requests, payout activity and platform events."
        actions={
          <button
            type="button"
            onClick={() => markNotificationsRead("admin")}
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
          title="Nothing needs attention"
          description="New refund requests, payout requests and seller activity will appear here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                notification.read ? "border-line bg-white" : "border-brand-200 bg-brand-50/60"
              }`}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                <Bell className="size-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{notification.title}</p>
                <p className="mt-0.5 text-sm text-muted">{notification.body}</p>
                <p className="mt-1 text-[0.7rem] text-muted">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Panel title="Delivery">
          <p className="text-sm text-muted">
            Admin alerts are also emailed to every account with the <strong className="text-ink">super-admin</strong> or{" "}
            <strong className="text-ink">finance</strong> permission once Resend credentials are configured.
          </p>
        </Panel>
      </div>
    </div>
  );
}
