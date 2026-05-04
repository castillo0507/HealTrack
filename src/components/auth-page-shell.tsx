import Link from "next/link";
import { Shield } from "lucide-react";
import { HealthLogo } from "@/components/health-logo";

export function AuthPageShell({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "login" | "register";
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-8 sm:max-w-lg">
      <HealthLogo subtitle="Privacy-first health tracking" />

      <div className="my-7 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm shadow-slate-200/60">
        <p className="flex items-start gap-2 text-sm font-medium">
          <Shield className="mt-0.5 h-4 w-4" />
          Your credentials are stored securely. We never access your health data.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
        <div className="mb-4 grid grid-cols-2 rounded-full bg-slate-100 p-1">
          <Link
            href="/login"
            className={`rounded-full py-2 text-center text-sm font-bold transition ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-700"
            }`}
          >
            Log In
          </Link>
          <Link
            href="/register"
            className={`rounded-full py-2 text-center text-sm font-bold transition ${
              mode === "register"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-700"
            }`}
          >
            Sign Up
          </Link>
        </div>

        {children}
      </div>

      <div className="mt-6 space-y-2 text-sm text-slate-700">
        <p>• End-to-end encrypted</p>
        <p>• Local data storage only</p>
      </div>
    </div>
  );
}
