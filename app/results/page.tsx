"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { INITIAL_CASE, InvestigationCase, InvestigatedDomain } from "@/lib/investigation-data";
import type { InvestigationResult, DomainResult, DomainClassification } from "@/lib/use-investigation";
import { TakedownModal } from "@/components/TakedownModal";

type ViewMode = "real" | "demo";

export default function InvestigationResultsPage() {
  // Real investigation results from TrueForge
  const [realResult, setRealResult] = useState<InvestigationResult | null>(null);
  // Demo/legacy case data (fallback)
  const [activeCase, setActiveCase] = useState<InvestigationCase>(INITIAL_CASE);
  const [viewMode, setViewMode] = useState<ViewMode>("demo");

  const [filter, setFilter] = useState<"ALL" | "SUSPICIOUS" | "LEGITIMATE" | "LIKELY_IMPERSONATION" | "INCONCLUSIVE" | "PARKED_OR_INACTIVE">("ALL");
  const [sortBy, setSortBy] = useState<"RISK" | "CONFIDENCE" | "NAME">("RISK");
  const [selectedDomainForTakedown, setSelectedDomainForTakedown] = useState<InvestigatedDomain | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Try loading real investigation results first
      const realStored = localStorage.getItem("investigation_result");
      if (realStored) {
        try {
          const parsed: InvestigationResult = JSON.parse(realStored);
          setRealResult(parsed);
          setViewMode("real");
          return;
        } catch (err) {
          console.error("Failed to parse investigation result", err);
        }
      }

      // Fallback to demo case data
      const stored = localStorage.getItem("active_case");
      if (stored) {
        try {
          setActiveCase(JSON.parse(stored));
          setViewMode("demo");
        } catch (err) {
          console.error("Failed to load active case", err);
        }
      }
    }
  }, []);

  // ── Real Results View ──────────────────────────────────────────────

  if (viewMode === "real" && realResult) {
    return (
      <RealResultsView
        result={realResult}
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
    );
  }

  // ── Demo/Legacy View (unchanged from original) ────────────────────

  const handleSelectDomain = (domain: InvestigatedDomain) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selected_domain_id", domain.id);
    }
  };

  let displayedDomains = activeCase.domains.filter((d) => {
    if (filter === "ALL") return true;
    return d.status === filter;
  });

  displayedDomains = [...displayedDomains].sort((a, b) => {
    if (sortBy === "RISK") return b.phishingScore - a.phishingScore;
    if (sortBy === "CONFIDENCE") return b.confidence - a.confidence;
    return a.domainName.localeCompare(b.domainName);
  });

  return (
    <div className="flex-1 p-4 md:p-8 relative overflow-x-hidden">
      {/* Header Section */}
      <header className="mb-10 relative">
        <div className="absolute -top-3 -left-3 w-32 h-7 bg-secondary-container border-2 border-on-background -rotate-2 shadow-brutal-sm z-0 mix-blend-multiply opacity-80" />
        <h1 className="font-headline-xl text-4xl sm:text-5xl uppercase text-on-background relative z-10 inline-block bg-surface px-4 py-2 border-4 border-on-background shadow-brutal -rotate-0.5">
          SCAN RESULTS
        </h1>
        <p className="font-data-mono text-sm mt-3 text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">target</span>
          TARGET_ID: <span className="font-bold text-on-background">{activeCase.targetId}</span>
          <span className="text-on-surface-variant/50">•</span>
        </p>

        {/* Live Scan Suggestion Banner */}
        <div className="mt-4 bg-retro-yellow/30 border-2 border-on-background p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-brutal-xs">
          <div className="flex items-center gap-2 text-xs font-data-mono text-on-background">
            <span className="material-symbols-outlined text-primary text-base">info</span>
            <span>Viewing archived reference data. To launch a live TrueForge AI brand hunt:</span>
          </div>
          <Link
            href="/"
            className="px-3 py-1.5 bg-primary-container text-on-primary-container font-label-caps text-xs border-2 border-on-background shadow-brutal-xs btn-brutal font-bold whitespace-nowrap"
          >
            LAUNCH LIVE SCAN
          </Link>
        </div>
      </header>

      {/* Top Stats Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div
          onClick={() => setFilter("ALL")}
          className={`bg-surface border-border-width-thick border-on-background p-6 shadow-brutal rotate-1 relative cursor-pointer hover:scale-[1.02] transition-transform ${
            filter === "ALL" ? "ring-4 ring-primary" : ""
          }`}
        >
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-secondary-container border-2 border-on-background flex items-center justify-center font-bold text-xs">
            #
          </div>
          <h3 className="font-label-caps text-xs text-on-surface-variant mb-2 uppercase font-bold">
            Total Scanned
          </h3>
          <p className="font-headline-lg text-3xl sm:text-4xl font-extrabold">
            {activeCase.stats.totalFound} <span className="text-tertiary text-xl font-normal">Domains</span>
          </p>
          <div className="mt-4 h-2 w-full bg-inverse-on-surface border-2 border-on-background">
            <div className="h-full bg-on-background w-[100%]" />
          </div>
        </div>
        <div className="bg-primary-container text-on-primary-container border-border-width-thick border-on-background p-6 shadow-brutal -rotate-1 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform">
          <h3 className="font-label-caps text-xs mb-2 uppercase border-b-2 border-on-primary-container inline-block font-bold">
            Action Req
          </h3>
          <p className="font-headline-lg text-3xl sm:text-4xl font-extrabold">
            {activeCase.stats.actionRequired} <span className="text-surface text-xl font-normal">Investigate</span>
          </p>
          <div className="mt-4 text-xs font-data-mono flex items-center gap-1 font-bold">
            <span className="material-symbols-outlined text-sm">warning</span>
            HUMAN DISPATCH NEEDED
          </div>
        </div>
        <div className={`bg-surface border-border-width-thick border-on-background p-6 shadow-brutal rotate-2 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform`}>
          <h3 className="font-label-caps text-xs text-on-surface-variant mb-2 uppercase flex items-center justify-between font-bold">
            Likely Legit
            <span className="material-symbols-outlined text-retro-green font-bold">verified</span>
          </h3>
          <p className="font-headline-lg text-3xl sm:text-4xl font-extrabold text-on-background">
            {activeCase.stats.likelyLegit}
          </p>
          <span className="text-[11px] font-data-mono text-on-surface-variant">Validated brand apex/subs</span>
        </div>
        <div className={`bg-retro-yellow border-border-width-thick border-on-background p-6 shadow-brutal -rotate-2 relative cursor-pointer hover:scale-[1.02] transition-transform`}>
          <div className="absolute -top-2 -right-2 w-12 h-6 bg-surface-variant rotate-45 border border-on-background" />
          <h3 className="font-label-caps text-xs text-on-background mb-2 uppercase font-black tracking-wider">
            HIGH ALERT
          </h3>
          <p className="font-headline-lg text-3xl sm:text-4xl text-error font-black">
            {activeCase.stats.suspicious} <span className="text-on-background text-xl font-bold">Suspicious</span>
          </p>
          <span className="text-[11px] font-data-mono text-on-background/80 font-bold">90%+ Threat Confidence</span>
        </div>
      </section>

      {/* Main List Area */}
      <section className="relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 border-b-border-width-thick border-on-background pb-3 gap-4">
          <h2 className="font-headline-md text-2xl uppercase flex items-center gap-3">
            <span className="material-symbols-outlined bg-on-background text-surface p-1.5 text-xl">
              view_list
            </span>
            INVESTIGATION QUEUE ({displayedDomains.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            <div className="flex border-2 border-on-background bg-surface shadow-brutal-sm">
              {(["ALL", "SUSPICIOUS", "LEGITIMATE", "INVESTIGATING"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as typeof filter)}
                  className={`px-2.5 py-1 font-label-caps text-[10px] font-bold transition-colors ${
                    filter === f
                      ? "bg-secondary text-on-secondary"
                      : "text-on-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (sortBy === "RISK") setSortBy("CONFIDENCE");
                else if (sortBy === "CONFIDENCE") setSortBy("NAME");
                else setSortBy("RISK");
              }}
              className="px-3 py-1 border-2 border-on-background bg-surface font-label-caps text-xs hover:bg-surface-variant shadow-brutal-sm btn-brutal transition-all flex items-center gap-1 font-bold"
            >
              <span className="material-symbols-outlined text-sm">sort</span>
              SORT: {sortBy}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {displayedDomains.map((domain, idx) => {
            const isSuspicious = domain.status === "SUSPICIOUS";
            const isLegit = domain.status === "LEGITIMATE";
            const isScanning = domain.status === "INVESTIGATING";

            return (
              <article
                key={domain.id}
                className={`bg-surface border-border-width-thick border-on-background p-6 shadow-brutal transition-transform hover:scale-[1.01] ${
                  idx % 2 === 0 ? "-rotate-0.5" : "rotate-0.5"
                } ${isLegit ? "bg-surface-container" : ""}`}
              >
                <div className="flex justify-between items-start mb-4">
                  {isSuspicious && (
                    <div className="bg-retro-yellow border-2 border-on-background px-3 py-1 font-label-caps text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-1 inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">warning</span>
                      SUSPICIOUS
                    </div>
                  )}
                  {isLegit && (
                    <div className="bg-retro-green border-2 border-on-background px-3 py-1 font-label-caps text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-1 inline-flex items-center gap-1 text-on-background">
                      <span className="material-symbols-outlined text-base">verified_user</span>
                      LEGITIMATE
                    </div>
                  )}
                  {isScanning && (
                    <div className="bg-surface-variant border-2 border-on-background px-3 py-1 font-label-caps text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-1 inline-flex items-center gap-1 text-on-background">
                      <span className="material-symbols-outlined text-base animate-spin">sync</span>
                      INVESTIGATING
                    </div>
                  )}
                  <div className="text-right">
                    <span className="font-data-mono text-[11px] text-on-surface-variant block font-bold">CONFIDENCE</span>
                    <span className={`font-headline-md text-2xl font-black ${isSuspicious ? "text-error" : isLegit ? "text-on-surface" : "text-tertiary"}`}>
                      {domain.confidence}%
                    </span>
                  </div>
                </div>
                <h3 className={`font-headline-md text-xl sm:text-2xl mb-2 break-all ${isSuspicious ? "underline decoration-4 decoration-primary-container underline-offset-4" : ""}`}>
                  {domain.domainName}
                </h3>
                {domain.highlight && (
                  <p className="text-xs font-data-mono text-on-surface-variant mb-4 bg-surface-variant/60 p-2 border border-on-background/20">
                    {domain.highlight}
                  </p>
                )}
                <div className="flex items-center gap-4 my-4 py-3 border-y-2 border-dashed border-on-surface-variant/40">
                  <div className="flex-1">
                    <span className="font-data-mono text-on-surface-variant block text-[10px] font-bold">IP ORIGIN</span>
                    <span className="font-data-mono text-xs block font-bold truncate">{domain.ip}</span>
                  </div>
                  <div className="w-0.5 h-7 bg-on-surface-variant/30" />
                  <div className="flex-1">
                    <span className="font-data-mono text-on-surface-variant block text-[10px] font-bold">REG DATE</span>
                    <span className="font-data-mono text-xs block font-bold">{domain.regDate}</span>
                  </div>
                  <div className="w-0.5 h-7 bg-on-surface-variant/30" />
                  <div className="flex-1 text-center">
                    <span className="font-data-mono text-on-surface-variant block text-[10px] font-bold">EVIDENCE</span>
                    <div className="font-headline-sm text-sm bg-inverse-surface text-inverse-on-surface inline-block px-2 py-0.5 rounded-sm">
                      {domain.evidenceCount} ITEMS
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link
                    href="/evidence"
                    onClick={() => handleSelectDomain(domain)}
                    className="flex-1 bg-primary text-on-primary border-border-width-thick border-on-background p-3 font-headline-sm text-sm uppercase shadow-brutal btn-brutal transition-all flex items-center justify-center gap-2 text-center"
                  >
                    VIEW EVIDENCE CORKBOARD
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </Link>
                  {isSuspicious && (
                    <button
                      onClick={() => setSelectedDomainForTakedown(domain)}
                      className="bg-retro-yellow text-on-background border-2 border-on-background px-4 py-3 font-headline-sm text-sm uppercase shadow-brutal btn-brutal flex items-center gap-1 font-bold"
                      title="Quick Takedown Notice"
                    >
                      <span className="material-symbols-outlined text-base">gavel</span>
                      TAKEDOWN
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {selectedDomainForTakedown && (
        <TakedownModal
          isOpen={true}
          onClose={() => setSelectedDomainForTakedown(null)}
          domain={selectedDomainForTakedown}
          brandName={activeCase.brandName}
        />
      )}
    </div>
  );
}

// ── Real TrueForge Results Component ───────────────────────────────────

function classificationBadge(classification: DomainClassification) {
  const configs: Record<DomainClassification, { bg: string; text: string; icon: string; label: string }> = {
    LEGITIMATE: { bg: "bg-retro-green", text: "text-on-background", icon: "verified_user", label: "LEGITIMATE" },
    SUSPICIOUS: { bg: "bg-retro-yellow", text: "text-on-background", icon: "warning", label: "SUSPICIOUS" },
    LIKELY_IMPERSONATION: { bg: "bg-error", text: "text-white", icon: "dangerous", label: "LIKELY IMPERSONATION" },
    INCONCLUSIVE: { bg: "bg-surface-variant", text: "text-on-background", icon: "help", label: "INCONCLUSIVE" },
    PARKED_OR_INACTIVE: { bg: "bg-tertiary-container", text: "text-on-tertiary-container", icon: "domain_disabled", label: "PARKED / INACTIVE" },
  };
  return configs[classification] || configs.INCONCLUSIVE;
}

type ResultFilter = "ALL" | "SUSPICIOUS" | "LEGITIMATE" | "LIKELY_IMPERSONATION" | "INCONCLUSIVE" | "PARKED_OR_INACTIVE";
type ResultSort = "RISK" | "CONFIDENCE" | "NAME";

function RealResultsView({
  result,
  filter,
  setFilter,
  sortBy,
  setSortBy,
}: {
  result: InvestigationResult;
  filter: ResultFilter;
  setFilter: (f: ResultFilter) => void;
  sortBy: ResultSort;
  setSortBy: (s: ResultSort) => void;
}) {
  const [expandedRaw, setExpandedRaw] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  let displayed = result.domains.filter((d) => {
    if (filter === "ALL") return true;
    return d.classification === filter;
  });

  displayed = [...displayed].sort((a, b) => {
    if (sortBy === "RISK") {
      const riskOrder: Record<DomainClassification, number> = {
        LIKELY_IMPERSONATION: 0,
        SUSPICIOUS: 1,
        INCONCLUSIVE: 2,
        PARKED_OR_INACTIVE: 3,
        LEGITIMATE: 4,
      };
      return (riskOrder[a.classification] ?? 5) - (riskOrder[b.classification] ?? 5);
    }
    if (sortBy === "CONFIDENCE") return (b.confidence || 0) - (a.confidence || 0);
    return a.domain.localeCompare(b.domain);
  });

  const totalCandidates = result.domains.length;
  const likelyImpersonationCount = result.domains.filter((d) => d.classification === "LIKELY_IMPERSONATION").length;
  const suspiciousOnlyCount = result.domains.filter((d) => d.classification === "SUSPICIOUS").length;
  const inconclusiveCount = result.domains.filter((d) => d.classification === "INCONCLUSIVE" || d.classification === "PARKED_OR_INACTIVE").length;
  const humanReviewCount = result.domains.filter((d) => d.humanReviewRequired || d.classification === "SUSPICIOUS" || d.classification === "LIKELY_IMPERSONATION").length;

  const handleCopyRaw = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(result.rawAgentOutput);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 relative overflow-x-hidden">
      {/* Header */}
      <header className="mb-8 relative">
        <div className="inline-flex items-center gap-2 bg-retro-green text-on-background border-4 border-on-background px-4 py-1.5 font-label-caps text-xs font-black shadow-brutal-sm mb-4 rotate-0.5">
          <span className="material-symbols-outlined text-base">check_circle</span>
          INVESTIGATION COMPLETE
        </div>
        <h1 className="font-headline-xl text-3xl sm:text-5xl uppercase text-on-background block bg-surface px-6 py-3 border-4 border-on-background shadow-brutal -rotate-0.5 leading-tight">
          INVESTIGATION FINDINGS: [{result.brand.toUpperCase()}]
        </h1>
        <div className="font-data-mono text-xs mt-3 text-on-surface-variant flex flex-wrap items-center gap-3">
          <span className="bg-surface border border-on-background px-2 py-0.5 font-bold">
            TARGET: <span className="text-primary">{result.brand.toUpperCase()}</span>
          </span>
          <span>•</span>
          <span>SESSION: <strong className="text-on-background">{result.sessionId || "TF-SESSION"}</strong></span>
          <span>•</span>
          <span>COMPLETED: {result.completedAt ? new Date(result.completedAt).toLocaleTimeString() : "LIVE"}</span>
          <span>•</span>
          <span className="text-retro-green font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">verified</span>
            Evidence-backed
          </span>
        </div>
      </header>

      {/* Top Bento Stats Grid (TASK 8) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {/* Candidates */}
        <div
          onClick={() => setFilter("ALL")}
          className={`bg-surface border-4 border-on-background p-4 shadow-brutal cursor-pointer hover:scale-[1.02] transition-transform ${
            filter === "ALL" ? "ring-4 ring-primary" : ""
          }`}
        >
          <span className="font-label-caps text-[10px] text-on-surface-variant font-bold block uppercase">
            Candidates
          </span>
          <p className="font-headline-lg text-3xl font-black mt-1">{totalCandidates}</p>
          <span className="text-[10px] font-data-mono text-on-surface-variant">Total domains</span>
        </div>

        {/* Likely Impersonation */}
        <div
          onClick={() => setFilter("LIKELY_IMPERSONATION")}
          className={`bg-error text-white border-4 border-on-background p-4 shadow-brutal cursor-pointer hover:scale-[1.02] transition-transform ${
            filter === "LIKELY_IMPERSONATION" ? "ring-4 ring-on-background" : ""
          }`}
        >
          <span className="font-label-caps text-[10px] text-white/90 font-bold block uppercase">
            Likely Impersonation
          </span>
          <p className="font-headline-lg text-3xl font-black mt-1">{likelyImpersonationCount}</p>
          <span className="text-[10px] font-data-mono text-white/80">Active mimicry</span>
        </div>

        {/* Suspicious */}
        <div
          onClick={() => setFilter("SUSPICIOUS")}
          className={`bg-retro-yellow text-on-background border-4 border-on-background p-4 shadow-brutal cursor-pointer hover:scale-[1.02] transition-transform ${
            filter === "SUSPICIOUS" ? "ring-4 ring-on-background" : ""
          }`}
        >
          <span className="font-label-caps text-[10px] text-on-background/80 font-bold block uppercase">
            Suspicious
          </span>
          <p className="font-headline-lg text-3xl font-black mt-1 text-error">{suspiciousOnlyCount}</p>
          <span className="text-[10px] font-data-mono text-on-background/70">Potential risk</span>
        </div>

        {/* Inconclusive */}
        <div
          onClick={() => setFilter("INCONCLUSIVE")}
          className={`bg-surface-container border-4 border-on-background p-4 shadow-brutal cursor-pointer hover:scale-[1.02] transition-transform ${
            filter === "INCONCLUSIVE" ? "ring-4 ring-primary" : ""
          }`}
        >
          <span className="font-label-caps text-[10px] text-on-surface-variant font-bold block uppercase">
            Inconclusive
          </span>
          <p className="font-headline-lg text-3xl font-black mt-1">{inconclusiveCount}</p>
          <span className="text-[10px] font-data-mono text-on-surface-variant">Insufficient data</span>
        </div>

        {/* Human Review Required */}
        <div className="bg-secondary-container text-on-secondary-container border-4 border-on-background p-4 shadow-brutal col-span-2 sm:col-span-1">
          <span className="font-label-caps text-[10px] text-on-secondary-container/80 font-bold block uppercase">
            Human Review
          </span>
          <p className="font-headline-lg text-3xl font-black mt-1 text-error">{humanReviewCount}</p>
          <span className="text-[10px] font-data-mono text-on-secondary-container/90 font-bold">Manual approval needed</span>
        </div>
      </section>

      {/* Global Safety Notice */}
      <div className="mb-8 bg-surface border-4 border-on-background p-4 shadow-brutal-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-primary font-black">gavel</span>
          <div>
            <h3 className="font-headline-sm text-sm font-bold">HUMAN-IN-THE-LOOP SAFETY PROTOCOL ACTIVE</h3>
            <p className="font-data-mono text-xs text-on-surface-variant">
              Investigation complete. No automated takedowns, DNS blocks, or abuse notices have been executed.
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpandedRaw(!expandedRaw)}
          className="px-4 py-2 bg-primary-container text-on-primary-container font-label-caps text-xs border-2 border-on-background shadow-brutal-xs btn-brutal font-bold whitespace-nowrap flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">data_object</span>
          [ {expandedRaw ? "HIDE RAW EVIDENCE" : "VIEW RAW EVIDENCE"} ]
        </button>
      </div>

      {/* Raw Evidence Drawer / Viewer (TASK 7) */}
      {expandedRaw && (
        <section className="mb-10 bg-inverse-surface border-4 border-on-background p-6 shadow-brutal text-inverse-on-surface animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-inverse-on-surface/20">
            <div>
              <h2 className="font-headline-md text-headline-md uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-retro-yellow">terminal</span>
                UNALTERED RAW AGENT OUTPUT (AUDIT LOG)
              </h2>
              <p className="font-data-mono text-xs text-inverse-on-surface/70 mt-1">
                Verbatim output streamed from TrueForge agent session. Preserved for full forensic auditability.
              </p>
            </div>
            <button
              onClick={handleCopyRaw}
              className="bg-surface text-on-background border-2 border-on-background px-3 py-1 font-label-caps text-xs btn-brutal font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              {copiedRaw ? "COPIED!" : "COPY RAW"}
            </button>
          </div>
          <pre className="font-data-mono text-xs whitespace-pre-wrap break-all max-h-96 overflow-y-auto bg-black/40 p-4 border-2 border-inverse-on-surface/30">
            {result.rawAgentOutput || "(empty response received)"}
          </pre>
        </section>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 border-b-border-width-thick border-on-background pb-3 gap-4">
        <h2 className="font-headline-md text-2xl uppercase flex items-center gap-3">
          <span className="material-symbols-outlined bg-on-background text-surface p-1.5 text-xl">view_list</span>
          EVIDENCE DOSSIER ({displayed.length} / {totalCandidates})
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap border-2 border-on-background bg-surface shadow-brutal-sm">
            {(["ALL", "LIKELY_IMPERSONATION", "SUSPICIOUS", "INCONCLUSIVE", "LEGITIMATE", "PARKED_OR_INACTIVE"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1.5 font-label-caps text-[10px] font-bold transition-colors ${
                  filter === f ? "bg-secondary text-on-secondary" : "text-on-surface-variant hover:bg-surface-variant"
                }`}
              >
                {f.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (sortBy === "RISK") setSortBy("CONFIDENCE");
              else if (sortBy === "CONFIDENCE") setSortBy("NAME");
              else setSortBy("RISK");
            }}
            className="px-3 py-1.5 border-2 border-on-background bg-surface font-label-caps text-xs hover:bg-surface-variant shadow-brutal-sm btn-brutal flex items-center gap-1 font-bold"
          >
            <span className="material-symbols-outlined text-sm">sort</span>
            SORT: {sortBy}
          </button>
        </div>
      </div>

      {/* Empty / Insufficient Evidence State (TASK 9) */}
      {displayed.length === 0 && (
        <div className="bg-surface border-4 border-on-background p-10 shadow-brutal text-center mb-10">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-3">search_off</span>
          <div className="inline-block bg-retro-yellow border-2 border-on-background px-4 py-1 font-label-caps text-xs font-black mb-3">
            INSUFFICIENT EVIDENCE
          </div>
          <h3 className="font-headline-md text-2xl uppercase">No Candidate Domains Match the Criteria</h3>
          <p className="font-data-mono text-xs text-on-surface-variant max-w-xl mx-auto mt-2">
            {result.domains.length === 0
              ? "The agent completed its investigation but did not identify structured candidates for this target. Click [ VIEW RAW EVIDENCE ] above to inspect the agent's research notes."
              : "No domains match your active filter. Select ALL to view all analyzed candidates."}
          </p>
        </div>
      )}

      {/* Result Cards Grid (TASK 1, 2, 3, 4, 5, 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {displayed.map((domain, idx) => (
          <RealDomainCard key={`${domain.domain}-${idx}`} domain={domain} idx={idx} />
        ))}
      </div>
    </div>
  );
}

function RealDomainCard({ domain, idx }: { domain: DomainResult; idx: number }) {
  const badge = classificationBadge(domain.classification);

  return (
    <article
      className={`bg-surface border-border-width-thick border-on-background p-6 shadow-brutal transition-transform hover:scale-[1.005] flex flex-col justify-between ${
        idx % 2 === 0 ? "-rotate-0.5" : "rotate-0.5"
      }`}
    >
      <div>
        {/* Top: Classification Badge + Confidence */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className={`${badge.bg} ${badge.text} border-2 border-on-background px-3 py-1.5 font-label-caps text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-1 inline-flex items-center gap-1.5`}>
            <span className="material-symbols-outlined text-base">{badge.icon}</span>
            {badge.label}
          </div>
          <div className="text-right">
            <span className="font-data-mono text-[10px] text-on-surface-variant block font-bold uppercase">
              Confidence in Classification
            </span>
            <span className="font-headline-md text-2xl sm:text-3xl font-black text-on-background">
              {domain.confidence !== null ? `${domain.confidence}%` : "N/A"}
            </span>
            <span className="text-[9px] font-data-mono text-on-surface-variant/80 block">
              Assessment Confidence
            </span>
          </div>
        </div>

        {/* Domain Name */}
        <h3 className="font-headline-md text-xl sm:text-2xl mb-3 font-mono font-black break-all text-on-background border-b-2 border-on-background/20 pb-2">
          {domain.domain}
        </h3>

        {/* Reasoning / Analysis */}
        {domain.reasoning && (
          <div className="mb-4 bg-surface-variant/60 p-3 border-2 border-on-background/30 text-xs font-data-mono text-on-surface-variant">
            <span className="font-label-caps text-[10px] font-bold text-on-background block mb-1">
              INVESTIGATOR REASONING
            </span>
            {domain.reasoning}
          </div>
        )}

        {/* Evidence Sections */}
        <div className="space-y-4 mb-4">
          {/* Current Observations (TASK 3) */}
          <div className="bg-primary-container/20 border-l-4 border-primary p-3">
            <h4 className="font-label-caps text-[10px] text-primary font-bold mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">visibility</span>
              CURRENT OBSERVATIONS
            </h4>
            {domain.currentObservations.length > 0 ? (
              <ul className="space-y-1.5">
                {domain.currentObservations.map((obs, i) => (
                  <li key={i} className="font-data-mono text-xs flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm mt-0.5 text-primary">arrow_right_alt</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-data-mono text-xs text-on-surface-variant/80 italic">
                Live inspection: Site content could not be retrieved / no active storefront observed.
              </p>
            )}
          </div>

          {/* Historical Evidence (TASK 3) */}
          {domain.historicalEvidence.length > 0 && (
            <div className="bg-tertiary-container/20 border-l-4 border-tertiary p-3">
              <h4 className="font-label-caps text-[10px] text-tertiary font-bold mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">history</span>
                HISTORICAL EVIDENCE (THREAT INTELLIGENCE)
              </h4>
              <ul className="space-y-1.5">
                {domain.historicalEvidence.map((ev, i) => (
                  <li key={i} className="font-data-mono text-xs flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm mt-0.5 text-tertiary">history_toggle_off</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contradictory Evidence */}
          {domain.contradictoryEvidence.length > 0 && (
            <div className="bg-error-container/20 border-l-4 border-error p-3">
              <h4 className="font-label-caps text-[10px] text-error font-bold mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">remove_circle</span>
                CONTRADICTORY EVIDENCE
              </h4>
              <ul className="space-y-1.5">
                {domain.contradictoryEvidence.map((ev, i) => (
                  <li key={i} className="font-data-mono text-xs flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm mt-0.5 text-error">cancel</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Evidence Sources (TASK 6) */}
          {domain.evidenceSources.length > 0 && (
            <div className="p-3 border border-on-background/20 bg-surface">
              <h4 className="font-label-caps text-[10px] text-on-surface-variant font-bold mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">link</span>
                EVIDENCE SOURCES
              </h4>
              <ul className="space-y-1">
                {domain.evidenceSources.map((src, i) => {
                  if (typeof src === "object" && src !== null) {
                    const { name, type, url } = src;
                    return (
                      <li key={i} className="font-data-mono text-xs flex items-center gap-1.5">
                        <span className="text-primary font-bold">• {name}</span>
                        {type && <span className="text-[10px] px-1.5 py-0.2 bg-surface-variant border border-on-background/30 text-on-surface-variant">{type}</span>}
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline hover:text-primary-variant text-[11px] truncate max-w-[200px]"
                            title={url}
                          >
                            [Open Source]
                          </a>
                        )}
                      </li>
                    );
                  }
                  return (
                    <li key={i} className="font-data-mono text-xs text-on-surface-variant flex items-center gap-1">
                      <span>•</span>
                      <span>{src}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Recommended Action (TASK 4) */}
        {domain.recommendedAction && (
          <div className="border-t-2 border-dashed border-on-surface-variant/40 pt-3 mt-3">
            <h4 className="font-label-caps text-[10px] text-on-surface-variant font-bold mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">lightbulb</span>
              ADVISORY RECOMMENDATION
            </h4>
            <p className="font-data-mono text-xs font-bold text-on-background">
              {domain.recommendedAction}
            </p>
          </div>
        )}
      </div>

      {/* Human Review Required Notice (TASK 5) */}
      {domain.humanReviewRequired && (
        <div className="mt-5 bg-retro-yellow/30 border-2 border-on-background p-3.5 shadow-brutal-xs -rotate-0.5">
          <div className="flex items-center gap-2 font-headline-sm text-sm font-black text-on-background">
            <span className="material-symbols-outlined text-error text-lg">shield</span>
            HUMAN REVIEW REQUIRED
          </div>
          <p className="font-data-mono text-[11px] mt-1 text-on-background">
            Investigation complete. No external action has been taken. Analyst approval required before initiating consequential actions.
          </p>
        </div>
      )}
    </article>
  );
}
