import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Compass,
  MapPin,
  Music,
  Mic as MicIcon,
  Laugh as SmileIcon,
  Trophy as TrophyIcon,
  Briefcase as BriefcaseIcon,
  GraduationCap as CapIcon,
  Presentation as PresentationIcon,
  Church as ChurchIcon,
  PartyPopper as PartyIcon,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { EVENTS, CATEGORIES } from "@/lib/seed/events";
import { EventCard } from "@/components/events/event-card";
import { SectionHeading } from "@/components/layout/page";
import { LinkButton } from "@/components/ui/button";
import { HeroStagger, HeroItem, Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Footer } from "@/components/layout/footer";

const CITIES = ["Lagos", "Abuja", "Ibadan", "Port Harcourt", "Lekki", "Ikeja"];

export default function HomePage() {
  const upcoming = EVENTS.filter((event) => event.status === "published");

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative isolate overflow-hidden">
        <div className="hero-gradient absolute inset-0" />
        <Image
          src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1800&q=70"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-brand-950/45" aria-hidden="true" />
        <div
          className="absolute -left-24 top-1/4 size-72 rounded-full bg-pink-500/25 blur-3xl"
          aria-hidden="true"
        />

        <div className="container-page relative py-14 sm:py-20 lg:py-24">
          <HeroStagger>
            <div className="mx-auto max-w-2xl text-center">
              <HeroItem>
                <h1 className="text-[2.6rem] font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                  Discover Amazing Events
                </h1>
              </HeroItem>

              <HeroItem>
                <p className="mx-auto mt-4 max-w-lg text-base font-medium text-brand-100 sm:text-lg">
                  One Ticket, All Access! Find the concerts and nights out worth leaving the house
                  for.
                </p>
              </HeroItem>

              <HeroItem>
                <form action="/events" className="mx-auto mt-7 max-w-xl">
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
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
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
            </div>
          </HeroStagger>
        </div>
      </section>

      {/* --------------------- Mobile quick categories ---------------------- */}
      <section className="border-b border-line bg-white lg:hidden" aria-label="Categories">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
          {[
            { href: "/events?category=Concerts", label: "Concerts", icon: Music },
            { href: "/events?category=Conferences", label: "Summits", icon: PresentationIcon },
            { href: "/events?category=Comedy", label: "Comedy", icon: SmileIcon },
            { href: "/events?category=Sports", label: "Sports", icon: TrophyIcon },
            { href: "/events", label: "All", icon: Sparkles },
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
      <section className="border-b border-line bg-white" aria-label="Trusted by">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">
            Trusted by organisers at
          </p>
          {["Eko Convention Centre", "Landmark Events", "Muson Centre"].map((name) => (
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

      {/* ---------------------------- Upcoming ------------------------------ */}
      <section className="container-page py-10 sm:py-14">
        <SectionHeading
          title="Upcoming events"
          description="The events on sale right now."
          href="/events"
        />
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((event) => (
            <StaggerItem key={event.id}>
              <EventCard event={event} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ---------------------------- Categories ---------------------------- */}
      <section className="container-page pb-10 sm:pb-14">
        <SectionHeading title="Browse by category" href="/events" linkLabel="All categories" />
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

      {/* ------------------------------ Final CTA --------------------------- */}
      <section className="container-page pb-4">
        <Reveal>
          <div className="brand-gradient-pink relative overflow-hidden rounded-3xl px-6 py-10 text-center shadow-glow-strong sm:px-10 sm:py-12">
            <div className="grid-texture absolute inset-0 opacity-20" aria-hidden="true" />
            <div className="relative">
              <Star className="mx-auto size-7 text-white/90" />
              <h2 className="mt-3 text-xl font-extrabold text-white sm:text-2xl">
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
