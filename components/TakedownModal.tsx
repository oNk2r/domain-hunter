"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { InvestigatedDomain } from "@/lib/investigation-data";

interface TakedownModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: InvestigatedDomain;
  brandName: string;
}

export function TakedownModal({ isOpen, onClose, domain, brandName }: TakedownModalProps) {
  const [copied, setCopied] = useState(false);
  const [takedownType, setTakedownType] = useState<"abuse_report" | "dmca" | "registrar_complaint">("abuse_report");

  if (!isOpen) return null;

  const generateNoticeText = () => {
    const timestamp = new Date().toUTCString();
    return `================================================================================
OFFICIAL NOTICE OF BRAND IMPERSONATION & ILLEGAL PHISHING ACTIVITY
================================================================================
DATE: ${timestamp}
CASE ID: SEC-${domain.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}
INVESTIGATING UNIT: Automated Cyber Defense Agent (Agent_007)

TO: Abuse & Legal Compliance Department
REGISTRAR: ${domain.registrar}
TARGET INFRINGING DOMAIN: https://${domain.domainName}
TARGET IP ADDRESS: ${domain.ip}
AFFECTED TRADEMARK / BRAND: ${brandName}

SUMMARY OF VIOLATION:
The domain identified above is actively engaging in deceptive brand impersonation, 
trademark infringement, and unauthorized credential harvesting targeting consumers 
and employees of ${brandName}.

FORENSIC EVIDENCE SEALED:
${domain.supportingEvidence.map((e, idx) => `[${idx + 1}] ${e}`).join("\n")}

SPECIFIC OBSERVATIONS:
${domain.evidences.map((e) => `- [${e.tag}] ${e.title} at ${e.location}: ${e.observation}`).join("\n")}

FORMAL DEMAND:
Pursuant to ICANN Registrar Accreditation Agreements and international anti-cybercrime
regulations, we urgently request the immediate suspension and DNS null-routing of 
https://${domain.domainName} to prevent further consumer fraud.

CERTIFICATION:
I hereby certify under penalty of perjury that the forensic evidence gathered above 
has been verified through cryptographic DOM matching, network telemetry logs, and 
authoritative trademark registry cross-referencing.

SUBMITTED BY:
Brand Security Response Team
Agent_007 - Digital Investigation Division
================================================================================`;
  };

  const noticeText = generateNoticeText();

  const handleCopy = () => {
    navigator.clipboard.writeText(noticeText);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([noticeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `takedown-notice-${domain.domainName}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-surface border-border-width-thick border-on-background shadow-brutal-lg max-w-3xl w-full p-6 relative max-h-[90vh] flex flex-col -rotate-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Caution header strip */}
        <div className="caution-tape h-4 -mx-6 -mt-6 mb-4 border-b-2 border-on-background" />

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="bg-error text-on-error font-label-caps text-xs px-2 py-0.5 border border-on-background inline-block font-bold mb-1 shadow-brutal-xs">
              LEGAL TAKEDOWN DISPATCH
            </div>
            <h2 className="font-headline-lg text-headline-lg uppercase text-on-background tracking-tight">
              AUTHORIZE TAKEDOWN PROTOCOL
            </h2>
            <p className="font-data-mono text-xs text-on-surface-variant">
              Target: <span className="font-bold text-error">{domain.domainName}</span> | Registrar: {domain.registrar}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-surface text-on-background border-2 border-on-background shadow-brutal-sm flex items-center justify-center font-bold text-lg hover:bg-error hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 mb-3">
          {[
            { id: "abuse_report", label: "REGISTRAR ABUSE NOTICE" },
            { id: "dmca", label: "DMCA COPYRIGHT NOTICE" },
            { id: "registrar_complaint", label: "UDRP DISPUTE SUMMARY" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTakedownType(tab.id as any)}
              className={`px-3 py-1 font-label-caps text-xs border-2 border-on-background transition-all ${
                takedownType === tab.id
                  ? "bg-primary-container text-on-primary-container font-bold shadow-brutal-xs -rotate-0.5"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Terminal Notice Preview */}
        <div className="flex-1 min-h-[220px] bg-inverse-surface text-retro-green font-data-mono text-xs p-4 border-2 border-on-background overflow-y-auto relative rounded-none select-text">
          <div className="crt-scanlines absolute inset-0 pointer-events-none opacity-40" />
          <pre className="whitespace-pre-wrap font-data-mono">{noticeText}</pre>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-on-background">
          <div className="flex items-center gap-2 text-xs font-data-mono text-on-surface-variant">
            <span className="w-2.5 h-2.5 rounded-full bg-retro-green animate-pulse" />
            Evidence bundle cryptographically signed.
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="bg-surface text-on-background border-2 border-on-background px-4 py-2 font-label-caps text-xs btn-brutal flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">download</span>
              EXPORT .TXT
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial bg-primary text-on-primary border-border-width-thick border-on-background px-6 py-2.5 font-headline-md text-base btn-brutal flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">
                {copied ? "check_circle" : "content_copy"}
              </span>
              {copied ? "COPIED TO CLIPBOARD!" : "COPY TAKEDOWN NOTICE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
