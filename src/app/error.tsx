"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-600">
          Something went wrong
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-ink">We hit a snag loading that</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The action did not complete. Nothing was charged. Try again, or head back to the event
          listings.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-xl brand-gradient-pink px-5 text-sm font-semibold text-white shadow-brand"
          >
            Try again
          </button>
          <Link
            href="/events"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-white px-5 text-sm font-semibold text-ink hover:bg-brand-50"
          >
            Browse events
          </Link>
        </div>
      </div>
    </div>
  );
}
