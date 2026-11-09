import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-block" aria-label="Ticketaar home">
          <Logo size="md" showSlogan />
        </Link>
        <p className="mt-8 text-6xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-2 text-2xl font-extrabold text-ink">This page missed the gate</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The page you were looking for has moved, sold out or never existed. The good news: there
          is always something on tonight.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/events"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl brand-gradient-pink px-5 text-sm font-semibold text-white shadow-brand"
          >
            <Compass className="size-4" />
            Explore events
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 text-sm font-semibold text-ink hover:bg-brand-50"
          >
            <Home className="size-4" />
            Back home
          </Link>
        </div>
        <Link
          href="/tickets/retrieve"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
        >
          <Search className="size-4" />
          Retrieve your tickets
        </Link>
      </div>
    </div>
  );
}
