import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={<div className="h-14 border-b border-line bg-white lg:h-16" />}>
        <Header />
      </Suspense>
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <div className="pb-20 lg:pb-0">
        <Footer />
      </div>
      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
    </div>
  );
}
