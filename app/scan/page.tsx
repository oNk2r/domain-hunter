"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BoardGamePath } from "@/components/BoardGamePath";
import { LiveLogFeed } from "@/components/LiveLogFeed";
import { ApprovalGateModal } from "@/components/ApprovalGateModal";
import { useInvestigation, InvestigationPhase } from "@/lib/use-investigation";

export default function InvestigationProgressPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="bg-surface border-4 border-on-background p-8 shadow-brutal text-center">
          <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
          <p className="font-headline-md mt-4">INITIALIZING SCANNER...</p>
        </div>
      </div>
    }>
      <InvestigationProgressContent />
    </Suspense>
  );
}

/**
 * Map the investigation phase to BoardGamePath step index:
 * 0: Discovery, 1: Triage, 2: Web Investigation, 3: Evidence, 4: Verdict
 */
function phaseToStep(phase: InvestigationPhase): number {
  switch (phase) {
    case "idle":
    case "starting":
    case "discovery":
      return 0;
    case "triage":
      return 1;
    case "public_research":
    case "agent_investigation":
      return 2;
    case "evidence_review":
      return 3;
    case "final_assessment":
      return 4;
    case "complete":
      return 5; // All 5 steps completed
    case "error":
    case "cancelled":
      return 4;
    default:
      return 2;
  }
}

function phaseThreatLevel(phase: InvestigationPhase): "LOW" | "MODERATE" | "HIGH" | "CRITICAL" {
  switch (phase) {
    case "idle":
    case "starting":
    case "discovery":
      return "LOW";
    case "triage":
    case "public_research":
      return "MODERATE";
    case "agent_investigation":
    case "evidence_review":
    case "final_assessment":
      return "HIGH";
    case "complete":
    case "error":
    case "cancelled":
      return "MODERATE";
    default:
      return "MODERATE";
  }
}

function phaseLabel(phase: InvestigationPhase): string {
  switch (phase) {
    case "idle":
      return "READY TO SCAN";
    case "starting":
      return "CONNECTING TO TRUEFORGE...";
    case "discovery":
      return "DOMAIN DISCOVERY IN PROGRESS";
    case "triage":
      return "DOMAIN TRIAGE IN PROGRESS";
    case "public_research":
      return "PUBLIC WEB & SANDBOX RESEARCH";
    case "agent_investigation":
      return "AGENT INVESTIGATION IN PROGRESS";
    case "evidence_review":
      return "FORENSIC EVIDENCE REVIEW";
    case "final_assessment":
      return "COMPILING FINAL ASSESSMENT";
    case "complete":
      return "FINDINGS SEALED & VERIFIED";
    case "error":
      return "INVESTIGATION ERROR";
    case "cancelled":
      return "INVESTIGATION CANCELLED";
    default:
      return "ACTIVE INVESTIGATION IN FLIGHT";
  }
}

function InvestigationProgressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand") || "";

  const investigation = useInvestigation();
  const { phase, logs, result, error, start, cancel, startedAt, pendingApproval, approveAction, rejectAction } = investigation;

  // Elapsed timer
  const [seconds, setSeconds] = useState(0);
  const isActive =
    phase === "starting" ||
    phase === "discovery" ||
    phase === "triage" ||
    phase === "public_research" ||
    phase === "agent_investigation" ||
    phase === "evidence_review" ||
    phase === "final_assessment";

  const startedBrandRef = useRef<string | null>(null);

  // Start the investigation when we arrive with a brand param
  useEffect(() => {
    const activeBrand = (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("brand") : null) || brand;
    if (activeBrand && startedBrandRef.current !== activeBrand) {
      startedBrandRef.current = activeBrand;
      start(activeBrand);
    }
  }, [brand, start]);

  // Timer
  useEffect(() => {
    if (!isActive && !startedAt) return;
    const interval = setInterval(() => {
      if (startedAt) {
        setSeconds(Math.floor((Date.now() - startedAt) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, startedAt]);

  // Sync investigation phase to localStorage so SideNav status stays accurate
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (phase === "idle") {
      localStorage.removeItem("investigation_phase");
    } else {
      localStorage.setItem("investigation_phase", phase);
    }
  }, [phase]);

  // When investigation completes, save results to localStorage for /results page and auto-redirect
  useEffect(() => {
    if (phase === "complete" && result) {
      localStorage.setItem("investigation_result", JSON.stringify(result));
      const timer = setTimeout(() => {
        router.push("/results");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [phase, result, router]);


  const handlePauseResume = useCallback(() => {
    if (isActive) {
      cancel();
    }
  }, [isActive, cancel]);

  const handleRetry = useCallback(() => {
    if (brand) {
      startedBrandRef.current = brand;
      start(brand);
    }
  }, [brand, start]);

  const formatElapsed = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const currentStep = phaseToStep(phase);
  const displayBrand = brand ? brand.toUpperCase() : "";
  const isStreaming = isActive;
  const logStrings = logs.map((l) => l.text);

  const domainCount = result?.domains?.length || 0;
  const suspiciousCount = result?.domains?.filter(
    (d) => d.classification === "SUSPICIOUS" || d.classification === "LIKELY_IMPERSONATION"
  ).length || 0;

  return (
    <div className="flex-1 p-4 md:p-8 relative overflow-hidden flex flex-col min-h-screen">
      {/* Header Badge & Stats Widget */}
      <header className="mb-6 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Brand Banner + Engine Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="inline-block bg-retro-yellow border-4 border-on-background py-2 px-6 transform -rotate-1 shadow-brutal">
            <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl uppercase text-on-background flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl font-black">radar</span>
              {displayBrand ? `HUNTING FOR: [${displayBrand}]` : "TRY TO SCAN"}
            </h2>
          </div>
          <div className="bg-surface border-2 border-on-background px-3 py-1.5 shadow-brutal-xs font-data-mono text-[11px] flex items-center gap-2 rotate-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-retro-green animate-pulse" />
            <span className="font-bold text-primary">LIVE AGENT</span>
            <span className="text-on-surface-variant/60">•</span>
            <span className="font-bold">TrueForge</span>
            <span className="text-on-surface-variant/60">•</span>
            <span className="font-bold">GPT-OSS-120B</span>
            <span className="text-on-surface-variant/60">•</span>
            <span className="text-retro-green font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              Evidence-backed
            </span>
          </div>
        </div>

        {/* Telemetry Stats Box */}
        <div className="bg-surface-container border-4 border-on-background p-3 shadow-brutal transform rotate-1">
          <div className="font-data-mono text-xs flex flex-col gap-1.5">
            <div className="flex justify-between gap-6 border-b-2 border-on-surface-variant/40 pb-1">
              <span className="text-on-surface-variant font-bold">ELAPSED:</span>
              <span className="font-bold text-primary font-data-mono text-sm">
                {formatElapsed(seconds)}
              </span>
            </div>
            <div className="flex justify-between gap-6 items-center">
              <span className="text-on-surface-variant font-bold">STATUS:</span>
              <span className={`px-2 py-0.5 font-black border border-on-background text-xs ${
                phase === "error" ? "bg-error text-white" :
                phase === "complete" ? "bg-retro-green text-on-background" :
                phase === "cancelled" ? "bg-surface-variant text-on-background" :
                "bg-retro-yellow text-on-background"
              }`}>
                {phaseThreatLevel(phase)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Brand Search Bar when no brand is specified yet */}
      {!displayBrand && phase === "idle" && (
        <div className="mb-6 bg-surface border-4 border-on-background p-4 sm:p-5 shadow-brutal flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-in fade-in">
          <div className="flex-grow flex items-center bg-white border-2 border-on-background px-3 py-2.5">
            <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
            <input
              type="text"
              placeholder="ENTER BRAND NAME (E.G. ACME CORP, STRIPE)..."
              className="w-full bg-transparent border-none outline-none font-data-mono text-sm uppercase placeholder-on-surface-variant"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  window.location.href = `/scan?brand=${encodeURIComponent(e.currentTarget.value.trim())}`;
                }
              }}
            />
          </div>
          <button
            onClick={(e) => {
              const input = e.currentTarget.parentElement?.querySelector("input");
              if (input && input.value.trim()) {
                window.location.href = `/scan?brand=${encodeURIComponent(input.value.trim())}`;
              }
            }}
            className="bg-primary-container text-on-primary-container font-headline-md text-sm uppercase px-6 py-3 border-2 border-on-background shadow-brutal-xs btn-brutal font-bold whitespace-nowrap flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">radar</span>
            START SCAN
          </button>
        </div>
      )}

      {/* Completion Banner with direct button */}
      {phase === "complete" && (
        <div className="mb-6 bg-retro-green text-on-background border-4 border-on-background p-4 shadow-brutal flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl font-black">verified</span>
            <div>
              <h3 className="font-headline-md text-xl font-black uppercase">INVESTIGATION COMPLETE!</h3>
              <p className="font-data-mono text-xs">
                Candidate domains identified and sealed with cryptographic integrity. Redirecting to dossier...
              </p>
            </div>
          </div>
          <Link
            href="/results"
            className="px-6 py-3 bg-on-background text-surface font-headline-md text-sm border-2 border-on-background shadow-brutal-sm btn-brutal whitespace-nowrap font-black flex items-center gap-2"
          >
            <span>VIEW INVESTIGATION RESULTS</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* Error Banner with retry */}
      {phase === "error" && (
        error?.includes("TRUEFORGE RUNTIME UNAVAILABLE") || error?.includes("UNAVAILABLE") ? (
          <div className="mb-6 bg-surface border-4 border-on-background p-6 shadow-brutal flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-in fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-retro-yellow border-2 border-on-background flex items-center justify-center shadow-brutal-xs shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-2xl text-on-background font-black">dns</span>
              </div>
              <div>
                <div className="inline-block bg-retro-yellow text-on-background px-2.5 py-0.5 border border-on-background font-label-caps font-black text-[10px] mb-1.5 shadow-brutal-xs">
                  PREVIEW DEPLOYMENT
                </div>
                <h3 className="font-headline-md text-xl sm:text-2xl font-black uppercase text-on-background">
                  TRUEFORGE RUNTIME UNAVAILABLE
                </h3>
                <p className="font-data-mono text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed max-w-xl">
                  This preview deployment does not have access to the local TrueForge runtime.
                  <br />
                  Run Domain Hunter locally for live investigations.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="https://github.com/oNk2r/domain-hunter#running-locally"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-primary-container text-on-primary-container font-headline-md text-sm border-2 border-on-background shadow-brutal-sm btn-brutal whitespace-nowrap font-black flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">terminal</span>
                <span>RUN LOCALLY</span>
              </Link>
              <button
                onClick={handleRetry}
                className="px-4 py-3 bg-surface text-on-background font-headline-md text-sm border-2 border-on-background shadow-brutal-xs btn-brutal whitespace-nowrap font-bold flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">restart_alt</span>
                <span>RETRY</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-error text-white border-4 border-on-background p-4 shadow-brutal flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl font-black">error</span>
              <div>
                <h3 className="font-headline-md text-xl font-black uppercase">
                  {error?.includes("INVESTIGATION FAILED") ? "INVESTIGATION FAILED" : "SCAN INTERRUPTED"}
                </h3>
                <p className="font-data-mono text-xs opacity-90">{error || "Agent connection failed. Please retry."}</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-surface text-on-background font-headline-md text-sm border-2 border-on-background shadow-brutal-sm btn-brutal whitespace-nowrap font-black flex items-center gap-2"
            >
              <span className="material-symbols-outlined">restart_alt</span>
              <span>RETRY INVESTIGATION</span>
            </button>
          </div>
        )
      )}

      {/* Main Investigation Canvas */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        {/* Left Column: Board Game Trail (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <BoardGamePath
            currentStep={currentStep}
            onStepClick={() => {}} // Read-only during real investigation
          />

          {/* Quick Jump / Next Steps banner */}
          <div className="bg-primary-container text-on-primary-container border-4 border-on-background p-4 shadow-brutal flex flex-col sm:flex-row justify-between items-center gap-4 -rotate-0.5">
            <div>
              <div className="font-headline-md text-headline-md uppercase">
                {phaseLabel(phase)}
              </div>
              <p className="font-data-mono text-xs opacity-90">
                {phase === "complete"
                  ? `${domainCount} domains analyzed. ${suspiciousCount} flagged for review.`
                  : phase === "error"
                  ? "Investigation encountered an error. You can retry."
                  : phase === "cancelled"
                  ? "Investigation was cancelled by operator."
                  : "Real-time TrueForge agent investigation in progress..."}
              </p>
            </div>
            <div className="flex gap-2">
              {phase === "complete" && (
                <>
                  <Link
                    href="/results"
                    className="bg-surface text-on-background border-2 border-on-background px-4 py-2 font-headline-sm text-sm uppercase btn-brutal flex items-center gap-1"
                  >
                    VIEW RESULTS QUEUE →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Terminal Feed (4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <LiveLogFeed logs={logStrings} rawEvents={investigation.events} isStreaming={isStreaming} currentPhase={phase} />
        </div>

        {/* Bottom Contextual Cards (12 cols) */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          {/* Card 1: Target Brand */}
          <div className="bg-surface border-4 border-on-background p-4 shadow-brutal transform -rotate-1 relative overflow-hidden">
            <div className="absolute -top-3 -right-6 w-20 h-8 bg-surface-variant border-2 border-on-background rotate-45 opacity-80" />
            <h4 className="font-label-caps text-xs text-on-surface-variant mb-1 font-bold">
              TARGET BRAND
            </h4>
            <p className="font-data-mono text-sm text-tertiary font-bold truncate">
              {displayBrand || "NO TARGET SELECTED"}
            </p>
            <div className="mt-2 text-[11px] font-data-mono text-on-surface-variant">
              SESSION: {investigation.sessionId?.slice(0, 16) || "connecting..."}
            </div>
          </div>

          {/* Card 2: Current Task */}
          <div className="bg-surface border-4 border-on-background p-4 shadow-brutal transform rotate-1">
            <h4 className="font-label-caps text-xs text-on-surface-variant mb-1 font-bold">
              CURRENT AGENT MISSION
            </h4>
            <p className="font-body-lg text-sm font-bold flex items-center gap-2 text-on-background">
              <span className="material-symbols-outlined text-primary text-xl">
                {isActive ? "sync" : phase === "complete" ? "check_circle" : "search"}
              </span>
              {phaseLabel(phase)}
            </p>
            <div className="mt-2 text-[11px] font-data-mono text-on-surface-variant">
              Events received: {investigation.events.length}
            </div>
          </div>

          {/* Card 3: Manual Override */}
          <div className="bg-secondary-container border-4 border-on-background p-4 shadow-brutal flex justify-between items-center transform -rotate-1">
            <div>
              <h4 className="font-label-caps text-xs text-on-secondary-container mb-1 font-bold">
                HUMAN CONTROL OVERRIDE
              </h4>
              <p className="font-data-mono text-xs text-on-secondary-container/80">
                {!isActive ? "Investigation is STOPPED" : "Cancel automated scan"}
              </p>
            </div>
            <button
              onClick={handlePauseResume}
              disabled={!isActive}
              className={`border-4 border-on-background p-3 btn-brutal h-14 w-14 flex items-center justify-center font-bold text-white ${
                isActive ? "bg-error text-white" : "bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed"
              }`}
              title={isActive ? "Cancel Scan" : "Investigation stopped"}
            >
              <span className="material-symbols-outlined text-2xl font-black">
                {isActive ? "pan_tool" : "check"}
              </span>
            </button>
          </div>
        </div>
      </div>
      {/* ⛔ Hard-blocking Human Approval Gate — fires on tool.approval_required */}
      <ApprovalGateModal
        request={pendingApproval}
        onApprove={approveAction}
        onReject={rejectAction}
      />
    </div>
  );
}
