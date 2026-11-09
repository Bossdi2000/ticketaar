"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket as TicketIcon, Search, ArrowLeftRight } from "lucide-react";
import { useDb } from "@/lib/store";
import { TicketStub } from "@/components/tickets/ticket-stub";
import { EmptyState } from "@/components/layout/page";
import { LinkButton } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export function TicketList() {
  const db = useDb();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container-page py-12">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-brand-100" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl bg-brand-100/60" />
          ))}
        </div>
      </div>
    );
  }

  const valid = db.tickets.filter((ticket) => ticket.status === "valid");
  const past = db.tickets.filter((ticket) => ticket.status !== "valid");

  return (
    <div className="container-page py-5 sm:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-wider text-pink-600 lg:hidden">
            Wallet
          </p>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">My tickets</h1>
          <p className="mt-1 text-sm text-muted">
            {db.tickets.length > 0
              ? `${valid.length} valid · ${past.length} used, transferred or refunded`
              : "Tickets you buy on this device appear here."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LinkButton href="/transfers" variant="outline">
            <ArrowLeftRight className="size-4" />
            Transfers
          </LinkButton>
          <LinkButton href="/tickets/retrieve" variant="outline">
            <Search className="size-4" />
            Retrieve by email
          </LinkButton>
        </div>
      </div>

      {db.tickets.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<TicketIcon className="size-6" />}
            title="No tickets yet"
            description="Find an event, check out as a guest, and your digital ticket will land here and in your inbox instantly."
            action={<LinkButton href="/events">Browse events</LinkButton>}
          />
        </div>
      ) : (
        <div className="mt-5 space-y-8 sm:mt-8 sm:space-y-10">
          {valid.length > 0 ? (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-ink sm:text-lg">Valid for entry</h2>
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-success">
                  {valid.length} ready
                </span>
              </div>
              <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {valid.map((ticket) => (
                  <StaggerItem key={ticket.id}>
                    <Link href={`/tickets/${ticket.id}`} className="block active:scale-[0.99]">
                      <TicketStub ticket={ticket} compact />
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          ) : null}

          {past.length > 0 ? (
            <section>
              <h2 className="mb-3 text-base font-bold text-ink sm:text-lg">Past and inactive</h2>
              <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((ticket) => (
                  <StaggerItem key={ticket.id}>
                    <Link href={`/tickets/${ticket.id}`} className="block active:scale-[0.99]">
                      <TicketStub ticket={ticket} compact />
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
