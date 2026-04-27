"use client";

import { Download, FileText, Trash2 } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-2xl space-y-4">
          <Card>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Privacy Center</h2>
            <p className="mt-2 text-sm text-slate-500">Complete transparency and control over your data.</p>
          </Card>

          <Card>
            <h3 className="mb-2 font-black text-slate-800 dark:text-slate-100">Our Privacy Principles</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Purpose limitation: data used only for selected health tracking purposes.</li>
              <li>Data minimization: we collect only what you enable.</li>
              <li>Local storage: all health data stays on your device.</li>
              <li>No third-party sharing: your data is never sold or shared with advertisers.</li>
            </ul>
          </Card>

          <Card>
            <h3 className="mb-3 font-black text-slate-800 dark:text-slate-100">Your Data Rights</h3>
            <div className="space-y-2">
              <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 font-semibold text-slate-700 transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Download className="h-4 w-4" /> Export All Data (JSON)
              </button>
              <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 font-semibold text-slate-700 transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <FileText className="h-4 w-4" /> View Data Usage Report
              </button>
              <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 py-2 font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-900/20">
                <Trash2 className="h-4 w-4" /> Delete All My Data
              </button>
            </div>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
