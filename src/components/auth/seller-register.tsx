"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, Input, Checkbox } from "@/components/ui/field";
import { signInSeller } from "@/lib/store";
import { DEMO_SELLER } from "@/lib/seed/seller";

export function SellerRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "Enter a valid phone number";
    if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (form.password !== form.confirm) next.confirm = "Passwords do not match";
    if (!form.terms) next.terms = "Accept the terms to continue";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    signInSeller({
      id: `seller-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      organization: form.organization.trim() || "Independent organiser",
      phone: form.phone.trim(),
      verified: false,
    });
    toast.success("Organiser account created. Add your first event.");
    router.push("/seller/dashboard");
  }

  return (
    <AuthShell
      eyebrow="For organisers"
      title="Create your organiser account"
      subtitle="Publish events, sell tickets and get paid. Verification is quick and we review every organiser."
      footer={
        <>
          Already selling on Ticketaar?{" "}
          <Link href="/seller/login" className="font-semibold text-brand-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="card-surface space-y-4 p-5">
        <Field label="Full name" required htmlFor="reg-name" error={errors.name}>
          <Input
            id="reg-name"
            autoComplete="name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Tola Adeyemi"
          />
        </Field>
        <Field label="Business or organisation name" htmlFor="reg-org" hint="Optional">
          <Input
            id="reg-org"
            autoComplete="organization"
            value={form.organization}
            onChange={(event) => setForm({ ...form, organization: event.target.value })}
            placeholder="Pulse Live Africa"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email address" required htmlFor="reg-email" error={errors.email}>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Phone number" required htmlFor="reg-phone" error={errors.phone}>
            <Input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="+234 801 234 5678"
            />
          </Field>
        </div>
        <Field label="Password" required htmlFor="reg-password" error={errors.password} hint="At least 8 characters">
          <div className="relative">
            <Input
              id="reg-password"
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
        <Field label="Confirm password" required htmlFor="reg-confirm" error={errors.confirm}>
          <Input
            id="reg-confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={form.confirm}
            onChange={(event) => setForm({ ...form, confirm: event.target.value })}
            placeholder="Repeat your password"
          />
        </Field>
        <Checkbox
          label="I accept the organiser terms and refund policy"
          description="Ticketaar holds commission from each sale and settles payouts to your verified bank account."
          checked={form.terms}
          onChange={(event) => setForm({ ...form, terms: event.target.checked })}
        />
        {errors.terms ? <p className="text-xs font-medium text-danger">{errors.terms}</p> : null}

        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700"
        >
          Create account
          <ArrowRight className="size-4" />
        </button>
        <p className="flex items-center justify-center gap-1.5 text-[0.7rem] text-muted">
          <ShieldCheck className="size-3.5" />
          Email verification is required before your first event goes live.
        </p>
        <p className="rounded-lg bg-brand-50 p-2.5 text-[0.7rem] text-brand-800">
          Demo build: submitting creates a local organiser session. Seeded demo account:{" "}
          <span className="font-semibold">{DEMO_SELLER.email}</span>
        </p>
      </form>
    </AuthShell>
  );
}
