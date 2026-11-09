import Link from "next/link";
import { Instagram, Twitter, Music2, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CurrentYear } from "@/components/layout/current-year";

const columns = [
  {
    title: "Discover",
    links: [
      { href: "/events", label: "Explore Events" },
      { href: "/events?category=Concerts", label: "Concerts" },
      { href: "/events?category=Conferences", label: "Conferences" },
      { href: "/events?category=Festivals", label: "Festivals" },
      { href: "/events?price=free", label: "Free Events" },
    ],
  },
  {
    title: "Tickets",
    links: [
      { href: "/tickets/retrieve", label: "Retrieve Tickets" },
      { href: "/transfers", label: "Transfer Tickets" },
      { href: "/refund-request", label: "Request a Refund" },
      { href: "/checkout", label: "Checkout" },
    ],
  },
  {
    title: "Organisers",
    links: [
      { href: "/seller/register", label: "Create an Event" },
      { href: "/seller/login", label: "Seller Login" },
      { href: "/seller/analytics", label: "Sales Analytics" },
      { href: "/seller/payouts", label: "Payouts" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-white">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo showSlogan />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Ticketaar helps organisers sell out faster and helps people find the nights worth
              leaving the house for.
            </p>
            <div className="mt-5 space-y-2 text-sm text-muted">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-brand-600" />
                Asokoro, Abuja, Nigeria
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-brand-600" />
                <a href="mailto:info.ticketaar@gmail.com" className="hover:text-brand-700">
                  info.ticketaar@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-brand-600" />
                <a href="tel:07010301024" className="hover:text-brand-700">
                  07010301024
                </a>
              </p>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold text-ink">{column.title}</h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-brand-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted">
            © <CurrentYear /> Ticketaar. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {[
              { icon: Twitter, label: "X (Twitter)" },
              { icon: Instagram, label: "Instagram" },
              { icon: Music2, label: "TikTok" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="https://ticketaar.ng"
                aria-label={label}
                className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
