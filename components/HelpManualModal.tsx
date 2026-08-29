"use client";

import React, { useState, useEffect } from "react";

interface HelpManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ManualTab = "overview" | "matrix" | "playbook" | "forensics" | "shortcuts";

export function HelpManualModal({ isOpen, onClose }: HelpManualModalProps) {
  const [activeTab, setActiveTab] = useState<ManualTab>("overview");

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
    { id: "overview", label: "MISSION BRIEF", icon: "terminal" },
    { id: "matrix", label: "THREAT MATRIX", icon: "shield" },
    { id: "forensics", label: "FORENSIC RULES", icon: "biotech" },
    { id: "playbook", label: "DEFENSE PLAYBOOK", icon: "gavel" },
    { id: "shortcuts", label: "TACTICAL KEYS", icon: "keyboard" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface border-border-width-thick border-on-background shadow-brutal-lg max-w-3xl w-full max-h-[90vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="p-3.5 bg-primary-container text-on-primary-container border-b-4 border-on-background flex justify-between items-center select-none">
          <div className="flex items-center gap-2.5 font-headline-md text-sm md:text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-2xl animate-pulse">menu_book</span>
            <span>FIELD MANUAL // AGENT_007 PROTOCOL</span>
            <span className="hidden sm:inline-block text-[10px] bg-surface text-on-background border border-on-background px-2 py-0.5 font-data-mono font-bold">
              UNCLASSIFIED OSINT
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-surface text-on-background border-2 border-on-background shadow-brutal-xs flex items-center justify-center font-bold text-base hover:bg-error hover:text-white transition-colors active:translate-x-0.5 active:translate-y-0.5"
            title="Close Manual (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-on-background bg-surface-container overflow-x-auto p-1.5 gap-1 select-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 font-label-caps text-xs flex items-center gap-1.5 whitespace-nowrap transition-all border-2 ${
                  isActive
                    ? "bg-surface text-on-background border-on-background shadow-brutal-xs font-bold -rotate-0.5"
                    : "border-transparent text-on-surface-variant hover:bg-surface/50 hover:border-on-background/30"
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Container */}
        <div className="p-5 md:p-6 overflow-y-auto font-data-mono text-sm leading-relaxed flex-grow space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-surface-container p-4 border-2 border-on-background shadow-brutal-xs -rotate-0.5">
                <h3 className="font-headline-sm text-sm uppercase text-primary font-bold flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-lg">radar</span>
                  Autonomous Brand Impersonation Hunting
                </h3>
                <p className="text-xs md:text-sm text-on-surface-variant">
                  <strong>Domain Hunter</strong> is an autonomous cybersecurity investigation agent powered by <strong>TrueForge</strong> and <strong>GPT-OSS-120B</strong>. It proactively sweeps global public infrastructure, discovery engines, and threat lists to detect typosquatting, credential harvesting clones, and fake ecommerce storefronts targeting your brand.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-headline-sm text-xs uppercase font-bold text-on-background tracking-wider">
                  ⚡ 4-Stage Autonomous Pipeline:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border-2 border-on-background p-3 bg-surface shadow-brutal-xs">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">1</span>
                      DOMAIN DISCOVERY
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Queries Exa MCP & public search engines with targeted Boolean queries to unearth candidate domains.
                    </p>
                  </div>

                  <div className="border-2 border-on-background p-3 bg-surface shadow-brutal-xs">
                    <div className="flex items-center gap-2 text-secondary font-bold text-xs mb-1">
                      <span className="w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center text-[10px]">2</span>
                      LIVE FORENSIC TRIAGE
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Initiates live DNS resolution, HTTP status probes, and sandbox DOM crawling to capture current operational status.
                    </p>
                  </div>

                  <div className="border-2 border-on-background p-3 bg-surface shadow-brutal-xs">
                    <div className="flex items-center gap-2 text-tertiary font-bold text-xs mb-1">
                      <span className="w-5 h-5 rounded-full bg-tertiary text-white flex items-center justify-center text-[10px]">3</span>
                      EVIDENCE CROSS-CHECK
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Cross-references candidate signatures against PhishHunt, Bitdefender, MalwareTips, and Certificate Transparency logs.
                    </p>
                  </div>

                  <div className="border-2 border-on-background p-3 bg-emerald-700 font-bold text-xs mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">4</span>
                    FINAL ASSESSMENT
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THREAT MATRIX */}
          {activeTab === "matrix" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-b-2 border-on-background pb-2">
                <h3 className="font-headline-sm text-sm uppercase font-bold text-on-background">
                  Classification Taxonomy
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Standardized categories assigned based on empirical telemetry:
                </p>
              </div>

              <div className="space-y-3">
                <div className="border-2 border-on-background p-3 bg-red-50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="bg-error text-white font-bold text-[10px] px-2 py-0.5 border border-on-background">
                      LIKELY_IMPERSONATION
                    </span>
                    <span className="text-[11px] font-bold text-error">CRITICAL THREAT</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Domain is <strong>currently resolving and active</strong>, hosting stolen brand assets, phishing forms, or counterfeit ecommerce portals. Historical threat intel corroborates malicious intent.
                  </p>
                </div>

                <div className="border-2 border-on-background p-3 bg-amber-50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="bg-retro-yellow text-on-background font-bold text-[10px] px-2 py-0.5 border border-on-background">
                      PARKED_OR_INACTIVE
                    </span>
                    <span className="text-[11px] font-bold text-amber-700">DORMANT / PAST INTEL</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Domain returns 404, does not resolve (NXDOMAIN), is deployment-disabled, or is parked with registrar placeholders. Even if historical phishing reports exist, it is <strong>not currently active</strong>.
                  </p>
                </div>

                <div className="border-2 border-on-background p-3 bg-orange-50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="bg-secondary-container text-on-secondary-container font-bold text-[10px] px-2 py-0.5 border border-on-background">
                      SUSPICIOUS
                    </span>
                    <span className="text-[11px] font-bold text-secondary">ELEVATED RISK</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Domain shows suspicious typosquatting patterns, newly registered WHOIS data, or partial brand keyword collisions without definitive phishing payloads.
                  </p>
                </div>

                <div className="border-2 border-on-background p-3 bg-emerald-50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="bg-retro-green text-on-background font-bold text-[10px] px-2 py-0.5 border border-on-background">
                      LEGITIMATE
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800">SAFE ASSET</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Domain is verified as an authorized corporate asset, regional affiliate, or official brand partner.
                  </p>
                </div>

                <div className="border-2 border-on-background p-3 bg-surface-container">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="bg-surface text-on-background font-bold text-[10px] px-2 py-0.5 border border-on-background">
                      INCONCLUSIVE
                    </span>
                    <span className="text-[11px] font-bold text-on-surface-variant">UNVERIFIED</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Telemetry is insufficient or conflicting to make a definitive classification. Manual analyst review recommended.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FORENSIC RULES */}
          {activeTab === "forensics" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-surface border-2 border-on-background p-4 shadow-brutal-xs">
                <h3 className="font-headline-sm text-sm uppercase text-primary font-bold mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">policy</span>
                  Evidence Integrity & Separation Rules
                </h3>
                <p className="text-xs text-on-surface-variant mb-3">
                  To prevent false alarms and hallucinations, Domain Hunter enforces strict mathematical and forensic separation:
                </p>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 bg-surface-container border border-on-background">
                    <strong>1. Live Observations vs Historical Intel:</strong> Live crawl results (<code>current_observations</code>) and past intelligence reports (<code>historical_evidence</code>) are stored and evaluated separately.
                  </div>
                  <div className="p-2.5 bg-surface-container border border-on-background">
                    <strong>2. No Historical Proof of Live Activity:</strong> A historical phishing record from 6 months ago does NOT make a dead/non-resolving domain currently malicious. It must be classified as <code>PARKED_OR_INACTIVE</code>.
                  </div>
                  <div className="p-2.5 bg-surface-container border border-on-background">
                    <strong>3. Zero Synthetic Candidates:</strong> The agent is forbidden from guessing, inventing, or hallucinating candidate domains. All domains must originate from real search engine or threat feed telemetry.
                  </div>
                  <div className="p-2.5 bg-surface-container border border-on-background">
                    <strong>4. Clean Output Telemetry:</strong> Internal model planning tokens and chain-of-thought tokens are stripped from user feeds in favor of structured operational telemetry.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEFENSE PLAYBOOK */}
          {activeTab === "playbook" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-b-2 border-on-background pb-2">
                <h3 className="font-headline-sm text-sm uppercase font-bold text-on-background">
                  Defensive Countermeasures & Human Authorization
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Standard actions generated in the investigation reports:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="border-2 border-on-background p-3 bg-surface shadow-brutal-xs">
                  <div className="font-bold text-primary mb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">gavel</span>
                    DMCA Takedown Notice
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Generates a formal DMCA copyright and trademark infringement notice addressed to the hosting registrar and DNS provider.
                  </p>
                </div>

                <div className="border-2 border-on-background p-3 bg-surface shadow-brutal-xs">
                  <div className="font-bold text-secondary mb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">report</span>
                    Registrar Abuse Report
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Packages forensic screenshots, header proofs, and WHOIS records into standard abuse report templates (e.g. Namecheap, Cloudflare, GoDaddy).
                  </p>
                </div>

                <div className="border-2 border-on-background p-3 bg-surface shadow-brutal-xs">
                  <div className="font-bold text-tertiary mb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">block</span>
                    Perimeter DNS Block
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Recommends adding confirmed malicious domains to enterprise perimeter firewalls, EDR blocklists, and secure web gateways (SWG).
                  </p>
                </div>

                <div className="border-2 border-on-background p-3 bg-surface shadow-brutal-xs">
                  <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">visibility</span>
                    DNS Watch-List Monitoring
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Recommended for <code>PARKED_OR_INACTIVE</code> domains to alert security teams immediately if nameservers or A-records change.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-secondary-container border-2 border-on-background text-[11px] font-bold text-on-secondary-container flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">lock</span>
                <span>CRITICAL: All takedown submissions and external block requests require explicit human analyst authorization.</span>
              </div>
            </div>
          )}

          {/* TAB 5: KEYBOARD SHORTCUTS */}
          {activeTab === "shortcuts" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-b-2 border-on-background pb-2">
                <h3 className="font-headline-sm text-sm uppercase font-bold text-on-background">
                  Tactical Keyboard Shortcuts
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Quick keys for high-efficiency OSINT workflows:
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { key: "ESC", action: "Close Help Manual or Active Modal" },
                  { key: "ENTER", action: "Submit Brand Search on Dashboard" },
                  { key: "+ / NEW SCAN", action: "Open Brand Hunt Launch Dialog" },
                  { key: "RESET", action: "Purge Local Storage and Reset Session" },
                ].map((s) => (
                  <div key={s.key} className="flex justify-between items-center p-2.5 bg-surface border-2 border-on-background">
                    <span className="font-bold text-xs">{s.action}</span>
                    <kbd className="bg-primary-container text-on-primary-container px-2.5 py-1 border border-on-background shadow-brutal-xs text-xs font-bold">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="p-3 bg-surface border-t-2 border-on-background flex justify-between items-center select-none">
          <div className="text-[11px] text-on-surface-variant font-label-caps">
            SYSTEM VERSION: <strong className="text-on-background">v1.0.4-PROD</strong>
          </div>
          <button
            onClick={onClose}
            className="bg-primary-container text-on-primary-container px-4 py-1.5 font-headline-sm text-xs uppercase border-2 border-on-background shadow-brutal-xs font-bold active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            ACKNOWLEDGE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
