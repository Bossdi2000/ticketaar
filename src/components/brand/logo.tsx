import { cn } from "@/lib/utils";

export function TicketMark({
  className,
  detail = "light",
}: {
  className?: string;
  detail?: "light" | "dark";
}) {
  const details = detail === "dark" ? "#1A0044" : "#FFFFFF";
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-12", className)}
    >
      <rect x="1" y="1" width="46" height="30" rx="7" fill="currentColor" />
      <path d="M24 3v26" stroke={details} strokeWidth="2" strokeDasharray="2 3" opacity="0.9" />
      <circle cx="10.5" cy="16" r="3" fill={details} />
      <path
        d="M35 10.5l1.7 3.6 3.6 1.7-3.6 1.7L35 21.1l-1.7-3.6-3.6-1.7 3.6-1.7L35 10.5Z"
        fill={details}
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
    sm: { mark: "h-6 w-9", text: "text-lg" },
    md: { mark: "h-8 w-12", text: "text-2xl" },
    lg: { mark: "h-11 w-16", text: "text-4xl" },
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <TicketMark
        className={cn(dims.mark, inverted ? "text-white" : "text-brand-600")}
        detail={inverted ? "dark" : "light"}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-extrabold tracking-tight",
            dims.text,
            inverted ? "text-white" : "text-ink",
          )}
        >
          Ticket
          <span className={inverted ? "text-pink-300" : "text-brand-600"}>aar</span>
          <sup
            className={cn(
              "ml-0.5 align-super text-[0.4em] font-bold",
              inverted ? "text-brand-300" : "text-muted",
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
