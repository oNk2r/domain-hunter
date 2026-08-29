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

  // Dynamically determine agent status based on route
  useEffect(() => {
    if (pathname === "/scan") {
      setStatus("INVESTIGATING");
    } else if (pathname === "/results") {
      setStatus("COMPLETED");
    } else {
      setStatus("IDLE");
    }
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
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container border-r-border-width-thick border-on-background shadow-[6px_0px_0px_0px_rgba(0,0,0,1)] p-4 z-50 select-none justify-between overflow-hidden">
      {/* Top Container: Brand + Avatar + Navigation */}
      <div className="flex flex-col gap-4">
        {/* Brand Header */}
        <div className="text-center pb-3 border-b-2 border-on-background">
          <Link href="/" className="inline-block group">
            <h1 className="font-headline-sm text-sm font-black tracking-wider text-primary uppercase group-hover:text-primary-container transition-colors">
              DOMAIN HUNTER
            </h1>
          </Link>

          {/* Investigator Profile */}
          <div className="mt-2.5 flex items-center justify-center gap-3 bg-surface border-2 border-on-background p-2 shadow-brutal-xs -rotate-0.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full border-2 border-on-background bg-secondary text-white flex items-center justify-center shadow-brutal-xs overflow-hidden">
                <span className="material-symbols-outlined text-xl">detective</span>
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${currentStatus.dot} border border-on-background animate-pulse`} />
            </div>
            <div className="text-left">
              <div className="font-headline-md text-xs font-bold leading-tight">AGENT_007</div>
              <div className={`font-label-caps text-[10px] font-bold tracking-wider flex items-center gap-1 ${currentStatus.text}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
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
      <div className="flex flex-col gap-3 pt-2">
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
