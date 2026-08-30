"use client";

import React, { useState } from "react";
import { SideNav } from "@/components/SideNav";
import { MobileNav } from "@/components/MobileNav";
import { NewScanModal } from "@/components/NewScanModal";
import { HelpManualModal } from "@/components/HelpManualModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Desktop Sidebar */}
      <SideNav
        onOpenNewScan={() => setIsScanModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Mobile Nav Top & Bottom */}
      <MobileNav
        onOpenNewScan={() => setIsScanModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow md:ml-64 relative min-h-screen pb-20 md:pb-8 flex flex-col">
        {/* Preview Deployment Banner */}
        <div className="bg-surface border-b-2 border-on-background px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-data-mono z-30">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <span className="bg-retro-yellow text-on-background px-2 py-0.5 border border-on-background font-label-caps font-black text-[10px] shadow-brutal-xs">
              PREVIEW DEPLOYMENT
            </span>
            <span className="text-on-surface-variant text-[11px] font-medium">
              UI deployed on Vercel. Live agent investigations require the local TrueForge runtime.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-bold shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-retro-green" />
              <span>UI ACTIVE</span>
            </span>
            <span className="text-on-surface-variant/40">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-retro-yellow" />
              <span>TRUEFORGE: LOCAL RUNTIME</span>
            </span>
          </div>
        </div>

        {children}
      </main>

      {/* Global New Scan Modal */}
      <NewScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />

      {/* Global Help Manual Modal */}
      <HelpManualModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
