"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Ticket, User, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const left = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Search", icon: Search },
];

const right = [
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/contact", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="app-bottom-nav lg:hidden" aria-label="Buyer">
      <div className="relative flex items-end justify-around px-3 pb-1 pt-1.5">
        {left.map((item) => (
          <NavItem key={item.href} {...item} pathname={pathname} />
        ))}

        {/* Elevated centre action */}
        <Link
          href="/events"
          aria-label="Explore events"
          className="absolute -top-5 left-1/2 grid size-14 -translate-x-1/2 place-items-center rounded-full brand-gradient-pink text-white shadow-[0_10px_28px_-8px_rgba(236,31,138,0.95)] ring-4 ring-white active:scale-95"
        >
          <Compass className="size-6" />
        </Link>
        <span className="w-14 shrink-0" aria-hidden="true" />

        {right.map((item) => (
          <NavItem key={item.href} {...item} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
}) {
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.62rem] font-semibold transition-colors active:scale-95",
        active ? "text-brand-700" : "text-muted",
      )}
    >
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg transition-colors",
          active && "bg-brand-50",
        )}
      >
        <Icon className={cn("size-[1.15rem]", active && "stroke-[2.5]")} />
      </span>
      {label}
    </Link>
  );
}
