import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeft, BadgeCheck, TrendingUp, QrCode, Wallet, Play } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CountUp } from "@/components/motion/advanced";

const COLLAGE = [
  {
    src: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=700&q=70",
    alt: "Concert crowd under stage lights",
    className: "col-span-2 aspect-[16/9]",
  },
  {
    src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=70",
    alt: "Live band performing",
    className: "aspect-square",
  },
  {
    src: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=500&q=70",
    alt: "Guests at an evening event",
    className: "aspect-square",
  },
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-950 p-8 lg:flex lg:flex-col xl:p-10">
        <div className="grid-texture absolute inset-0 opacity-20" aria-hidden="true" />
        <div
          className="absolute -right-24 top-1/3 size-80 rounded-full bg-pink-500/30 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <Link href="/" aria-label="Ticketaar home">
            <Logo inverted size="md" showSlogan />
          </Link>
        </div>

        <div className="relative mt-8">
          <div className="grid grid-cols-2 gap-3">
            {COLLAGE.map((image, index) => (
              <div
                key={image.src}
                className={`relative overflow-hidden rounded-2xl ring-1 ring-white/15 ${
                  index === 0 ? "shadow-[0_18px_44px_-18px_rgba(236,31,138,0.7)]" : ""
                } ${image.className}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1280px) 40vw, 320px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 to-transparent" />
                {index === 0 ? (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-bold text-brand-800 backdrop-blur">
                    <Play className="size-3 fill-brand-700 text-brand-700" />
                    Sold out in 4 days
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-8 max-w-md">
          <h2 className="text-2xl font-extrabold leading-tight text-white xl:text-3xl">
            Sell out the room, not your evening.
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-brand-100">
            Publish in minutes, watch sales land in real time, and check guests in with a camera.
          </p>

          <ul className="mt-6 space-y-3">
            {[
              { icon: TrendingUp, title: "Live sales dashboard", body: "Revenue, tickets and trends by event." },
              { icon: QrCode, title: "QR check-in", body: "One scan per ticket, duplicate-proof." },
              { icon: Wallet, title: "Fast payouts", body: "Request a payout as soon as funds clear." },
              { icon: BadgeCheck, title: "Verified badge", body: "Build trust with a verified organiser profile." },
            ].map(({ icon: Icon, title: text, body }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-pink-200">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{text}</p>
                  <p className="text-xs text-brand-200">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <dl className="relative mt-8 grid grid-cols-3 gap-3 border-t border-white/15 pt-5">
          {[
            { label: "Events hosted", value: 1240, suffix: "+" },
            { label: "Tickets issued", value: 128000, suffix: "+" },
            { label: "Organisers", value: 480, suffix: "" },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="text-[0.62rem] font-semibold uppercase tracking-wider text-brand-300">
                {stat.label}
              </dt>
              <dd className="mt-0.5 text-lg font-extrabold text-white tabular">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </aside>

      <main className="flex flex-col bg-canvas">
        <div className="app-bar flex items-center justify-between px-4 py-3 lg:hidden">
          <Link href="/" aria-label="Ticketaar home">
            <Logo size="sm" />
          </Link>
          <Link href="/" className="text-xs font-semibold text-brand-700">
            Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-5 hidden items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand-700 lg:inline-flex"
            >
              <ArrowLeft className="size-3.5" />
              Back to Ticketaar
            </Link>
            {eyebrow ? (
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-600">{eyebrow}</p>
            ) : null}
            <h1 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p> : null}
            <div className="mt-6">{children}</div>
            {footer ? <div className="mt-5 text-sm text-muted">{footer}</div> : null}
          </div>
        </div>
      </main>
    </div>
  );
}
