import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { HealthProvider } from "@/lib/health-store";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealTrack",
  description: "Privacy-first personal health tracking dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full bg-app text-slate-800">
        <HealthProvider>{children}</HealthProvider>
      </body>
    </html>
  );
}
