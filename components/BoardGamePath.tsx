"use client";

import React from "react";
import { InvestigationPhase } from "@/lib/use-investigation";

interface BoardGamePathProps {
  currentStep: number; // 0: Discovery, 1: Triage, 2: Research, 3: Evidence, 4: Assessment, 5: Complete
  currentPhase?: InvestigationPhase;
  failureReason?: string;
  onStepClick?: (stepIndex: number) => void;
}

export function BoardGamePath({
  currentStep,
  currentPhase = "idle",
  failureReason,
  onStepClick,
}: BoardGamePathProps) {
  const steps = [
    { num: "01", label: "DISCOVERY", phaseName: "discovery", icon: "radar", yOffset: "-translate-y-3" },
    { num: "02", label: "TRIAGE", phaseName: "triage", icon: "filter_alt", yOffset: "translate-y-5" },
    { num: "03", label: "RESEARCH", phaseName: "public_research", icon: "search", yOffset: "-translate-y-3" },
    { num: "04", label: "EVIDENCE", phaseName: "evidence_review", icon: "policy", yOffset: "translate-y-5" },
    { num: "05", label: "ASSESSMENT", phaseName: "final_assessment", icon: "gavel", yOffset: "-translate-y-3" },
  ];

  const isFailed = currentPhase === "error";
  const isComplete = currentPhase === "complete" || currentStep >= 5;

  // Dynamic header copy matching exact requirements:
  // STEP 1 OF 5 — DISCOVERY
  // STEP 2 OF 5 — TRIAGE
  // STEP 3 OF 5 — RESEARCH
  // STEP 4 OF 5 — EVIDENCE
  // STEP 5 OF 5 — ASSESSMENT
  // At completion: INVESTIGATION COMPLETE
  // At failure: INVESTIGATION FAILED
  const getHeaderStatusText = () => {
    if (isComplete) return "INVESTIGATION COMPLETE";
    if (isFailed) return "INVESTIGATION FAILED";
    switch (currentStep) {
      case 0:
        return "STEP 1 OF 5 — DISCOVERY";
      case 1:
        return "STEP 2 OF 5 — TRIAGE";
      case 2:
        return "STEP 3 OF 5 — RESEARCH";
      case 3:
        return "STEP 4 OF 5 — EVIDENCE";
      case 4:
        return "STEP 5 OF 5 — ASSESSMENT";
      default:
        return "INVESTIGATION COMPLETE";
    }
  };

  return (
    <div className="bg-surface-container border-4 border-on-background shadow-brutal p-5 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4 border-b-4 border-on-background pb-2.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl font-black">
            route
          </span>
          <h3 className="font-headline-md text-xl sm:text-2xl uppercase inline-block text-on-background">
            Investigation Path
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`font-label-caps text-xs px-3 py-1 border-2 border-on-background font-black shadow-brutal-xs rotate-0.5 ${
              isComplete
                ? "bg-retro-green text-on-background"
                : isFailed
                ? "bg-error text-white"
                : "bg-retro-yellow text-on-background"
            }`}
          >
            {getHeaderStatusText()}
          </span>
        </div>
      </div>

      {/* Failure Reason Alert Banner if Failed */}
      {isFailed && (
        <div className="mb-4 bg-error/10 border-2 border-error p-2.5 flex items-center gap-2 font-data-mono text-xs text-error font-bold">
          <span className="material-symbols-outlined text-base">warning</span>
          <span>{failureReason || "DOMAIN DISCOVERY UNAVAILABLE"}</span>
        </div>
      )}

      {/* Board Game Track Canvas */}
      <div className="relative min-h-[220px] py-4 flex items-center">
        {/* SVG Path for Board Game Trail */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 1000 200"
        >
          {/* Base Background Track Line */}
          <path
            d="M 80 90 C 200 30, 280 150, 400 90 C 520 30, 680 150, 920 90"
            fill="none"
            stroke="#1b1c1a"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Highlight Trail */}
          <path
            className={isComplete || !isFailed ? "board-path" : ""}
            d="M 80 90 C 200 30, 280 150, 400 90 C 520 30, 680 150, 920 90"
            fill="none"
            stroke={isFailed ? "#ba1a1a" : isComplete ? "#00c853" : "#ff6b35"}
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Dotted Step Guides */}
          <path
            d="M 80 90 C 200 30, 280 150, 400 90 C 520 30, 680 150, 920 90"
            fill="none"
            stroke="#ffffff"
            strokeDasharray="2 24"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>

        {/* Checkpoint Nodes */}
        <div className="relative w-full flex justify-between items-center px-2 sm:px-6 z-10">
          {steps.map((step, idx) => {
            const isCompleted = isComplete || (!isFailed && idx < currentStep);
            const isActive = !isComplete && !isFailed && idx === currentStep;
            const isStepFailed = isFailed && idx === Math.min(currentStep, 4);
            const isPending = !isCompleted && !isActive && !isStepFailed;

            return (
              <div
                key={step.label}
                className={`flex flex-col items-center transition-transform duration-200 ${step.yOffset}`}
                onClick={() => onStepClick?.(idx)}
              >
                {/* Node wrapper with relative positioning for glow */}
                <div className="relative flex items-center justify-center">
                  {/* Active Ping Glow */}
                  {isActive && (
                    <div className="absolute inset-0 w-14 h-14 -m-1 rounded-full border-4 border-primary animate-ping opacity-60 pointer-events-none" />
                  )}

                  {/* Node Circle */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-on-background flex items-center justify-center shadow-brutal transition-all duration-200 z-20 ${
                      isCompleted
                        ? "bg-retro-green text-on-background"
                        : isActive
                        ? "bg-retro-yellow text-on-background detective-move scale-110"
                        : isStepFailed
                        ? "bg-error text-white scale-105"
                        : "bg-surface text-on-surface-variant/40 border-on-background/40"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-xl sm:text-2xl font-black"
                      style={{
                        fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      {isCompleted ? "check" : isStepFailed ? "close" : isPending ? "horizontal_rule" : step.icon}
                    </span>
                  </div>

                  {/* Step Number Tag */}
                  <span
                    className={`absolute -top-2 -right-2 text-[9px] font-data-mono font-black px-1 py-0.2 border border-on-background z-30 shadow-brutal-xs ${
                      isActive
                        ? "bg-primary text-on-primary"
                        : isCompleted
                        ? "bg-surface text-on-background"
                        : isStepFailed
                        ? "bg-error text-white"
                        : "bg-surface-variant text-on-surface-variant/60"
                    }`}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Step Label Badge */}
                <div className="mt-2.5 z-20">
                  <span
                    className={`font-label-caps text-[10px] sm:text-xs whitespace-nowrap px-2 py-0.5 sm:px-2.5 sm:py-1 border-2 border-on-background font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] block text-center transition-all ${
                      isActive
                        ? "bg-primary-container text-on-primary-container -rotate-1 font-black"
                        : isCompleted
                        ? "bg-surface text-on-background rotate-0.5"
                        : isStepFailed
                        ? "bg-error text-white -rotate-1 font-black"
                        : "bg-surface-variant/60 text-on-surface-variant/50 border-on-background/30"
                    }`}
                  >
                    {step.label}
                    {isCompleted ? " ✓" : isStepFailed ? " ✕" : isPending ? " —" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
