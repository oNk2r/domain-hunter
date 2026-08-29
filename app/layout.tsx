import type { Metadata } from "next";
import "./globals.css";
import { SideNav } from "@/components/SideNav";
import { MobileNav } from "@/components/MobileNav";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Domain Hunter - AI Brand Impersonator Scanner",
  description: "An AI investigation agent that discovers suspicious domains, verifies evidence, and keeps humans in control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-graph-paper min-h-screen text-on-background antialiased flex flex-col md:flex-row">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
