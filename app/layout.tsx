import type { Metadata } from "next";
import { Sora, IBM_Plex_Sans } from "next/font/google";
import { ReactNode } from "react";
import "@/app/globals.css";
import { AppShell } from "@/components/app-shell";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display"
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "VC Precision Scout",
  description: "VC intelligence interface with live enrichment"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${plex.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
