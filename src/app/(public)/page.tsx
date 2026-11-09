import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CreditCard,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  MapPin,
  TrendingUp,
  Compass,
  Star,
  Music,
  Mic as MicIcon,
  Laugh as SmileIcon,
  Trophy as TrophyIcon,
  Briefcase as BriefcaseIcon,
  GraduationCap as CapIcon,
  Presentation as PresentationIcon,
  Church as ChurchIcon,
  PartyPopper as PartyIcon,
  Users,
  Store,
  Wallet,
  Check,
  Play,
  Quote,
  ArrowUpRight,
  Flame,
  Gift,
  Headphones,
} from "lucide-react";
import { EVENTS, CATEGORIES, TICKER_ITEMS } from "@/lib/seed/events";
import { EventCard } from "@/components/events/event-card";
import { SectionHeading } from "@/components/layout/page";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";
import { HeroStagger, HeroItem, Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { CountUp, FloatIn, ParallaxImage } from "@/components/motion/advanced";
import { Footer } from "@/components/layout/footer";

const CITIES = ["Lagos", "Abuja", "Ibadan", "Port Harcourt", "Lekki", "Ikeja"];

const CITY_IMAGES: Record<string, string> = {
  Lagos: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=70",
  Lekki: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=70",
  Ikeja: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=70",
  Ibadan: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=70",
  Abuja: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=70",
};

export default function HomePage() {
  const cityCounts = new Map<string, number>();
  EVENTS.filter((event) => event.status === "published").forEach((event) => {
    cityCounts.set(event.city, (cityCounts.get(event.city) ?? 0) + 1);
  });
  const cities = [...cityCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([city, count], index) => ({
      city,
      count,
      image:
        CITY_IMAGES[city] ??
        Object.values(CITY_IMAGES)[index % Object.values(CITY_IMAGES).length],
    }));

  const featured = EVENTS.filter((event) => event.featured).slice(0, 3);
  const trending = EVENTS.filter((event) => event.trending).slice(0, 3);
  const upcoming = [...EVENTS]
    .filter((event) => event.status === "published")
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))
    .slice(0, 3);
  const recent = [...EVENTS]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4);
  const freeEvents = EVENTS.filter((event) =>
    event.ticketTypes.some((type) => type.price === 0),
  ).slice(0, 3);
  const hero = EVENTS[0];

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative isolate overflow-hidden">
        <div className="hero-gradient absolute inset-0" />
        <Image
          src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1800&q=70"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-brand-950/40" aria-hidden="true" />
        <div
          className="absolute -left-24 top-1/4 size-72 rounded-full bg-pink-500/25 blur-3xl"
          aria-hidden="true"
        />

        <div className="container-page relative py-12 sm:py-20 lg:py-28">
          <HeroStagger>
            <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
              <HeroItem>
                <h1 className="text-[2.6rem] font-extrabold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
                  Discover Amazing
                  <span className="block bg-gradient-to-r from-pink-300 via-white to-brand-200 bg-clip-text text-transparent">
                    Events
                  </span>
                </h1>
              </HeroItem>

              <HeroItem>
                <p className="mx-auto mt-4 max-w-xl text-base font-medium text-brand-100 sm:text-xl lg:mx-0">
                  One Ticket, All Access! Find the concerts, conferences and nights out worth
                  leaving the house for.
                </p>
              </HeroItem>

              <HeroItem>
                <form action="/events" className="mx-auto mt-6 max-w-2xl lg:mx-0">
                  <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-[0_18px_44px_-18px_rgba(236,31,138,0.5)] sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:px-3">
                      <Search className="size-5 shrink-0 text-muted" aria-hidden="true" />
                      <label htmlFor="hero-search" className="sr-only">
                        Search events, venues or cities
                      </label>
                      <input
                        id="hero-search"
                        name="q"
                        placeholder="Search events, venues or cities"
                        className="h-11 w-full min-w-0 bg-transparent text-base text-ink placeholder:text-muted/70 focus:outline-none"
                      />
                    </div>
                    <div className="hidden h-8 w-px bg-line sm:block" aria-hidden="true" />
                    <div className="flex items-center gap-2 border-t border-line px-2 pt-2 sm:border-0 sm:px-3 sm:pt-0">
                      <MapPin className="size-5 shrink-0 text-muted" aria-hidden="true" />
                      <label htmlFor="hero-city" className="sr-only">
                        City
                      </label>
                      <select
                        id="hero-city"
                        name="city"
                        defaultValue=""
                        className="h-11 w-full min-w-0 bg-transparent text-sm font-medium text-ink focus:outline-none sm:min-w-[7rem]"
                      >
                        <option value="">All cities</option>
                        {CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="h-12 shrink-0 rounded-xl brand-gradient-pink px-6 font-semibold text-white shadow-brand transition-transform active:scale-[0.98]"
                    >
                      Find events
                    </button>
                  </div>
                </form>
              </HeroItem>

              <HeroItem>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
                  <LinkButton href="/events" variant="white" size="lg">
                    <Compass className="size-4" />
                    Explore Events
                  </LinkButton>
                  <LinkButton
                    href="/seller/register"
                    size="lg"
                    className="border border-white/25 bg-white/10 text-white shadow-none backdrop-blur hover:bg-white/20"
                  >
                    Become an Event Creator
                    <ArrowRight className="size-4" />
                  </LinkButton>
                </div>
              </HeroItem>

              <HeroItem>
                <dl className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-3 border-t border-white/15 pt-5 lg:mx-0">
                  {[
                    { label: "Tickets sold", value: 128000, suffix: "+" },
                    { label: "Organisers", value: 480, suffix: "" },
                    { label: "Cities", value: 12, suffix: "" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-brand-200 sm:text-xs">
                        {stat.label}
                      </dt>
                      <dd className="mt-1 text-xl font-extrabold text-white tabular sm:text-2xl">
                        <CountUp value={stat.value} suffix={stat.suffix} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </HeroItem>
            </div>
          </HeroStagger>

          <aside className="absolute bottom-10 right-8 hidden w-72 xl:block">
            <div className="animate-float rounded-2xl border border-pink-300/30 bg-white/10 p-3 backdrop-blur-md">
              <p className="px-1 pb-2 text-[0.68rem] font-bold uppercase tracking-wider text-pink-200">
                Trending now
              </p>
              <div className="rounded-xl bg-white p-3 shadow-glow">
                <p className="text-xs font-semibold text-brand-700">{hero.category}</p>
                <p className="mt-1 text-sm font-bold leading-snug text-ink">{hero.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {hero.venue}, {hero.city}
                </p>
                <p className="mt-2 text-sm font-extrabold text-brand-700">
                  From {formatMoney(15000, { compact: true })}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* --------------------- Mobile app-style quick rail ------------------- */}
      <section className="border-b border-line bg-white lg:hidden" aria-label="Quick actions">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
          {[
            { href: "/events?category=Concerts", label: "Concerts", icon: Music },
            { href: "/events?category=Conferences", label: "Summits", icon: PresentationIcon },
            { href: "/events?category=Comedy", label: "Comedy", icon: SmileIcon },
            { href: "/events?category=Sports", label: "Sports", icon: TrophyIcon },
            { href: "/events?price=free", label: "Free", icon: Gift },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-pink-500/15 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 active:scale-95"
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* --------------------------- Trust ribbon --------------------------- */}
      <section className="border-y border-line bg-white" aria-label="Trusted by">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-4 sm:py-5">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">
            Trusted by organisers at
          </p>
          {[
            "Eko Convention Centre",
            "Landmark Events",
            "Muson Centre",
            "Terra Kulture",
            "Co-Creation Hub",
          ].map((name) => (
            <span
              key={name}
              className="flex items-center gap-1.5 text-xs font-semibold text-ink/60 sm:text-sm"
            >
              <BadgeCheck className="size-4 text-pink-500" />
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* -------------------- Mobile: trending near you --------------------- */}
      <section className="lg:hidden">
        <div className="flex items-end justify-between px-4 pt-6">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-pink-600">
              <Flame className="mr-1 inline size-3" />
              Hot near you
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-ink">Trending events</h2>
          </div>
          <Link href="/events?sort=popular" className="text-xs font-semibold text-brand-700">
            See all
          </Link>
        </div>
        <div className="rail px-4 pt-3">
          {trending.map((event) => (
            <EventCard key={event.id} event={event} variant="tile" />
          ))}
        </div>
      </section>

      {/* ---------------------------- Categories ---------------------------- */}
      <section className="container-page py-10 sm:py-16">
        <SectionHeading
          title="Browse by category"
          description="Whatever the night calls for, there is a room for it."
          href="/events"
          linkLabel="All categories"
        />
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.slice(0, 12).map((category) => (
            <StaggerItem key={category.name}>
              <Link
                href={`/events?category=${encodeURIComponent(category.name)}`}
                className="group flex h-full flex-col justify-between gap-6 rounded-xl border border-pink-500/10 bg-white p-4 shadow-glow transition-all hover:-translate-y-1 hover:shadow-glow-hover"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <CategoryIcon name={category.name} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{category.name}</span>
                  <span className="mt-0.5 block text-xs text-muted">{category.blurb}</span>
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ---------------------------- Featured ------------------------------ */}
      <section className="container-page py-4 sm:py-8">
        <SectionHeading
          title="Featured events"
          description="Hand-picked by the Ticketaar team this week."
          href="/events?sort=popular"
        />
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((event) => (
            <StaggerItem key={event.id}>
              <EventCard event={event} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ----------------------------- Promo -------------------------------- */}
      <section className="container-page py-8 sm:py-14">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-950 px-5 py-9 shadow-glow-strong sm:px-12 sm:py-14">
            <div className="grid-texture absolute inset-0 opacity-[0.18]" aria-hidden="true" />
            <div
              className="absolute -right-16 -top-16 size-64 rounded-full bg-pink-500/25 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <Badge tone="brand" className="border-white/20 bg-white/10 text-brand-100">
                  <TrendingUp className="size-3" />
                  Why Ticketaar
                </Badge>
                <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-4xl">
                  Sell out the room, not your evening
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-100 sm:text-base">
                  Publish an event in under ten minutes, watch sales land in real time, and check
                  guests in with a camera. No account needed for buyers, no spreadsheets for you.
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: CreditCard, title: "Instant payment", body: "Paystack-secured checkout" },
                    { icon: QrCode, title: "QR check-in", body: "One scan per ticket" },
                    { icon: ShieldCheck, title: "Verified sellers", body: "Every organiser reviewed" },
                  ].map(({ icon: Icon, title, body }) => (
                    <li
                      key={title}
                      className="rounded-xl border border-pink-300/20 bg-white/5 p-3"
                    >
                      <Icon className="size-5 text-pink-300" />
                      <p className="mt-2 text-sm font-bold text-white">{title}</p>
                      <p className="mt-0.5 text-xs text-brand-100/80">{body}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex flex-wrap gap-3">
                  <LinkButton href="/seller/register" variant="white">
                    Start selling
                    <ArrowRight className="size-4" />
                  </LinkButton>
                  <LinkButton
                    href="/seller/login"
                    className="border border-white/25 bg-transparent text-white shadow-none hover:bg-white/10"
                  >
                    Organiser log in
                  </LinkButton>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-2xl bg-white p-4 shadow-glow-strong">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink">Sales this week</p>
                    <Badge tone="success">+18.4%</Badge>
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-ink tabular">
                    <CountUp value={2450000} prefix="₦" />
                  </p>
                  <p className="text-xs text-muted">Across 3 published events</p>
                  <div className="mt-4 flex h-24 items-end gap-1.5" aria-hidden="true">
                    {[38, 52, 44, 61, 55, 78, 94].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t bg-gradient-to-t from-brand-200 via-brand-400 to-pink-500"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
                    <span>Mon</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ----------------------- Three ways to use it ---------------------- */}
      <section className="container-page py-10 sm:py-14">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-600">
              One platform, three doors
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
              Built for buyers, organisers and the platform team
            </h2>
          </div>
        </Reveal>
        <Stagger className="mt-7 grid gap-4 lg:grid-cols-3">
          {[
            {
              icon: Ticket,
              role: "Buyer",
              tone: "from-pink-500/15 to-brand-500/10",
              title: "Discover · Book · Enjoy",
              points: [
                "Discover events near you",
                "Search by city or venue",
                "Guest checkout, no account",
                "Digital QR tickets",
                "Transfers and refunds",
              ],
              href: "/events",
              cta: "Browse events",
            },
            {
              icon: Store,
              role: "Seller",
              tone: "from-brand-500/15 to-brand-700/10",
              title: "Create · Manage · Earn",
              points: [
                "Six-step event builder",
                "Live sales dashboard",
                "Attendee management",
                "QR verification",
                "Payouts to your bank",
              ],
              href: "/seller/register",
              cta: "Start selling",
            },
            {
              icon: ShieldCheck,
              role: "Admin",
              tone: "from-brand-700/20 to-ink/10",
              title: "Control · Monitor · Grow",
              points: [
                "Platform overview",
                "User management",
                "Event verification",
                "Transfers and commissions",
                "Refunds and analytics",
              ],
              href: "/admin/login",
              cta: "Admin console",
            },
          ].map((card) => (
            <StaggerItem key={card.role}>
              <div className="flex h-full flex-col rounded-2xl border border-pink-500/10 bg-white p-5 shadow-glow transition-all hover:-translate-y-1 hover:shadow-glow-hover">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${card.tone} text-brand-700`}
                  >
                    <card.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-pink-600">
                      {card.role}
                    </p>
                    <p className="text-sm font-bold text-ink">{card.title}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {card.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-muted">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  href={card.href}
                  className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-brand-700 hover:underline"
                >
                  {card.cta}
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ---------------------------- Trending ------------------------------ */}
      <section className="container-page py-4 sm:py-8">
        <SectionHeading
          title="Trending now"
          description="Selling fastest in the last 48 hours."
          href="/events?sort=popular"
        />
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((event) => (
            <StaggerItem key={event.id}>
              <EventCard event={event} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ------------------------- City showcase --------------------------- */}
      <section className="bg-brand-50/60 py-10 sm:py-14">
        <div className="container-page">
          <SectionHeading
            title="Happening in your city"
            description="Pick a city and see what is on this month."
          />
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cities.map(({ city, count, image }) => (
              <StaggerItem key={city}>
                <Link
                  href={`/events?city=${encodeURIComponent(city)}`}
                  className="group relative block overflow-hidden rounded-2xl shadow-glow transition-transform hover:-translate-y-1"
                >
                  <ParallaxImage
                    src={image}
                    className="aspect-[4/5] w-full"
                    strength={26}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-pink-200">
                      <MapPin className="mr-1 inline size-3" />
                      {count} event{count === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-white">{city}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------------------------- Upcoming ------------------------------ */}
      <section className="container-page py-10 sm:py-14">
        <SectionHeading
          title="Upcoming events"
          description="The next dates on the calendar."
          href="/events?sort=upcoming"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((event, index) => (
            <Reveal key={event.id} delay={index * 0.07}>
              <EventCard event={event} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------- Free events --------------------------- */}
      <section className="container-page pb-10">
        <Reveal>
          <div className="rounded-3xl border border-pink-500/15 bg-gradient-to-br from-pink-500/5 via-white to-brand-50 p-5 shadow-glow sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-pink-600">
                  <Gift className="size-3.5" />
                  Zero naira
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-ink sm:text-2xl">
                  Free events worth your evening
                </h2>
              </div>
              <Link
                href="/events?price=free"
                className="text-sm font-semibold text-brand-700 hover:underline"
              >
                See all free events
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {freeEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------- Recently added ------------------------ */}
      <section className="container-page py-6 sm:py-10">
        <SectionHeading title="Recently added" description="Fresh listings from verified organisers." />
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((event) => (
            <StaggerItem key={event.id}>
              <EventCard event={event} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* --------------------------- Testimonials -------------------------- */}
      <section className="container-page py-10 sm:py-14">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-600">Loved on the ground</p>
            <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
              Organisers and guests, in their words
            </h2>
          </div>
        </Reveal>
        <Stagger className="mt-7 grid gap-4 lg:grid-cols-3">
          {[
            {
              quote:
                "We sold 612 tickets in four days. The dashboard told us exactly which category to push next.",
              name: "Tola Adeyemi",
              role: "Pulse Live Africa",
              image:
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=70",
            },
            {
              quote:
                "Check-in took eleven minutes for a full house. No duplicate scans, no arguments at the gate.",
              name: "Lanre Balogun",
              role: "Lagos Nights Collective",
              image:
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=70",
            },
            {
              quote:
                "I bought tickets for three friends without making an account. The QR codes landed instantly.",
              name: "Adaeze Okafor",
              role: "Guests, V.I.",
              image:
                "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=70",
            },
          ].map((item) => (
            <StaggerItem key={item.name}>
              <figure className="flex h-full flex-col rounded-2xl border border-pink-500/10 bg-white p-5 shadow-glow">
                <Quote className="size-6 text-pink-400" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink/80">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-3">
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-brand-100">
                    <Image src={item.image} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-ink">{item.name}</span>
                    <span className="block text-xs text-muted">{item.role}</span>
                  </span>
                  <span className="ml-auto flex gap-0.5" aria-label="5 out of 5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="size-3 fill-warning text-warning" />
                    ))}
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ---------------------------- How it works -------------------------- */}
      <section className="container-page pb-12">
        <Reveal>
          <div className="rounded-3xl border border-pink-500/10 bg-white p-6 shadow-glow sm:p-10">
            <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
              Three steps, no account required
            </h2>
            <ol className="mt-6 grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: Search,
                  title: "Find your event",
                  body: "Search by name, city or venue and filter down to the events that fit your night.",
                },
                {
                  icon: CreditCard,
                  title: "Pay in seconds",
                  body: "Guest checkout with card, transfer or USSD. No sign-up, no password to forget.",
                },
                {
                  icon: Ticket,
                  title: "Show your ticket",
                  body: "Your QR ticket arrives instantly by email. Download, transfer or share it.",
                },
              ].map(({ icon: Icon, title, body }, index) => (
                <li key={title}>
                  <span className="grid size-10 place-items-center rounded-xl brand-gradient-pink text-white shadow-brand">
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-pink-600">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </section>

      {/* ------------------------- Organiser CTA ---------------------------- */}
      <section className="container-page pb-12">
        <Reveal>
          <div className="grid overflow-hidden rounded-3xl border border-pink-500/10 bg-white shadow-glow lg:grid-cols-2">
            <div className="relative min-h-56 overflow-hidden lg:min-h-full">
              <Image
                src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=70"
                alt="Crowd at a live music event"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent lg:bg-gradient-to-r" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-brand-800 backdrop-blur">
                <Play className="size-3.5 fill-brand-700 text-brand-700" />
                1,240 events hosted
              </div>
            </div>
            <div className="p-6 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-600">
                For organisers
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                Your next event deserves a full house
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Set up ticket categories, publish in minutes and get paid to your bank. We handle
                payments, QR delivery and check-in so you can focus on the room.
              </p>
              <ul className="mt-5 space-y-2.5">
                {[
                  { icon: Wallet, text: "Payouts to any Nigerian bank account" },
                  { icon: QrCode, text: "Duplicate-proof QR check-in at the gate" },
                  { icon: Users, text: "Attendee list and check-in log, exportable" },
                  { icon: Headphones, text: "Real support on event day" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2 text-sm text-ink">
                    <Icon className="mt-0.5 size-4 shrink-0 text-brand-600" />
                    {text}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <LinkButton href="/seller/register">
                  Create an event
                  <ArrowRight className="size-4" />
                </LinkButton>
                <LinkButton href="/contact" variant="outline">
                  Talk to the team
                </LinkButton>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------ Final CTA --------------------------- */}
      <section className="container-page pb-4">
        <Reveal>
          <div className="brand-gradient-pink relative overflow-hidden rounded-3xl px-6 py-12 text-center shadow-glow-strong sm:px-12">
            <div className="grid-texture absolute inset-0 opacity-20" aria-hidden="true" />
            <div className="relative">
              <Star className="mx-auto size-8 text-white/90" />
              <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                Ready for your next night out?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
                One ticket, all access. Browse what is happening near you tonight.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <LinkButton href="/events" variant="white" size="lg">
                  Explore events
                </LinkButton>
                <LinkButton
                  href="/tickets/retrieve"
                  size="lg"
                  className="border border-white/30 bg-transparent text-white shadow-none hover:bg-white/10"
                >
                  Retrieve my tickets
                </LinkButton>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </>
  );
}

function CategoryIcon({ name }: { name: string }) {
  const map: Record<string, typeof Music> = {
    Music: Music,
    Concerts: MicIcon,
    Comedy: SmileIcon,
    Sports: TrophyIcon,
    Business: BriefcaseIcon,
    Education: CapIcon,
    Conferences: PresentationIcon,
    Festivals: Sparkles,
    Religious: ChurchIcon,
    Parties: PartyIcon,
    Other: CalendarDays,
  };
  const Icon = map[name] ?? CalendarDays;
  return <Icon className="size-4" />;
}
