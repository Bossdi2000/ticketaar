"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, Input } from "@/components/ui/field";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="Enter the email on your organiser account and we will send a secure reset link."
      footer={
        <Link href="/seller/login" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
          <ArrowLeft className="size-3.5" />
          Back to login
        </Link>
      }
    >
      {sent ? (
        <div className="card-surface p-6 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-green-50 text-success">
            <MailCheck className="size-7" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-ink">Check your inbox</h2>
          <p className="mt-1 text-sm text-muted">
            If an organiser account exists for <span className="font-semibold text-ink">{email}</span>,
            a reset link is on its way. The link expires in 30 minutes.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-4 text-sm font-semibold text-brand-700 hover:underline"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="card-surface space-y-4 p-5">
          <Field label="Email address" required htmlFor="forgot-email">
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700"
          >
            <Send className="size-4" />
            Send reset link
          </button>
          <p className="text-center text-[0.7rem] text-muted">
            Email delivery is wired to Resend once RESEND_API_KEY is configured. In this build the
            link is not actually sent.
          </p>
        </form>
      )}
    </AuthShell>
  );
}
