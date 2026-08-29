"use client";

import React from "react";

interface BoardGamePathProps {
  currentStep: number; // 0: Discovery, 1: Triage, 2: Web Investigation, 3: Evidence, 4: Verdict
  onStepClick?: (stepIndex: number) => void;
}

export function BoardGamePath({ currentStep, onStepClick }: BoardGamePathProps) {
  const steps = [
    { label: "DISCOVERY", icon: "radar", yOffset: "-translate-y-4" },
    { label: "TRIAGE", icon: "filter_alt", yOffset: "translate-y-8" },
    { label: "PUBLIC RESEARCH", icon: "search", yOffset: "-translate-y-2" },
    { label: "EVIDENCE REVIEW", icon: "policy", yOffset: "translate-y-6" },
    { label: "FINAL ASSESSMENT", icon: "gavel", yOffset: "-translate-y-4" },
  ];

  return (
    <div className="bg-surface-container border-4 border-on-background shadow-brutal p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4 border-b-4 border-on-background pb-2">
        <h3 className="font-headline-md text-headline-md uppercase inline-block">
          Investigation Path
        </h3>
        <span className="font-label-caps text-xs bg-retro-yellow text-on-background px-2 py-1 border-2 border-on-background font-bold rotate-1">
          BOARD GAME TRAIL
        </span>
      </div>

      <div className="relative h-60 mt-4">
        {/* SVG Path for Board Game Trail */}
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1000 200"
        >
          {/* Animated Orange Path */}
          <path
            className="board-path"
            d="M 60 100 C 200 -40, 320 240, 500 100 C 680 -40, 800 240, 940 100"
            fill="none"
            stroke="#ff6b35"
            strokeLinecap="round"
            strokeWidth="12"
          />
          {/* Dotted Guide Trail */}
          <path
            d="M 60 100 C 200 -40, 320 240, 500 100 C 680 -40, 800 240, 940 100"
            fill="none"
            stroke="#1b1c1a"
            strokeDasharray="0 40"
            strokeLinecap="round"
            strokeWidth="16"
          />
        </svg>

        {/* Checkpoint nodes */}
        <div className="absolute inset-0 flex justify-between items-center px-[4%]">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            const isPending = idx > currentStep;

            return (
              <div
                key={step.label}
                className="relative group cursor-pointer"
                onClick={() => onStepClick?.(idx)}
              >
                {/* Active Ping Rings */}
                {isActive && (
                  <div className="absolute -top-1 -left-1 w-[72px] h-[72px] rounded-full border-4 border-primary animate-ping opacity-75 pointer-events-none" />
                )}

                {/* Node Circle */}
                <div
                  className={`w-14 h-14 rounded-full border-4 border-on-background flex items-center justify-center shadow-brutal z-20 relative transition-transform duration-200 ${
                    step.yOffset
                  } ${
                    isCompleted
                      ? "bg-retro-green text-on-background"
                      : isActive
                      ? "bg-retro-yellow text-on-background detective-move scale-110"
                      : "bg-surface-variant text-on-surface-variant/60 opacity-60"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-2xl font-black"
                    style={{
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {isCompleted ? "check" : step.icon}
                  </span>
                </div>

                {/* Label Stamp */}
                <span
                  className={`absolute top-20 left-1/2 -translate-x-1/2 font-label-caps text-[11px] whitespace-nowrap px-2.5 py-1 border-2 border-on-background font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                    isActive
                      ? "bg-primary text-on-primary -rotate-2"
                      : isCompleted
                      ? "bg-surface text-on-background rotate-1"
                      : "bg-surface-variant text-on-surface-variant/70"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
