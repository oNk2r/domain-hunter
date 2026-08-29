"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PAST_ARCHIVES } from "@/lib/investigation-data";

export default function LandingPage() {
  const router = useRouter();
  const [searchBrand, setSearchBrand] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [inputError, setInputError] = useState<string | null>(null);

  const handleStartSearch = async (brand?: string) => {
    if (isSearching) return; // Prevent double-clicks

    const raw = (brand || searchBrand).trim();
    if (!raw) {
      setInputError("PLEASE ENTER A BRAND NAME TO INVESTIGATE");
      return;
    }

    setInputError(null);
    const cleanBrand = raw.replace(/[\x00-\x1F\x7F]/g, "").slice(0, 100);
    setIsSearching(true);

    // Navigate cleanly to scan page
    if (typeof window !== "undefined") {
      window.location.href = `/scan?brand=${encodeURIComponent(cleanBrand)}`;
    } else {
      router.push(`/scan?brand=${encodeURIComponent(cleanBrand)}`);
    }
  };

  return (
    <div className="flex-1 relative overflow-x-hidden">
      {/* Background Graphic Decor: Wavy Ribbon */}
      <div className="absolute top-1/4 left-0 w-[150%] h-16 wavy-ribbon transform -rotate-2 -z-10 opacity-70 pointer-events-none" />
      <div
        className="absolute bottom-1/4 right-0 w-[150%] h-12 bg-primary-fixed border-t-4 border-b-4 border-on-background shadow-brutal transform rotate-3 -z-10 opacity-70 pointer-events-none"
        style={{ left: "-20%" }}
      />

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center relative z-10 text-center max-w-5xl">
        {/* Urgent Alert Banner */}
        <div className="mb-6 inline-flex items-center gap-2 bg-retro-yellow text-on-background border-2 border-on-background px-3 py-1 font-label-caps text-xs font-bold shadow-brutal-xs rotate-1">
          <span className="material-symbols-outlined text-sm">security_update_warning</span>
          <span>CYBER INTELLIGENCE DEFENSE RADAR • ACTIVE</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-headline-xl text-4xl sm:text-5xl md:text-6xl uppercase bg-surface inline-block border-border-width-thick border-on-background px-6 py-4 shadow-brutal-lg -rotate-1 mb-6 leading-tight">
          FIND WHO&apos;S IMPERSONATING YOUR BRAND
        </h1>

        <p className="font-body-lg text-base sm:text-lg bg-surface-container border-border-width-thin border-on-background px-6 py-3 shadow-brutal rotate-1 mb-12 max-w-2xl text-on-surface-variant font-medium">
          An AI investigation agent that discovers suspicious domains, verifies forensic evidence, and keeps humans firmly in control.
        </p>

        {/* Search Centerpiece */}
        <div className="w-full max-w-3xl relative mb-16">
          {/* Starburst Sticker Left */}
          <div className="hidden sm:flex absolute -top-10 -left-12 w-28 h-28 bg-tertiary-container starburst items-center justify-center border-2 border-on-background shadow-brutal z-20 transform -rotate-12">
            <span className="font-label-caps text-[11px] text-center font-bold px-2 -rotate-6 text-on-tertiary-container leading-tight">
              REASONING<br />PANEL
            </span>
          </div>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleStartSearch();
            }}
            className="flex flex-col sm:flex-row border-border-width-thick border-on-background bg-surface shadow-brutal-lg relative z-10 p-2 gap-2 transform rotate-0.5"
          >
            <div className="flex-grow flex items-center bg-white border-2 border-on-background px-4">
              <span className="material-symbols-outlined mr-2 text-on-surface-variant text-3xl">
                search
              </span>
              <input
                type="text"
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                placeholder="ENTER BRAND NAME (E.G. ACME CORP, STRIPE)..."
                className="w-full bg-transparent border-none focus:ring-0 font-data-mono text-base md:text-lg py-4 uppercase placeholder-on-surface-variant outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-primary-container text-on-primary-container font-headline-md text-lg md:text-xl uppercase border-border-width-thick border-on-background shadow-brutal px-8 py-4 whitespace-nowrap btn-brutal transition-all flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  SCANNING...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">radar</span>
                  START INVESTIGATION
                </>
              )}
            </button>
          </form>

          {inputError && (
            <div className="mt-3 bg-error text-white font-data-mono text-xs font-bold p-2.5 border-2 border-on-background shadow-brutal-xs flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              {inputError}
            </div>
          )}

          {/* Starburst Sticker Right */}
          <div className="hidden sm:flex absolute -bottom-8 -right-8 w-28 h-28 bg-error-container starburst items-center justify-center border-2 border-on-background shadow-brutal z-20 transform rotate-6">
            <span className="font-label-caps text-[11px] text-center font-bold px-2 text-on-error-container leading-tight">
              HUMAN-IN-<br />THE-LOOP
            </span>
          </div>
        </div>

        {/* Quick Target Chips */}
        <div className="w-full max-w-2xl bg-surface border-2 border-on-background p-4 shadow-brutal-sm -rotate-0.5 mb-14">
          <div className="font-label-caps text-xs text-on-surface-variant font-bold mb-2 uppercase">
            ⚡ Quick Target Sandbox Demos:
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { name: "ACME Corp", desc: "Enterprise SSO Clone (Default Case)" },
              { name: "PayPal", desc: "Payment Gateway Phish" },
              { name: "Stripe", desc: "Developer API Spoof" },
              { name: "Netflix", desc: "Billing Account Scam" },
              { name: "GitHub", desc: "SSH Key Scraper" },
            ].map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearchBrand(preset.name);
                  handleStartSearch(preset.name);
                }}
                className="bg-surface-container hover:bg-primary-container hover:text-on-primary-container border-2 border-on-background font-data-mono text-xs px-3 py-1.5 shadow-brutal-xs font-semibold active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                + {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bento Grid Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Card 1 */}
          <div className="bg-surface border-border-width-thick border-on-background shadow-brutal p-6 transform -rotate-1.5 relative">
            <div className="absolute -top-3 -right-3 bg-secondary-container border-2 border-on-background font-label-caps text-xs font-black px-2 py-1 shadow-brutal-xs rotate-6">
              FAST
            </div>
            <span className="material-symbols-outlined text-4xl mb-4 block text-primary font-bold">
              speed
            </span>
            <h3 className="font-headline-md text-headline-md mb-2">Rapid Scanning</h3>
            <p className="font-data-mono text-sm text-on-surface-variant leading-relaxed">
              Cross-references global Certificate Transparency logs, DNS buffers, and whois records in seconds.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-tertiary-fixed-dim border-border-width-thick border-on-background shadow-brutal p-6 transform rotate-1 text-on-tertiary-fixed">
            <span className="material-symbols-outlined text-4xl mb-4 block font-bold">
              policy
            </span>
            <h3 className="font-headline-md text-headline-md mb-2">Evidence Vault</h3>
            <p className="font-data-mono text-sm leading-relaxed opacity-90">
              Captures cryptographic DOM snapshots, network payloads, and visual polaroid records of all suspicious findings.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-surface border-border-width-thick border-on-background shadow-brutal p-6 transform -rotate-0.5">
            <span className="material-symbols-outlined text-4xl mb-4 block text-secondary font-bold">
              gavel
            </span>
            <h3 className="font-headline-md text-headline-md mb-2">Take Action</h3>
            <p className="font-data-mono text-sm text-on-surface-variant leading-relaxed">
              Generate registrar abuse notices and DMCA takedown requests instantly with human authorization.
            </p>
          </div>
        </div>

        {/* Recent Cases Section */}
        <div className="w-full mt-16 text-left">
          <div className="flex justify-between items-center mb-6 border-b-border-width-thick border-on-background pb-3">
            <h2 className="font-headline-lg text-headline-lg uppercase flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-primary">folder_open</span>
              ACTIVE CASE INTELLIGENCE
            </h2>
            <Link
              href="/results"
              className="font-label-caps text-xs text-primary font-bold hover:underline flex items-center gap-1"
            >
              VIEW RESULTS QUEUE →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PAST_ARCHIVES.map((arch, idx) => (
              <div
                key={arch.id}
                className={`bg-surface border-2 border-on-background p-4 shadow-brutal-sm ${
                  idx % 2 === 0 ? "rotate-0.5" : "-rotate-0.5"
                } hover:scale-[1.02] transition-transform`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-headline-sm text-sm uppercase text-primary font-bold">
                    {arch.brandName}
                  </span>
                  <span className="font-data-mono text-[10px] bg-retro-yellow px-1.5 py-0.5 border border-on-background font-bold">
                    SCORE: {arch.threatScore}%
                  </span>
                </div>
                <div className="font-data-mono text-xs text-tertiary truncate mb-2">
                  {arch.targetDomain}
                </div>
                <div className="flex justify-between items-center text-[10px] font-label-caps text-on-surface-variant border-t border-dashed border-on-surface-variant pt-2">
                  <span>{arch.status}</span>
                  <span>{arch.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
