import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand logo. The ticket mark is the supplied artwork, used as-is
 * (public/logo-ticketaar.jpg) with no cropping or recolouring.
 */
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
    sm: { mark: "h-11", text: "text-[1.32rem]" },
    md: { mark: "h-14", text: "text-[1.9rem]" },
    lg: { mark: "h-16", text: "text-[2.7rem]" },
  }[size];

  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo-ticketaar.jpg"
        alt=""
        width={540}
        height={417}
        unoptimized
        priority
        className={cn(
          "-mr-1 w-auto shrink-0 object-contain",
          dims.mark,
          inverted && "mr-0 rounded-xl bg-white p-1",
        )}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-extrabold tracking-[-0.03em]",
            dims.text,
            inverted ? "text-white" : "text-ink",
          )}
        >
          Ticketaar
          <sup className="ml-0.5 align-super text-[0.3em] font-bold tracking-normal text-brand-600">
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
