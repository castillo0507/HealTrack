"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPageShell } from "@/components/auth-page-shell";
import { useHealth } from "@/lib/health-store";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useHealth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!consent) {
      setMessage("Please agree to the privacy policy.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await register({ name: name.trim(), email: email.trim(), password });
      setMessage(result.message);

      if (result.ok) {
        router.push("/onboarding");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell mode="register">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="John Doe"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your.email@example.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a strong password"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm your password"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500"
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          I agree to the Privacy Policy and understand my health data stays on my device.
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-md shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </AuthPageShell>
  );
}
