"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, Input, Checkbox } from "@/components/ui/field";
import { signInSeller } from "@/lib/store";
import { DEMO_SELLER } from "@/lib/seed/seller";

export function SellerLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter the email on your organiser account");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    const isDemo = email.trim().toLowerCase() === DEMO_SELLER.email.toLowerCase();
    signInSeller(
      isDemo
        ? DEMO_SELLER
        : {
            id: `seller-${Date.now()}`,
            name: email.split("@")[0].replace(/[._-]/g, " "),
            email: email.trim(),
            organization: "Independent organiser",
            phone: "+234 800 000 0000",
            verified: true,
          },
    );
    toast.success("Welcome back");
    router.push("/seller/dashboard");
  }

  return (
    <AuthShell
      eyebrow="For organisers"
      title="Log in to your dashboard"
      subtitle="Track sales, manage events and request payouts from one place."
      footer={
        <>
          New to Ticketaar?{" "}
          <Link href="/seller/register" className="font-semibold text-brand-700 hover:underline">
            Create an organiser account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="card-surface space-y-4 p-5">
        <Field label="Email address" required htmlFor="login-email">
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" required htmlFor="login-password">
          <div className="relative">
            <Input
              id="login-password"
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
        {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
        <div className="flex items-center justify-between gap-3">
          <Checkbox
            label="Remember me"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="flex-1 border-0 p-0 hover:border-0"
          />
          <Link href="/seller/forgot-password" className="text-xs font-semibold text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700"
        >
          <LogIn className="size-4" />
          Log in
        </button>
        <div className="rounded-xl bg-brand-50 p-3 text-[0.7rem] leading-relaxed text-brand-800">
          <p className="font-semibold">Demo credentials</p>
          <p className="mt-0.5 font-mono">{DEMO_SELLER.email}</p>
          <p className="font-mono">demo1234</p>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-[0.7rem] text-muted">
          <ShieldCheck className="size-3.5" />
          Buyers do not need an account. This login is for event organisers only.
        </p>
      </form>
    </AuthShell>
  );
}
