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
