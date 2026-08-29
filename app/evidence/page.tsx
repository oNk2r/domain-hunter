"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { INITIAL_CASE, InvestigationCase, InvestigatedDomain } from "@/lib/investigation-data";
import { PolaroidCard } from "@/components/PolaroidCard";
import { TakedownModal } from "@/components/TakedownModal";

export default function EvidenceCorkboardPage() {
  const [activeCase, setActiveCase] = useState<InvestigationCase>(INITIAL_CASE);
  const [selectedDomain, setSelectedDomain] = useState<InvestigatedDomain>(INITIAL_CASE.domains[0]);
  const [isTakedownModalOpen, setIsTakedownModalOpen] = useState(false);
  const [decisionState, setDecisionState] = useState<"pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("active_case");
      if (stored) {
        try {
          const parsed: InvestigationCase = JSON.parse(stored);
          setActiveCase(parsed);
          const savedDomainId = localStorage.getItem("selected_domain_id");
          const found = parsed.domains.find((d) => d.id === savedDomainId);
          setSelectedDomain(found || parsed.domains[0]);
        } catch (err) {
          console.error("Failed to load active case", err);
        }
      }
    }
  }, []);

  const handleApprove = () => {
    setDecisionState("approved");
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setIsTakedownModalOpen(true);
  };

  const handleReject = () => {
    setDecisionState("rejected");
    alert(`Domain [${selectedDomain.domainName}] has been marked as a FALSE POSITIVE / CLEARED.`);
  };

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto corkboard-bg min-h-screen">
      {/* Domain Switcher Chips */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
        <span className="font-label-caps text-xs text-on-background font-bold bg-surface px-2 py-1 border border-on-background shadow-brutal-xs shrink-0">
          SELECT TARGET:
        </span>
        {activeCase.domains.map((dom) => (
          <button
            key={dom.id}
            onClick={() => {
              setSelectedDomain(dom);
              setDecisionState("pending");
            }}
            className={`px-3 py-1 font-data-mono text-xs border-2 border-on-background transition-all shrink-0 font-bold ${
              selectedDomain.id === dom.id
                ? "bg-primary text-on-primary shadow-brutal-sm -rotate-1 scale-105"
                : "bg-surface text-on-background hover:bg-surface-variant"
            }`}
          >
            {dom.domainName}
          </button>
        ))}
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 relative z-10">
        {/* Pinned Target Domain Box */}
        <div className="bg-surface p-6 border-border-width-thick border-on-background shadow-brutal rotate-0.5 max-w-2xl w-full relative">
          <div className="tape-strip absolute -top-3 left-4 px-4 py-1 font-label-caps text-xs tracking-widest z-10 border border-on-background">
            TARGET DOMAIN UNDER INVESTIGATION
          </div>
          <h1 className="font-headline-xl text-3xl sm:text-4xl text-on-background break-all uppercase mt-2">
            {selectedDomain.domainName}
          </h1>
          <div className="flex flex-wrap gap-3 mt-4 text-data-mono text-xs font-bold">
            <span className="bg-surface-variant px-2.5 py-1 border-2 border-on-background">
              IP: {selectedDomain.ip}
            </span>
            <span className="bg-surface-variant px-2.5 py-1 border-2 border-on-background">
              REG: {selectedDomain.regDate}
            </span>
            <span className="bg-surface-variant px-2.5 py-1 border-2 border-on-background">
              REGISTRAR: {selectedDomain.registrar}
            </span>
          </div>
        </div>

        {/* Starburst Badge */}
        <div
          onClick={handleApprove}
          className="relative shrink-0 -rotate-3 hover:rotate-3 transition-transform cursor-pointer group self-center md:self-auto"
        >
          <div className="absolute inset-0 bg-on-background shadow-brutal rounded-full transform translate-x-2 translate-y-2" />
          <div className="relative bg-secondary-container border-4 border-on-background rounded-full w-44 h-44 sm:w-48 sm:h-48 flex flex-col items-center justify-center p-4 text-center z-10 group-active:translate-x-1 group-active:translate-y-1 transition-transform">
            <span className="material-symbols-outlined text-4xl mb-1 text-error">
              warning
            </span>
            <span className="font-headline-md text-headline-md text-on-background leading-tight">
              LIKELY<br />IMPERSONATION
            </span>
            <span className="font-data-mono text-xs text-error font-black mt-1">
              {selectedDomain.confidence}% THREAT
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Scanned Content (2 cols) & Timeline (1 col) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Scanned Content (Polaroid Grid) */}
        <section className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline-lg text-2xl sm:text-3xl inline-block bg-primary text-on-primary px-4 py-2 border-border-width-thick border-on-background -rotate-1">
              SCANNED CONTENT ({selectedDomain.evidences.length})
            </h2>
            <span className="font-label-caps text-xs bg-surface text-on-background px-2.5 py-1 border-2 border-on-background font-bold rotate-1">
              IMMUTABLE ARTIFACTS
            </span>
          </div>

          {selectedDomain.evidences.length === 0 ? (
            <div className="bg-surface p-8 border-4 border-on-background shadow-brutal text-center font-data-mono">
              <span className="material-symbols-outlined text-5xl text-retro-green mb-2">verified_user</span>
              <p className="font-bold text-base">NO MALICIOUS FORENSIC PAYLOADS FOUND</p>
              <p className="text-xs text-on-surface-variant mt-1">This domain matches verified corporate fingerprints.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {selectedDomain.evidences.map((ev, index) => (
                <PolaroidCard
                  key={ev.id}
                  evidence={ev}
                  rotation={index % 2 === 0 ? "rotate-1.5" : "-rotate-1.5"}
                />
              ))}
            </div>
          )}
        </section>

        {/* Evidence Timeline */}
        <section className="xl:col-span-1 relative pl-6">
          <h2 className="font-headline-md text-xl inline-block bg-inverse-surface text-inverse-on-surface px-4 py-2 border-border-width-thick border-on-background rotate-1 mb-6">
            EVIDENCE TIMELINE
          </h2>

          {/* Vertical Spine Line */}
          <div className="absolute left-[33px] top-[75px] bottom-4 w-2 bg-on-background z-0" />

          <div className="space-y-8 relative z-10 mt-2">
            {selectedDomain.timeline.map((event) => (
              <div key={event.id} className="flex gap-4 items-start group">
                {/* Node Dot */}
                <div
                  className={`w-6 h-6 rounded-full border-4 border-on-background shrink-0 mt-1 shadow-brutal group-hover:scale-125 transition-transform ${
                    event.riskLevel === "error"
                      ? "bg-error"
                      : event.riskLevel === "primary"
                      ? "bg-primary-container"
                      : event.riskLevel === "warning"
                      ? "bg-retro-yellow"
                      : "bg-retro-green"
                  }`}
                />

                {/* Event Card */}
                <div className="bg-surface p-4 border-2 border-on-background shadow-brutal-sm flex-1 group-hover:-rotate-0.5 transition-transform">
                  <div
                    className={`font-label-caps text-xs flex items-center gap-1.5 mb-1 font-bold ${
                      event.riskLevel === "error"
                        ? "text-error"
                        : event.riskLevel === "primary"
                        ? "text-primary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{event.icon}</span>
                    {event.time} - {event.type}
                  </div>
                  <div className="font-data-mono text-xs text-on-background leading-relaxed">
                    {event.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Agent Verdict Section */}
      <section className="mt-14 bg-surface-container-high border-border-width-thick border-on-background p-6 sm:p-8 relative overflow-hidden shadow-brutal rotate-0.5">
        <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[260px]">gavel</span>
        </div>

        <h2 className="font-headline-lg text-2xl sm:text-3xl mb-6 relative z-10 inline-block border-b-border-width-thick border-primary-container pb-2">
          AI AGENT REASONING VERDICT
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          {/* Supporting Evidence */}
          <div className="bg-surface p-6 border-2 border-on-background shadow-brutal-sm">
            <h3 className="font-headline-md text-xl flex items-center gap-2 mb-4 text-on-background font-bold">
              <span className="material-symbols-outlined text-error">add_circle</span>
              SUPPORTING EVIDENCE (FLAGGED AS THREAT)
            </h3>
            {selectedDomain.supportingEvidence.length === 0 ? (
              <p className="font-data-mono text-xs text-on-surface-variant">No malicious indicators observed.</p>
            ) : (
              <ul className="space-y-3 font-data-mono text-xs text-on-surface-variant">
                {selectedDomain.supportingEvidence.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm mt-0.5 text-error">
                      arrow_right_alt
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Contradictory Evidence */}
          <div className="bg-surface p-6 border-2 border-on-background shadow-brutal-sm">
            <h3 className="font-headline-md text-xl flex items-center gap-2 mb-4 text-on-background font-bold">
              <span className="material-symbols-outlined text-tertiary">remove_circle</span>
              CONTRADICTORY EVIDENCE (NUANCES &amp; COUNTERFACTS)
            </h3>
            <ul className="space-y-3 font-data-mono text-xs text-on-surface-variant">
              {selectedDomain.contradictoryEvidence.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm mt-0.5 text-tertiary">
                    arrow_right_alt
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Human Approval Gate */}
      <section className="mt-14 bg-surface border-border-width-thick border-on-background relative -rotate-0.5 shadow-brutal-lg">
        {/* Caution Tape Top */}
        <div className="h-6 w-full caution-tape border-b-border-width-thick border-on-background" />

        <div className="p-8 text-center">
          {decisionState === "approved" ? (
            <div className="bg-retro-green/20 border-2 border-on-background p-6 -rotate-0.5 max-w-xl mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-retro-green">task_alt</span>
              <h3 className="font-headline-lg text-2xl uppercase text-on-background mt-1">
                TAKEDOWN PROTOCOL AUTHORIZED!
              </h3>
              <p className="font-data-mono text-xs text-on-surface-variant mt-2">
                Official registrar abuse notice compiled. Evidence bundle cryptographically sealed.
              </p>
              <button
                onClick={() => setIsTakedownModalOpen(true)}
                className="mt-4 bg-primary text-on-primary font-headline-sm text-sm px-6 py-2 border-2 border-on-background btn-brutal uppercase"
              >
                RE-OPEN NOTICE DISPATCHER
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-headline-xl text-3xl sm:text-4xl text-on-background mb-3 uppercase tracking-tighter">
                ACTION REQUIRES HUMAN OPERATOR APPROVAL
              </h2>
              <p className="font-body-lg text-sm sm:text-base text-on-surface-variant mb-8 max-w-2xl mx-auto">
                Automated systems have flagged <strong className="text-error">{selectedDomain.domainName}</strong> with{" "}
                <strong>{selectedDomain.confidence}% confidence</strong>. Manual operator authorization is required before dispatching registrar takedown notices.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                <button
                  onClick={handleReject}
                  className="bg-surface text-on-background border-border-width-thick border-on-background font-headline-md text-base py-3.5 px-6 btn-brutal flex items-center justify-center gap-2 group uppercase"
                >
                  <span className="material-symbols-outlined text-xl group-hover:-rotate-12 transition-transform">
                    cancel
                  </span>
                  MARK LEGIT
                </button>

                <button
                  onClick={handleApprove}
                  className="bg-primary text-on-primary border-border-width-thick border-on-background font-headline-md text-base py-3.5 px-8 btn-brutal flex items-center justify-center gap-2 group uppercase"
                >
                  <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">
                    assignment_turned_in
                  </span>
                  APPROVE TAKEDOWN
                </button>
              </div>
            </>
          )}
        </div>

        {/* Caution Tape Bottom */}
        <div className="h-6 w-full caution-tape border-t-border-width-thick border-on-background" />
      </section>

      {/* Takedown Notice Modal */}
      <TakedownModal
        isOpen={isTakedownModalOpen}
        onClose={() => setIsTakedownModalOpen(false)}
        domain={selectedDomain}
        brandName={activeCase.brandName}
      />
    </div>
  );
}
