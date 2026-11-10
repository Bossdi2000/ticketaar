"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, Ticket, LogIn, Zap } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LinkButton } from "@/components/ui/button";
import { cn, initials } from "@/lib/utils";
import { useCart, cartCount, useDb } from "@/lib/store";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Explore Events" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cart = useCart();
  const db = useDb();
  const count = cartCount(cart);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-40">
      {/* -------------------------- mobile app bar -------------------------- */}
      <div className="app-bar lg:hidden">
        <div className="flex h-14 items-center gap-2 px-4">
          <Link href="/" aria-label="Ticketaar home" className="shrink-0">
            <Logo size="sm" />
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/events"
              aria-label="Search events"
              className="grid size-9 place-items-center rounded-full text-ink/60 active:bg-brand-50"
            >
              <Search className="size-[1.15rem]" />
            </Link>
            <Link
              href="/tickets"
              aria-label={count > 0 ? `My tickets, ${count} in cart` : "My tickets"}
              className="relative grid size-9 place-items-center rounded-full text-ink/60 active:bg-brand-50"
            >
              <Ticket className="size-[1.15rem]" />
              {count > 0 ? (
                <span className="absolute right-0.5 top-0.5 size-2 rounded-full bg-pink-500 ring-2 ring-white" />
              ) : null}
            </Link>
            <Link
              href="/tickets/retrieve"
              aria-label="Your account and tickets"
              className="ml-0.5 grid size-9 place-items-center rounded-full brand-gradient-pink text-[0.7rem] font-bold text-white shadow-[0_6px_16px_-6px_rgba(236,31,138,0.9)] active:scale-95"
            >
              {db.sellerSession ? initials(db.sellerSession.name) : "TX"}
            </Link>
          </div>
        </div>
      </div>

      {/* --------------------------- desktop bar --------------------------- */}
      <div
        className={cn(
          "hidden border-b border-line bg-white/95 backdrop-blur transition-shadow lg:block",
          scrolled && "shadow-glow",
        )}
      >
        <div className="container-page flex h-16 items-center gap-4">
          <Link href="/" aria-label="Ticketaar home" className="shrink-0">
            <Logo />
          </Link>

          <nav className="ml-4 flex items-center gap-1" aria-label="Main">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-brand-50 text-brand-700" : "text-ink/70 hover:bg-brand-50",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/seller/register"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-brand-50"
            >
              Become an Event Creator
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center">
              {searchOpen ? (
                <form action="/events" className="flex items-center">
                  <label htmlFor="header-search" className="sr-only">
                    Search events
                  </label>
                  <input
                    ref={inputRef}
                    id="header-search"
                    name="q"
                    placeholder="Search events, cities, venues"
                    onBlur={() => setSearchOpen(false)}
                    className="h-10 w-64 rounded-xl border border-line bg-canvas px-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-600/10"
                  />
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="grid size-10 place-items-center rounded-xl text-ink/60 transition-colors hover:bg-brand-50 hover:text-brand-700"
                  aria-label="Search events"
                >
                  <Search className="size-5" />
                </button>
              )}
            </div>

            <Link
              href="/tickets/retrieve"
              className="relative grid size-10 place-items-center rounded-xl text-ink/60 transition-colors hover:bg-brand-50 hover:text-brand-700"
              aria-label={count > 0 ? `My tickets, ${count} in cart` : "My tickets"}
            >
              <Ticket className="size-5" />
              {count > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-pink-500 text-[0.65rem] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </Link>

            <Link
              href="/seller/login"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-ink/70 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <LogIn className="size-4" />
              Log in
            </Link>

            <LinkButton href="/events" size="md">
              <Zap className="size-4" />
              Get Tickets
            </LinkButton>
          </div>
        </div>
      </div>
    </header>
  );
}
