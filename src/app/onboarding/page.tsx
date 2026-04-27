"use client";

import Link from "next/link";
import { Lock, ShieldCheck, Eye, SlidersHorizontal } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { HealthLogo } from "@/components/health-logo";
import { Card } from "@/components/ui";

const principles = [
  {
    title: "100% Private",
    text: "All data stored locally on your device. We never send your health data to servers.",
    icon: Lock,
  },
  {
    title: "Full Control",
    text: "You decide what to track. Enable or disable features anytime without penalty.",
    icon: ShieldCheck,
  },
  {
    title: "Total Transparency",
    text: "Clear explanations of what we collect, why, and how you can manage it.",
    icon: Eye,
  },
  {
    title: "Your Consent Matters",
    text: "Granular opt-in controls. Withdraw consent for any feature instantly.",
    icon: SlidersHorizontal,
  },
];

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-5 px-5 py-8">
        <HealthLogo subtitle="Your health, your data, your control" />

        <div className="w-full space-y-3">
          {principles.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="flex items-start gap-3 border-brand-200 bg-brand-50/60 dark:bg-brand-700/10">
                <div className="rounded-xl bg-brand-100 p-2 text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black text-slate-800 dark:text-slate-100">{item.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.text}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <Link
          href="/categories"
          className="w-full rounded-xl bg-brand-600 py-3 text-center font-bold text-white transition hover:bg-brand-700"
        >
          Continue to Privacy Settings
        </Link>

        <p className="text-center text-sm text-slate-500">By continuing, you agree to review and customize your privacy preferences.</p>
      </div>
    </AuthGuard>
  );
}
