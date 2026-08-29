"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ANIMATION_STEPS = [
  {
    step: 1,
    title: "1. Sweeping Global Public Logs",
    tag: "DISCOVERY",
    tagColor: "bg-primary-container text-on-primary-container",
    icon: "radar",
    detail: "Rootless Agent crawls Certificate Transparency logs, DNS buffers, and search indices for lookalike domains.",
    log: "[DISCOVERY] Querying CT logs for '%acme%corp%' → Found candidate: 'acme-corp-login-verify.com'",
    highlight: "Discovered candidate with 94% lexical match",
    statusBadge: { label: "SCANNING", color: "bg-retro-yellow" },
  },
  {
    step: 2,
    title: "2. Live Inspection & Content Probe",
    tag: "LIVE TRIAGE",
    tagColor: "bg-secondary-container text-on-secondary-container",
    icon: "biotech",
    detail: "Probes live DNS records (IP 198.51.100.42), captures DOM snapshots, and inspects form actions for stolen assets.",
    log: "[PROBE] HTTP 200 OK | Title: 'ACME SSO Login' | Stolen CSS & Logo assets detected on remote host",
    highlight: "Live cloned login form observed harvesting credentials",
    statusBadge: { label: "ACTIVE CLONE", color: "bg-error text-white" },
  },
  {
    step: 3,
    title: "3. AI Threat Scoring & Evidence Vault",
    tag: "ANALYSIS",
    tagColor: "bg-tertiary-container text-on-tertiary-container",
    icon: "shield",
    detail: "Cross-checks domain against PhishHunt & Bitdefender threat feeds. Generates immutable evidence hash.",
    log: "[ANALYSIS] Confidence: 96% | Classification: LIKELY_IMPERSONATION | Zero legitimate corporate ties",
    highlight: "Sealed 4 photographic artifacts with forensic audit trail",
    statusBadge: { label: "HIGH THREAT 96%", color: "bg-error text-white" },
  },
  {
    step: 4,
    title: "4. Human Approval & Instant Takedown",
    tag: "ACTION",
    tagColor: "bg-retro-green text-on-background",
    icon: "gavel",
    detail: "Strict Human-in-the-Loop protection. Analyst clicks 'Approve' to compile 1-click legal DMCA & registrar notices.",
    log: "[APPROVAL GATE] Operator verified evidence → Dispatched registrar abuse notification to Namecheap Abuse Ops",
    highlight: "Notice compiled and sent to hosting registrar in 1 click",
    statusBadge: { label: "TAKEDOWN READY", color: "bg-retro-green text-on-background" },
  },
];

