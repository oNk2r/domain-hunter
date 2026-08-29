"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SideNavProps {
  onOpenNewScan?: () => void;
  onOpenHelp?: () => void;
}

export function SideNav({ onOpenNewScan, onOpenHelp }: SideNavProps) {
  const pathname = usePathname();
  const [status, setStatus] = useState<"IDLE" | "INVESTIGATING" | "COMPLETED" | "FAILED">("IDLE");

  useEffect(() => {
    function computeStatus() {
      // Primary signal: phase written to localStorage by the scan page
      if (typeof window !== "undefined") {
        const phase = localStorage.getItem("investigation_phase");
        if (phase === "complete") { setStatus("COMPLETED"); return; }
        if (phase === "error") { setStatus("FAILED"); return; }
        if (
          phase === "starting" ||
          phase === "discovery" ||
          phase === "triage" ||
          phase === "public_research" ||
          phase === "agent_investigation" ||
          phase === "evidence_review" ||
          phase === "final_assessment"
        ) { setStatus("INVESTIGATING"); return; }
      }
      // Fallback: infer from route alone when no phase signal is present
      if (pathname === "/results") { setStatus("COMPLETED"); return; }
      setStatus("IDLE");
    }

    computeStatus();
    // Poll every 2s to catch phase changes written by the scan page
    const interval = setInterval(computeStatus, 2000);
    return () => clearInterval(interval);
  }, [pathname]);


  const navItems = [
    { label: "DASHBOARD", href: "/", icon: "dashboard" },
    { label: "LIVE SCAN", href: "/scan", icon: "radar" },
    { label: "RESULTS QUEUE", href: "/results", icon: "assignment" },
  ];

  const getStatusColor = () => {
    switch (status) {
      case "INVESTIGATING":
        return { dot: "bg-retro-yellow", text: "text-amber-700", label: "INVESTIGATING" };
      case "COMPLETED":
        return { dot: "bg-retro-green", text: "text-emerald-700", label: "COMPLETED" };
      case "FAILED":
        return { dot: "bg-error", text: "text-error", label: "FAILED" };
      default:
        return { dot: "bg-retro-green", text: "text-emerald-700", label: "ONLINE" };
    }
  };

  const currentStatus = getStatusColor();

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container border-r-border-width-thick border-on-background shadow-[6px_0px_0px_0px_rgba(0,0,0,1)] px-4 pt-4 pb-3 z-50 select-none justify-between overflow-y-auto">
      <div className="flex flex-col gap-3">
        {/* Brand Header */}
        <div className="text-center pb-3 border-b-2 border-on-background">
          <Link href="/" className="inline-block group">
            <h1 className="font-headline-sm text-sm font-black tracking-wider text-primary uppercase group-hover:text-primary-container transition-colors">
              DOMAIN HUNTER
            </h1>
          </Link>

          {/* Investigator Profile */}
          <div className="mt-3 flex items-center gap-3.5 bg-surface border-2 border-on-background p-2.5 shadow-brutal-sm -rotate-0.5">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-lg border-2 border-on-background bg-white p-1 flex items-center justify-center shadow-brutal-xs overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/rootless.png"
                  alt="Rootless Agent"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${currentStatus.dot} border-2 border-on-background animate-pulse`} />
            </div>
            <div className="text-left overflow-hidden">
              <div className="font-headline-md text-sm font-black leading-tight text-on-background truncate">
                Rootless Agent
              </div>
              <div className={`font-label-caps text-[10px] font-bold tracking-wider flex items-center gap-1.5 mt-1 ${currentStatus.text}`}>
                <span className={`inline-block w-2 h-2 rounded-full ${currentStatus.dot}`} />
                <span>{currentStatus.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav aria-label="Main Navigation">
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`p-2.5 flex items-center gap-3 font-label-caps text-xs tracking-wider transition-all duration-100 border-2 ${
                      isActive
                        ? "bg-primary-container text-on-primary-container border-on-background shadow-brutal-sm -rotate-0.5 font-bold"
                        : "border-transparent text-on-surface-variant hover:bg-surface-variant hover:border-on-background hover:shadow-brutal-xs"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{
                        fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Container: Live Agent Card + New Scan + Help Manual */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Compact Live Agent Status Card */}
        <div className="p-2.5 bg-surface border-2 border-on-background shadow-brutal-xs font-data-mono text-[10px] text-left">
          <div className="flex items-center justify-between font-bold text-primary mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-retro-green animate-pulse" />
              <span>LIVE AGENT</span>
            </div>
            <span className="text-[9px] bg-secondary-container px-1 py-0.2 border border-on-background text-on-secondary-container">
              v1.0
            </span>
          </div>
          <div className="text-on-surface-variant flex justify-between text-[10px] leading-tight">
            <span>ENGINE:</span> <strong className="text-on-background">TrueForge</strong>
          </div>
          <div className="text-on-surface-variant flex justify-between text-[10px] leading-tight mt-0.5">
            <span>MODEL:</span> <strong className="text-on-background">GPT-OSS-120B</strong>
          </div>
          <div className="mt-1.5 pt-1 border-t border-dashed border-on-surface-variant/30 text-[9px] text-emerald-800 font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-emerald-700">verified</span>
            <span>Evidence-backed investigation</span>
          </div>
        </div>

        {/* Primary CTA: + NEW SCAN */}
        <button
          onClick={onOpenNewScan}
          className="w-full bg-primary-container text-on-primary-container py-2.5 px-3 font-headline-md text-sm uppercase border-border-width-thick border-on-background shadow-brutal btn-brutal flex items-center justify-center gap-2 font-bold tracking-wide active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>NEW SCAN</span>
        </button>

        {/* Help Manual Footer */}
        <div className="border-t-2 border-on-background pt-2 flex items-center justify-between text-on-surface-variant font-label-caps text-[11px]">
          <button
            onClick={onOpenHelp}
            className="p-1 flex items-center gap-1.5 hover:text-primary font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-base">help</span>
            <span>HELP MANUAL</span>
          </button>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.clear();
                window.location.href = "/";
              }
            }}
            className="p-1 text-on-surface-variant/60 hover:text-error transition-colors"
            title="Reset Session"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
