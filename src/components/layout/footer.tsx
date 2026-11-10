import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CurrentYear } from "@/components/layout/current-year";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="container-page py-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div>
            <Logo showSlogan />
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Footer">
            <Link href="/events" className="text-sm text-muted hover:text-brand-700">
              Events
            </Link>
            <Link href="/about" className="text-sm text-muted hover:text-brand-700">
              About
            </Link>
            <Link href="/contact" className="text-sm text-muted hover:text-brand-700">
              Contact
            </Link>
            <Link href="/terms" className="text-sm text-muted hover:text-brand-700">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted hover:text-brand-700">
              Privacy
            </Link>
          </nav>

          <address className="not-italic text-sm leading-relaxed text-muted">
            <p>Asokoro, Abuja, Nigeria</p>
            <a href="mailto:info.ticketaar@gmail.com" className="hover:text-brand-700">
              info.ticketaar@gmail.com
            </a>
            <br />
            <a href="tel:07010301024" className="hover:text-brand-700">
              07010301024
            </a>
          </address>
        </div>

        <p className="mt-6 border-t border-line pt-4 text-center text-xs text-muted">
          © <CurrentYear /> Ticketaar. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