function ExampleInvestigationAnimation() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => (prev + 1) % ANIMATION_STEPS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const step = ANIMATION_STEPS[currentStepIdx];

  return (
    <div className="bg-surface border-4 border-on-background shadow-brutal p-5 sm:p-7 relative overflow-hidden">
      {/* Top Controls: Step Chips & Play/Pause */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b-2 border-on-background">
        {/* Step Buttons */}
        <div className="flex flex-wrap gap-2">
          {ANIMATION_STEPS.map((s, idx) => {
            const isActive = idx === currentStepIdx;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setCurrentStepIdx(idx);
                  setIsPlaying(false);
                }}
                className={`px-3 py-1.5 font-label-caps text-xs border-2 border-on-background font-bold transition-all shadow-brutal-xs flex items-center gap-1.5 ${
                  isActive
                    ? "bg-primary text-on-primary -rotate-1 scale-105"
                    : "bg-surface text-on-surface-variant hover:bg-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{s.icon}</span>
                <span>STEP {s.step}</span>
              </button>
            );
          })}
        </div>

        {/* Play/Pause Toggle */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3 py-1 bg-surface-container hover:bg-surface-variant border-2 border-on-background text-[11px] font-data-mono font-bold flex items-center gap-1.5 shadow-brutal-xs"
        >
          <span className="material-symbols-outlined text-sm">
            {isPlaying ? "pause" : "play_arrow"}
          </span>
          <span>{isPlaying ? "PAUSE ANIMATION" : "PLAY ANIMATION"}</span>
        </button>
      </div>

      {/* Main Animated Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Interactive Simulated Agent Scanner (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container border-2 border-on-background p-4 sm:p-5 shadow-brutal-xs flex flex-col justify-between">
          <div>
            {/* Step Header */}
            <div className="flex justify-between items-start gap-2 mb-3">
              <span className={`text-[10px] font-label-caps font-black px-2.5 py-0.5 border border-on-background ${step.tagColor}`}>
                {step.tag}
              </span>
              <span className={`text-[10px] font-data-mono font-bold px-2 py-0.5 border border-on-background ${step.statusBadge.color}`}>
                {step.statusBadge.label}
              </span>
            </div>

            <h3 className="font-headline-md text-lg sm:text-xl font-black text-on-background mb-2">
              {step.title}
            </h3>

            <p className="font-body-lg text-xs sm:text-sm text-on-surface-variant mb-4">
              {step.detail}
            </p>
          </div>

          {/* Simulated Live Terminal Feed */}
          <div className="bg-black text-retro-green font-data-mono text-xs p-3.5 border-2 border-on-background shadow-brutal-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-700 pb-1.5 mb-2 font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-retro-green animate-pulse" />
                <span>ROOTLESS_AGENT_ENGINE // SIMULATED TELEMETRY</span>
              </div>
              <span>TARGET: ACME CORP</span>
            </div>
            <p className="font-bold leading-relaxed text-retro-green">
              {step.log}
            </p>
            <div className="mt-2 text-[11px] text-retro-yellow font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
              <span>{step.highlight}</span>
            </div>
          </div>
        </div>

        {/* Right: Live Simulated Result Card (5 cols) */}
        <div className="lg:col-span-5 bg-surface border-2 border-on-background p-4 sm:p-5 shadow-brutal-xs flex flex-col justify-between -rotate-0.5">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-data-mono text-on-surface-variant font-bold">
                SIMULATED EVIDENCE DOSSIER
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-retro-green animate-pulse" />
            </div>

            <div className="border-2 border-dashed border-on-background/40 p-3 bg-surface-variant/40 mb-3">
              <div className="font-headline-sm text-xs uppercase text-primary font-bold">
                CANDIDATE TARGET:
              </div>
              <div className="font-data-mono text-sm font-black text-on-background truncate">
                acme-corp-login-verify.com
              </div>
              <div className="text-[10px] font-data-mono text-on-surface-variant mt-1 flex justify-between">
                <span>IP: 198.51.100.42</span>
                <span>REGISTRAR: Namecheap</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-data-mono">
              <div className="flex justify-between items-center py-1 border-b border-on-surface-variant/20 text-[11px]">
                <span className="text-on-surface-variant font-bold">Similarity Score:</span>
                <span className="text-error font-black">96% (CRITICAL)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-on-surface-variant/20 text-[11px]">
                <span className="text-on-surface-variant font-bold">Brand Artifacts:</span>
                <span className="text-on-background font-bold">Logo, CSS, Login Form</span>
              </div>
              <div className="flex justify-between items-center py-1 text-[11px]">
                <span className="text-on-surface-variant font-bold">Recommended Action:</span>
                <span className="text-primary font-bold">Immediate DMCA Takedown</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t-2 border-on-background flex gap-2">
            <Link
              href="/scan?brand=ACME%20Corp"
              className="flex-1 bg-primary text-on-primary py-2.5 px-3 font-label-caps text-xs uppercase border-2 border-on-background shadow-brutal-xs font-bold text-center btn-brutal flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">radar</span>
              <span>TRY LIVE SCAN</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="mt-5 w-full bg-surface-container border-2 border-on-background h-2">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${((currentStepIdx + 1) / ANIMATION_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

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
        {/* Powered by TrueForge Banner */}
        <div className="mb-6 inline-flex items-center gap-2 bg-retro-yellow text-on-background border-2 border-on-background px-3 py-1 font-label-caps text-xs font-black shadow-brutal-xs rotate-1">
          <span className="material-symbols-outlined text-sm font-black text-primary">bolt</span>
          <span>POWERED BY TRUEFORGE</span>
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
          {/* Starburst Sticker Left: Reasoning Panel */}
          <div className="hidden sm:flex absolute -top-10 -left-12 z-20 transform -rotate-12 hover:rotate-0 transition-transform duration-300 pointer-events-none select-none">
            <div className="relative w-28 h-28 flex items-center justify-center filter drop-shadow-[4px_4px_0px_#000]">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-secondary-container">
                <polygon
                  points="50,0 63,18 85,15 80,38 100,50 80,62 85,85 63,82 50,100 37,82 15,85 20,62 0,50 20,38 15,15 37,18"
                  fill="#ffea00"
                  stroke="#1b1c1a"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="relative z-10 font-label-caps text-[10px] text-center font-black leading-tight text-on-background px-2">
                REASONING<br />PANEL
              </span>
            </div>
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

          {/* Starburst Sticker Right: Human in the Loop */}
          <div className="hidden sm:flex absolute -bottom-9 -right-10 z-20 transform rotate-12 hover:rotate-0 transition-transform duration-300 pointer-events-none select-none">
            <div className="relative w-28 h-28 flex items-center justify-center filter drop-shadow-[4px_4px_0px_#000]">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                <polygon
                  points="50,0 63,18 85,15 80,38 100,50 80,62 85,85 63,82 50,100 37,82 15,85 20,62 0,50 20,38 15,15 37,18"
                  fill="#ff6b35"
                  stroke="#1b1c1a"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="relative z-10 font-label-caps text-[10px] text-center font-black leading-tight text-white px-2">
                HUMAN-IN-<br />THE-LOOP
              </span>
            </div>
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

        {/* Animated Example Investigation Demo Section */}
        <div className="w-full mt-14 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b-border-width-thick border-on-background pb-3 gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary" />
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-3xl uppercase flex items-center gap-2.5">
                <span>HOW IT WORKS IN ACTION</span>
                <span className="text-xs bg-retro-yellow text-on-background px-2.5 py-0.5 border border-on-background font-black font-label-caps rotate-1 shadow-brutal-xs">
                  EXAMPLE ANIMATION
                </span>
              </h2>
            </div>
            <Link
              href="/scan?brand=ACME%20Corp"
              className="font-label-caps text-xs text-primary font-bold hover:underline flex items-center gap-1 bg-surface border-2 border-on-background px-3 py-1.5 shadow-brutal-xs btn-brutal"
            >
              <span className="material-symbols-outlined text-sm">play_arrow</span>
              RUN LIVE INTERACTIVE DEMO →
            </Link>
          </div>

          <ExampleInvestigationAnimation />
        </div>
      </div>
    </div>
  );
}
