"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, Input } from "@/components/ui/field";

export function ResetPasswordForm() {
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (form.password !== form.confirm) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    toast.success("Password updated. Sign in with your new password.");
    router.push("/seller/login");
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      subtitle="Your reset link has been verified. Set a password you have not used on Ticketaar before."
      footer={
        <Link
          href="/seller/login"
          className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to login
        </Link>
      }
    >
      <form onSubmit={submit} className="card-surface space-y-4 p-5">
        <Field label="New password" required htmlFor="reset-password" error={errors.password} hint="At least 8 characters">
          <div className="relative">
            <Input
              id="reset-password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Create a password"
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
        <Field label="Confirm new password" required htmlFor="reset-confirm" error={errors.confirm}>
          <Input
            id="reset-confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={form.confirm}
            onChange={(event) => setForm({ ...form, confirm: event.target.value })}
            placeholder="Repeat your password"
          />
        </Field>
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700"
        >
          <KeyRound className="size-4" />
          Update password
        </button>
        <p className="flex items-center justify-center gap-1.5 text-[0.7rem] text-muted">
          <ShieldCheck className="size-3.5" />
          All other sessions will be signed out.
        </p>
      </form>
    </AuthShell>
  );
}
