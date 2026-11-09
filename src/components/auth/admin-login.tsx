"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Field, Input } from "@/components/ui/field";
import { signInAdmin } from "@/lib/store";
import { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } from "@/lib/seed/admin";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError("Those credentials do not match an administrator account.");
      return;
    }
    setError("");
    signInAdmin({ email: ADMIN_EMAIL, name: ADMIN_NAME });
    toast.success("Administrator session started");
    router.push("/admin/dashboard");
  }

  return (
    <div className="relative grid min-h-dvh place-items-center bg-brand-950 px-4 py-10">
      <div className="grid-texture pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Logo inverted size="lg" showSlogan />
          </Link>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-brand-100">
            <ShieldCheck className="size-3.5" />
            Restricted platform access
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 rounded-2xl bg-white p-6 shadow-glow-hover">
          <h1 className="text-xl font-extrabold text-ink">Administrator login</h1>
          <p className="mt-1 text-sm text-muted">
            This console manages every seller, event and payout on Ticketaar.
          </p>

          <div className="mt-5 space-y-4">
            <Field label="Admin email" required htmlFor="admin-email">
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@ticketaar.ng"
              />
            </Field>
            <Field label="Password" required htmlFor="admin-password">
              <div className="relative">
                <Input
                  id="admin-password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((value) => !value)}
                  className="absolute right-2 top-2.5 grid size-6 place-items-center rounded text-muted hover:text-brand-700"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            {error ? (
              <p className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-danger">{error}</p>
            ) : null}
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700"
            >
              <LockKeyhole className="size-4" />
              Sign in securely
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-brand-50 p-3 text-[0.7rem] leading-relaxed text-brand-800">
            <p className="font-semibold">Demo administrator</p>
            <p className="mt-0.5 font-mono">{ADMIN_EMAIL}</p>
            <p className="font-mono">{ADMIN_PASSWORD}</p>
            <p className="mt-1 text-brand-700">
              Replace this with server-side admin authentication before launch.
            </p>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-brand-200">
          <Link href="/" className="font-semibold text-white hover:underline">
            Back to Ticketaar
          </Link>
        </p>
      </div>
    </div>
  );
}
