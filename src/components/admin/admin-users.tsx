"use client";

import { useMemo, useState } from "react";
import { Search, UserCheck, UserX, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { ADMIN_USERS } from "@/lib/seed/seller";
import { setUserStatus, useDb } from "@/lib/store";
import { formatDate, cn, initials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatCard, Panel, TableShell, DashboardHeader } from "@/components/dashboard/ui";

const TABS = [
  { id: "all", label: "All users" },
  { id: "buyer", label: "Buyers" },
  { id: "seller", label: "Sellers" },
  { id: "admin", label: "Admins" },
] as const;

export function AdminUsers() {
  const db = useDb();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const users = useMemo(
    () =>
      ADMIN_USERS.map((user) => ({
        ...user,
        status: db.userStatuses[user.id] ?? user.status,
      })),
    [db.userStatuses],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((user) => {
      if (tab !== "all" && user.role !== tab) return false;
      if (!normalized) return true;
      return [user.name, user.email, user.phone].join(" ").toLowerCase().includes(normalized);
    });
  }, [users, tab, query]);

  function changeStatus(id: string, status: "active" | "suspended" | "restricted") {
    setUserStatus(id, status);
    setSelected(null);
    toast.success(`User marked ${status}`);
  }

  return (
    <div>
      <DashboardHeader
        title="Users"
        description="Buyers, sellers and administrators in one place. Every action is written to the audit log."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="All users" value={users.length.toLocaleString()} icon={<Users className="size-4" />} tone="brand" />
        <StatCard label="Sellers" value={users.filter((user) => user.role === "seller").length.toLocaleString()} icon={<ShieldCheck className="size-4" />} />
        <StatCard label="Suspended" value={users.filter((user) => user.status === "suspended").length.toLocaleString()} icon={<UserX className="size-4" />} />
        <StatCard label="Restricted" value={users.filter((user) => user.status === "restricted").length.toLocaleString()} icon={<ShieldAlert className="size-4" />} />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white shadow-glow">
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTab(option.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold",
                  tab === option.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line text-ink/70 hover:bg-brand-50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3">
            <Search className="size-4 text-muted" />
            <label htmlFor="user-search" className="sr-only">Search users</label>
            <input
              id="user-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, email or phone"
              className="h-9 w-full bg-transparent text-sm focus:outline-none sm:w-56"
            />
          </div>
        </div>

        <TableShell
          head={
            <tr>
              <th scope="col" className="px-4 py-2.5 font-semibold">User</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Role</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Joined</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Actions</th>
            </tr>
          }
        >
          {filtered.map((user) => (
            <tr key={user.id} className="hover:bg-brand-50/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-100 text-xs font-bold text-brand-800">
                    {initials(user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge tone={user.role === "seller" ? "brand" : user.role === "admin" ? "warning" : "neutral"}>
                  {user.role}
                </Badge>
              </td>
              <td className="px-4 py-3 text-xs text-muted">{formatDate(user.joinedAt, "day")}</td>
              <td className="px-4 py-3">
                <Badge tone={user.status === "active" ? "success" : user.status === "suspended" ? "danger" : "warning"}>
                  {user.status}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSelected(selected === user.id ? null : user.id)}
                    className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-ink hover:bg-brand-50"
                    aria-expanded={selected === user.id}
                  >
                    Manage
                  </button>
                  {selected === user.id ? (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={() => setSelected(null)}
                        aria-label="Close"
                      />
                      <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-line bg-white p-1 shadow-glow-hover">
                        <button
                          type="button"
                          onClick={() => changeStatus(user.id, "active")}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink hover:bg-brand-50"
                        >
                          <UserCheck className="size-3.5" />
                          Activate
                        </button>
                        <button
                          type="button"
                          onClick={() => changeStatus(user.id, "restricted")}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-warning hover:bg-amber-50"
                        >
                          <ShieldAlert className="size-3.5" />
                          Restrict
                        </button>
                        <button
                          type="button"
                          onClick={() => changeStatus(user.id, "suspended")}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-danger hover:bg-red-50"
                        >
                          <UserX className="size-3.5" />
                          Suspend
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </TableShell>
        <p className="border-t border-line px-4 py-2.5 text-xs text-muted">
          {filtered.length} user{filtered.length === 1 ? "" : "s"} shown
        </p>
      </div>

      <div className="mt-4">
        <Panel title="About account states">
          <ul className="space-y-2 text-sm text-muted">
            <li><strong className="text-ink">Active</strong> — full access to buying or selling.</li>
            <li><strong className="text-ink">Restricted</strong> — can sign in but cannot publish new events or request payouts.</li>
            <li><strong className="text-ink">Suspended</strong> — blocked from signing in. Existing tickets remain valid.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
