"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  onOpenNewScan?: () => void;
  onOpenHelp?: () => void;
}

export function MobileNav({ onOpenNewScan, onOpenHelp }: MobileNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "DASHBOARD", href: "/", icon: "dashboard" },
    { label: "LIVE SCAN", href: "/scan", icon: "radar" },
    { label: "RESULTS", href: "/results", icon: "assignment" },
  ];

  return (
    <>
      {/* Top Mobile Bar */}
      <header className="md:hidden flex justify-between items-center w-full px-4 py-3 bg-surface border-b-border-width-thick border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] top-0 sticky z-40">
        <Link href="/" className="font-headline-sm text-sm font-black text-primary border-2 border-on-background px-3 py-1 bg-secondary-container shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-1">
          DOMAIN HUNTER
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHelp}
            className="bg-surface text-on-background border-2 border-on-background p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
            title="Field Manual"
          >
            <span className="material-symbols-outlined text-lg">help</span>
          </button>
          <button
            onClick={onOpenNewScan}
            className="bg-primary text-on-primary border-2 border-on-background p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
            title="New Scan"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
          <span className="w-2.5 h-2.5 rounded-full bg-retro-green border border-on-background animate-pulse" />
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t-border-width-thick border-on-background p-2 z-50 flex justify-around items-center shadow-[0px_-4px_0px_0px_rgba(0,0,0,1)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-sm border-2 transition-all ${
                isActive
                  ? "bg-primary-container text-on-primary-container border-on-background shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  : "border-transparent text-on-surface-variant hover:bg-surface-variant"
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
              <span className="font-label-caps text-[9px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
