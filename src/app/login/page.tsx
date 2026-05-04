"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { AuthPageShell } from "@/components/auth-page-shell";
import { useHealth } from "@/lib/health-store";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useHealth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await login(email.trim(), password);
      setMessage(result.message);

      if (result.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell mode="login">
      <form className="space-y-4" onSubmit={onSubmit}>
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
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-slate-900 outline-none transition focus:border-brand-500"
            />
            <Eye className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-md shadow-brand-600/30 transition hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="text-center text-sm text-brand-600">
          <Link href="/register" className="hover:underline">
            Forgot password?
          </Link>
        </p>

        {message ? <p className="text-center text-sm text-slate-600">{message}</p> : null}
      </form>
    </AuthPageShell>
  );
}
