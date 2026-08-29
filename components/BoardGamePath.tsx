"use client";

import React from "react";

interface BoardGamePathProps {
  currentStep: number; // 0: Discovery, 1: Triage, 2: Web Investigation, 3: Evidence, 4: Verdict, 5: Complete
  onStepClick?: (stepIndex: number) => void;
}

export function BoardGamePath({ currentStep, onStepClick }: BoardGamePathProps) {
  const steps = [
    { num: "01", label: "DISCOVERY", icon: "radar", yOffset: "-translate-y-3" },
    { num: "02", label: "TRIAGE", icon: "filter_alt", yOffset: "translate-y-5" },
    { num: "03", label: "RESEARCH", icon: "search", yOffset: "-translate-y-3" },
    { num: "04", label: "EVIDENCE", icon: "policy", yOffset: "translate-y-5" },
    { num: "05", label: "ASSESSMENT", icon: "gavel", yOffset: "-translate-y-3" },
  ];

  return (
    <div className="bg-surface-container border-4 border-on-background shadow-brutal p-5 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b-4 border-on-background pb-2.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl font-black">
            route
          </span>
          <h3 className="font-headline-md text-xl sm:text-2xl uppercase inline-block text-on-background">
            Investigation Path
          </h3>
        </div>
        <span className="font-label-caps text-xs bg-retro-yellow text-on-background px-2.5 py-1 border-2 border-on-background font-black shadow-brutal-xs rotate-1">
          {currentStep >= 5
            ? "ALL STEPS COMPLETED"
            : `STEP ${Math.min(currentStep + 1, 5)} OF 5`}
        </span>
      </div>

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
          {/* Animated Highlight Trail */}
          <path
            className="board-path"
            d="M 80 90 C 200 30, 280 150, 400 90 C 520 30, 680 150, 920 90"
            fill="none"
            stroke="#ff6b35"
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
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <div
                key={step.label}
                className={`flex flex-col items-center cursor-pointer transition-transform duration-200 ${step.yOffset}`}
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
                        : "bg-surface text-on-surface-variant/50 border-on-background/60"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-xl sm:text-2xl font-black"
                      style={{
                        fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      {isCompleted ? "check" : step.icon}
                    </span>
                  </div>

                  {/* Step Number Tag */}
                  <span
                    className={`absolute -top-2 -right-2 text-[9px] font-data-mono font-black px-1 py-0.2 border border-on-background z-30 shadow-brutal-xs ${
                      isActive
                        ? "bg-primary text-on-primary"
                        : isCompleted
                        ? "bg-surface text-on-background"
                        : "bg-surface-variant text-on-surface-variant"
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
                        : "bg-surface-variant/80 text-on-surface-variant/70 border-on-background/40"
                    }`}
                  >
                    {step.label}
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

