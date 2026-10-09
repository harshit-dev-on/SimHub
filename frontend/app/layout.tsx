import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SimHub | Visualizing Complex Concepts for Students",
  description:
    "Interactive STEM discovery studio and simulation registry for physics, mathematics, and environmental science with predict-observe-explain loops.",
};

import { I18nProvider } from "@/lib/i18n";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F1F3F5] text-slate-900 selection:bg-rose-500/20 selection:text-rose-900 font-sans">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
