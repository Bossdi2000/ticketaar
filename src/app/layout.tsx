import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Ticketaar — One Ticket, All Access!",
    template: "%s · Ticketaar",
  },
  description:
    "Discover concerts, conferences, comedy nights and festivals across Nigeria. Buy tickets in seconds, no account needed, and get a scannable digital ticket instantly.",
  metadataBase: new URL("https://ticketaar.ng"),
  openGraph: {
    title: "Ticketaar — One Ticket, All Access!",
    description:
      "Discover amazing events across Nigeria. Buy tickets in seconds and get a scannable digital ticket instantly.",
    type: "website",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    title: "Ticketaar",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#6500E8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${body.variable} ${display.variable}`}
    >
      <body className="min-h-dvh bg-canvas text-ink antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "0.75rem",
              border: "1px solid #ece7f6",
              fontFamily: "var(--font-body)",
            },
          }}
        />
      </body>
    </html>
  );
}
