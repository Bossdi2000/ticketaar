"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  X,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn, initials } from "@/lib/utils";
import { useDb, signOutSeller, signOutAdmin, markNotificationsRead } from "@/lib/store";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function DashboardShell({
  children,
  variant,
  nav,
  title,
}: {
  children: React.ReactNode;
  variant: "seller" | "admin";
  nav: NavItem[];
  title: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const db = useDb();
  const [ready, setReady] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const session = variant === "seller" ? db.sellerSession : db.adminSession;

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    setDrawer(false);
    setBellOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace(variant === "seller" ? "/seller/login" : "/admin/login");
    }
  }, [ready, session, router, variant]);

  if (!ready || !session) {
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas">
        <p className="text-sm text-muted">
          {ready ? "Redirecting to sign in…" : "Checking your session…"}
        </p>
      </div>
    );
  }

  const notifications = db.notifications.filter(
    (notification) => notification.audience === (variant === "seller" ? "seller" : "admin"),
  );
  const unread = notifications.filter((notification) => !notification.read).length;

  function signOut() {
    if (variant === "seller") signOutSeller();
    else signOutAdmin();
    router.replace(variant === "seller" ? "/seller/login" : "/admin/login");
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Link href={variant === "seller" ? "/seller/dashboard" : "/admin/dashboard"}>
          <Logo inverted size="sm" />
        </Link>
      </div>

      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-brand-300">
          {variant === "seller" ? "Organiser" : "Platform"}
        </p>
        <p className="mt-0.5 truncate text-sm font-bold text-white">{title}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label={variant}>
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/seller/dashboard" &&
              item.href !== "/admin/dashboard" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-brand-800 shadow-sm"
                  : "text-brand-100 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className={cn("size-4.5 shrink-0", active ? "text-brand-600" : "")} />
              <span className="truncate">{item.label}</span>
              {item.badge ? (
                <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-brand-500 px-1.5 py-0.5 text-[0.6rem] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-brand-100 hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="size-4" />
          View storefront
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-brand-100 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-brand-950 lg:block">
        {sidebar}
      </aside>

      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-brand-950">
            <button
              type="button"
              onClick={() => setDrawer(false)}
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg text-brand-200 hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="app-bar">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="grid size-10 place-items-center rounded-xl text-ink hover:bg-brand-50 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>

            <div className="hidden items-center gap-2 rounded-xl border border-line bg-canvas px-3 md:flex">
              <Search className="size-4 text-muted" />
              <label htmlFor="dash-search" className="sr-only">
                Search
              </label>
              <input
                id="dash-search"
                placeholder="Search events, orders, attendees"
                className="h-9 w-56 bg-transparent text-sm focus:outline-none"
              />
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setBellOpen((value) => !value);
                    if (!bellOpen && unread > 0) {
                      markNotificationsRead(variant === "seller" ? "seller" : "admin");
                    }
                  }}
                  className="relative grid size-10 place-items-center rounded-xl text-ink/70 hover:bg-brand-50"
                  aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
                  aria-expanded={bellOpen}
                >
                  <Bell className="size-5" />
                  {unread > 0 ? (
                    <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger" />
                  ) : null}
                </button>
                {bellOpen ? (
                  <div className="absolute right-0 top-12 w-80 rounded-2xl border border-line bg-white p-2 shadow-glow-hover">
                    <p className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                      Notifications
                    </p>
                    {notifications.length === 0 ? (
                      <p className="px-2 py-4 text-sm text-muted">Nothing new right now.</p>
                    ) : (
                      <ul className="max-h-80 space-y-1 overflow-y-auto">
                        {notifications.slice(0, 8).map((notification) => (
                          <li key={notification.id} className="rounded-xl p-2 hover:bg-brand-50">
                            <p className="text-sm font-semibold text-ink">{notification.title}</p>
                            <p className="mt-0.5 text-xs text-muted">{notification.body}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-line py-1 pl-1 pr-2">
                <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-xs font-bold text-white">
                  {initials(session.name)}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[9rem] truncate text-xs font-bold text-ink">
                    {session.name}
                  </span>
                  <span className="block max-w-[9rem] truncate text-[0.65rem] text-muted">
                    {session.email}
                  </span>
                </span>
                <ChevronDown className="hidden size-3.5 text-muted sm:block" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 pb-24 sm:p-6 lg:pb-6">{children}</div>
      </div>

      <DashboardBottomNav variant={variant} nav={nav} onMore={() => setDrawer(true)} />
    </div>
  );
}

function DashboardBottomNav({
  variant,
  nav,
  onMore,
}: {
  variant: "seller" | "admin";
  nav: NavItem[];
  onMore: () => void;
}) {
  const pathname = usePathname();
  const quick = nav.slice(0, 4);

  return (
    <nav className="app-bottom-nav lg:hidden" aria-label={`${variant} quick`}>
      <ul className="flex items-stretch px-2 pb-1 pt-1.5">
        {quick.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/seller/dashboard" &&
              item.href !== "/admin/dashboard" &&
              pathname.startsWith(item.href));
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.62rem] font-semibold transition-colors active:scale-95",
                  active ? "text-brand-700" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-lg",
                    active && "bg-brand-50",
                  )}
                >
                  <item.icon className={cn("size-[1.15rem]", active && "stroke-[2.5]")} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            type="button"
            onClick={onMore}
            className="flex min-h-[3.25rem] w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.62rem] font-semibold text-muted active:scale-95"
          >
            <span className="grid size-8 place-items-center rounded-lg">
              <Menu className="size-[1.15rem]" />
            </span>
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}
