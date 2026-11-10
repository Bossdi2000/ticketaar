import { cn } from "@/lib/utils";

/**
 * Ticket outline with a dotted perforation, matching the brand mark.
 * Drawn with strokes so it stays crisp at any size and inherits colour.
 */
export function TicketMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 58 38"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-12", className)}
    >
      <path
        d="M7.5 1H50.5C54.09 1 57 3.91 57 7.5V12.5C54.24 12.5 52 14.74 52 17.5C52 20.26 54.24 22.5 57 22.5V28.5C57 32.09 54.09 35 50.5 35H7.5C3.91 35 1 32.09 1 28.5V22.5C3.76 22.5 6 20.26 6 17.5C6 14.74 3.76 12.5 1 12.5V7.5C1 3.91 3.91 1 7.5 1Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 5V31"
        stroke="var(--mark-accent, #6500E8)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="0.1 5"
      />
    </svg>
  );
}

export function Logo({
  className,
  size = "md",
  showSlogan = false,
  inverted = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSlogan?: boolean;
  inverted?: boolean;
}) {
  const dims = {
    sm: { mark: "h-[1.15rem] w-[1.75rem]", text: "text-[1.28rem]" },
    md: { mark: "h-7 w-[2.65rem]", text: "text-[1.85rem]" },
    lg: { mark: "h-9 w-[3.4rem]", text: "text-[2.6rem]" },
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        inverted ? "text-white [--mark-accent:#C9A6FF]" : "text-ink",
        className,
      )}
    >
      <TicketMark className={cn(dims.mark, "shrink-0")} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-extrabold tracking-[-0.03em]",
            dims.text,
            inverted ? "text-white" : "text-ink",
          )}
        >
          Ticketaar
          <sup
            className={cn(
              "ml-0.5 align-super text-[0.3em] font-bold tracking-normal",
              inverted ? "text-brand-300" : "text-ink",
            )}
          >
            ™
          </sup>
        </span>
        {showSlogan ? (
          <span
            className={cn(
              "mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em]",
              inverted ? "text-brand-200" : "text-brand-700",
            )}
          >
            One Ticket, All Access!
          </span>
        ) : null}
      </span>
    </span>
  );
}
