"use client";

import React, { useState, useEffect } from "react";

interface HelpManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ManualTab = "how-it-works" | "threat-guide" | "faq";

export function HelpManualModal({ isOpen, onClose }: HelpManualModalProps) {
  const [activeTab, setActiveTab] = useState<ManualTab>("how-it-works");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs: { id: ManualTab; label: string; icon: string }[] = [
    { id: "how-it-works", label: "HOW IT WORKS", icon: "help" },
    { id: "threat-guide", label: "STATUS GUIDE", icon: "shield" },
    { id: "faq", label: "FAQS & TIPS", icon: "lightbulb" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface border-border-width-thick border-on-background shadow-brutal-lg max-w-2xl w-full max-h-[90vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="p-4 bg-primary-container text-on-primary-container border-b-4 border-on-background flex justify-between items-center select-none">
          <div className="flex items-center gap-2.5 font-headline-md text-base sm:text-lg uppercase tracking-wider">
            <span className="material-symbols-outlined text-2xl">menu_book</span>
            <span>QUICK GUIDE // HOW TO USE</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-surface text-on-background border-2 border-on-background shadow-brutal-xs flex items-center justify-center font-bold text-base hover:bg-error hover:text-white transition-colors active:translate-x-0.5 active:translate-y-0.5"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-on-background bg-surface-container overflow-x-auto p-2 gap-2 select-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 font-label-caps text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all border-2 ${
                  isActive
                    ? "bg-surface text-on-background border-on-background shadow-brutal-xs font-black -rotate-0.5"
                    : "border-transparent text-on-surface-variant hover:bg-surface/50 hover:border-on-background/30"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto font-body-lg text-sm leading-relaxed flex-grow space-y-4">
          {/* TAB 1: HOW IT WORKS */}
          {activeTab === "how-it-works" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-primary-container/20 border-2 border-primary p-3.5 shadow-brutal-xs">
                <p className="font-bold text-on-background text-sm">
                  Domain Hunter finds fake websites and spoofed domains pretending to be your brand. Here is the 3-step workflow:
                </p>
              </div>

              {/* Step 1 */}
              <div className="border-2 border-on-background p-4 bg-surface shadow-brutal-xs flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black shrink-0 text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-headline-sm text-sm uppercase font-bold text-on-background mb-1">
                    Enter Brand Name
                  </h4>
                  <p className="text-xs text-on-surface-variant font-data-mono leading-relaxed">
                    Type your company or brand name (e.g., <em>ACME Corp</em>, <em>Stripe</em>, or <em>PayPal</em>) into the search bar on the dashboard and click <strong>Start Investigation</strong>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border-2 border-on-background p-4 bg-surface shadow-brutal-xs flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-black shrink-0 text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-headline-sm text-sm uppercase font-bold text-on-background mb-1">
                    Watch the AI Agent Investigate
                  </h4>
                  <p className="text-xs text-on-surface-variant font-data-mono leading-relaxed">
                    The agent discovers suspicious domains, probes DNS & live websites, checks security logs, and builds an evidence dossier in real time.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-2 border-on-background p-4 bg-surface shadow-brutal-xs flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-full bg-retro-green text-on-background flex items-center justify-center font-black shrink-0 text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-headline-sm text-sm uppercase font-bold text-on-background mb-1">
                    Review Findings & Take Action
                  </h4>
                  <p className="text-xs text-on-surface-variant font-data-mono leading-relaxed">
                    Review classified results, inspect the evidence dossier, and generate one-click legal takedown notices to send to domain registrars.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STATUS GUIDE */}
          {activeTab === "threat-guide" && (
            <div className="space-y-3.5 animate-in fade-in">
              <p className="text-xs text-on-surface-variant font-data-mono mb-2">
                Every discovered domain is evaluated and assigned one of these simple threat badges:
              </p>

              {/* Badges */}
              <div className="border-2 border-on-background p-3.5 bg-red-50 flex items-start gap-3">
                <span className="bg-error text-white font-bold text-xs px-2.5 py-1 border border-on-background whitespace-nowrap shrink-0">
                  LIKELY IMPERSONATION
                </span>
                <p className="text-xs text-on-surface-variant font-data-mono">
                  <strong>High Risk:</strong> Active website found mimicking your logo, login, or products to scam users. Immediate takedown recommended.
                </p>
              </div>

              <div className="border-2 border-on-background p-3.5 bg-amber-50 flex items-start gap-3">
                <span className="bg-retro-yellow text-on-background font-bold text-xs px-2.5 py-1 border border-on-background whitespace-nowrap shrink-0">
                  SUSPICIOUS
                </span>
                <p className="text-xs text-on-surface-variant font-data-mono">
                  <strong>Medium Risk:</strong> Looks like a typosquatting domain or newly registered name with high resemblance. Keep an eye on it.
                </p>
              </div>

              <div className="border-2 border-on-background p-3.5 bg-blue-50 flex items-start gap-3">
                <span className="bg-tertiary-container text-on-tertiary-container font-bold text-xs px-2.5 py-1 border border-on-background whitespace-nowrap shrink-0">
                  PARKED / INACTIVE
                </span>
                <p className="text-xs text-on-surface-variant font-data-mono">
                  <strong>Low Risk:</strong> Domain exists but the site is offline, returns an error, or is parked with ads. Not currently harming users.
                </p>
              </div>

              <div className="border-2 border-on-background p-3.5 bg-emerald-50 flex items-start gap-3">
                <span className="bg-retro-green text-on-background font-bold text-xs px-2.5 py-1 border border-on-background whitespace-nowrap shrink-0">
                  LEGITIMATE
                </span>
                <p className="text-xs text-on-surface-variant font-data-mono">
                  <strong>Safe:</strong> Verified official brand website, official sub-domain, or authorized corporate partner.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FAQS & TIPS */}
          {activeTab === "faq" && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="border-2 border-on-background p-3.5 bg-surface shadow-brutal-xs">
                <h4 className="font-headline-sm text-sm font-bold text-primary mb-1">
                  ❓ Does the AI execute takedowns automatically?
                </h4>
                <p className="text-xs text-on-surface-variant font-data-mono">
                  <strong>No.</strong> Domain Hunter uses a strict <em>Human-in-the-Loop</em> safety model. The agent only collects intelligence; you have the final authority to review and approve actions.
                </p>
              </div>

              <div className="border-2 border-on-background p-3.5 bg-surface shadow-brutal-xs">
                <h4 className="font-headline-sm text-sm font-bold text-primary mb-1">
                  ❓ How do I send a takedown notice?
                </h4>
                <p className="text-xs text-on-surface-variant font-data-mono">
                  On the results page, click <strong>TAKEDOWN</strong> on any suspicious domain. A pre-filled abuse and DMCA notice will be generated ready to copy and send to the domain registrar.
                </p>
              </div>

              <div className="border-2 border-on-background p-3.5 bg-surface shadow-brutal-xs">
                <h4 className="font-headline-sm text-sm font-bold text-primary mb-1">
                  ❓ How do I reset or start a fresh investigation?
                </h4>
                <p className="text-xs text-on-surface-variant font-data-mono">
                  Click the <strong>+ NEW SCAN</strong> button in the sidebar anytime, or click the reset icon in the sidebar footer to clear past session data.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-surface border-t-2 border-on-background flex justify-between items-center select-none">
          <div className="text-xs text-on-surface-variant font-data-mono">
            Press <kbd className="px-1.5 py-0.5 bg-surface-variant border border-on-background text-[11px] font-bold">Esc</kbd> anytime to close
          </div>
          <button
            onClick={onClose}
            className="bg-primary-container text-on-primary-container px-4 py-1.5 font-headline-sm text-xs uppercase border-2 border-on-background shadow-brutal-xs font-bold active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            GOT IT!
          </button>
        </div>
      </div>
    </div>
  );
}
