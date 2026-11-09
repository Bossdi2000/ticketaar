import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ticketaar — One Ticket, All Access!",
    short_name: "Ticketaar",
    description:
      "Discover concerts, conferences, comedy nights and festivals across Nigeria. Buy tickets in seconds and get a scannable digital ticket instantly.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF8FF",
    theme_color: "#6500E8",
    categories: ["entertainment", "events", "tickets"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
