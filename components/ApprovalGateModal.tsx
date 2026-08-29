"use client";

import React, { useState, useEffect } from "react";

export interface ApprovalRequest {
  toolName: string;
  sessionId: string;
  description?: string;
  receivedAt: string;
}

interface ApprovalGateModalProps {
  request: ApprovalRequest | null;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * Hard-blocking modal that surfaces whenever TrueForge fires a
 * `tool.approval_required` event. The agent is paused on the TrueForge
 * side — this UI prevents the user from doing anything else until they
 * explicitly Authorize or Reject the proposed action.
 *
 * Satisfies hackathon requirement: "Actually block execution until approval."
 */
export function ApprovalGateModal({
  request,
  onApprove,
  onReject,
}: ApprovalGateModalProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);

  // Reset state whenever a new approval request arrives
  useEffect(() => {
    if (request) {
      setDecision(null);
      setCountdown(null);
    }
  }, [request]);

  if (!request) return null;

  const handleApprove = () => {
    setDecision("approve");
    // Brief visual confirmation, then fire callback
    setTimeout(() => {
      onApprove();
    }, 600);
  };

  const handleReject = () => {
    setDecision("reject");
    setTimeout(() => {
      onReject();
    }, 600);
  };

  const toolDisplay = request.toolName
    .toUpperCase()
    .replace(/_/g, " ")
    .replace(/-/g, " ");

  return (
    // Full-screen overlay — cannot be dismissed by clicking outside
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {/* Pulsing red border to signal urgency */}
      <div
        className={`
          relative max-w-lg w-full border-4 border-on-background shadow-brutal-lg bg-surface
          ${decision === "approve" ? "border-retro-green" : decision === "reject" ? "border-error" : "animate-pulse-border"}
        `}
      >
        {/* Caution tape header strip */}
        <div className="caution-tape h-5 border-b-4 border-on-background" />

        <div className="p-6">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-error text-on-error font-label-caps text-xs px-2 py-1 border-2 border-on-background font-black shadow-brutal-xs">
              ⛔ AGENT PAUSED
            </div>
            <div className="bg-retro-yellow text-on-background font-label-caps text-xs px-2 py-1 border-2 border-on-background font-bold shadow-brutal-xs">
              HUMAN APPROVAL REQUIRED
            </div>
          </div>

          {/* Headline */}
          <h2 className="font-headline-lg text-2xl uppercase text-on-background mb-2 leading-tight">
            Authorize Agent Action?
          </h2>
          <p className="font-data-mono text-xs text-on-surface-variant mb-6">
            The TrueForge agent has reached a step that requires human
            authorization before proceeding. Review the proposed action below.
          </p>

          {/* Action Details Box */}
          <div className="bg-inverse-surface border-4 border-on-background p-4 mb-6 relative overflow-hidden">
            <div className="crt-scanlines absolute inset-0 pointer-events-none opacity-30" />
            <div className="font-data-mono text-xs text-retro-green space-y-2 relative z-10">
              <div className="flex gap-3">
                <span className="text-retro-yellow font-bold w-24 shrink-0">TOOL:</span>
                <span className="font-bold text-white">{toolDisplay}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-retro-yellow font-bold w-24 shrink-0">SESSION:</span>
                <span className="text-retro-green/80">{request.sessionId.slice(0, 20)}...</span>
              </div>
              {request.description && (
                <div className="flex gap-3">
                  <span className="text-retro-yellow font-bold w-24 shrink-0">DETAIL:</span>
                  <span className="text-retro-green/90">{request.description}</span>
                </div>
              )}
              <div className="flex gap-3">
                <span className="text-retro-yellow font-bold w-24 shrink-0">TIME:</span>
                <span className="text-retro-green/60">{request.receivedAt}</span>
              </div>
            </div>
          </div>

          {/* Approval State Machine Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6 font-data-mono text-[10px] text-on-surface-variant">
            <span className="px-2 py-0.5 border border-on-surface-variant text-on-surface-variant line-through opacity-50">PROPOSED</span>
            <span className="text-on-surface-variant">→</span>
            <span className="px-2 py-0.5 border-2 border-retro-yellow bg-retro-yellow text-on-background font-bold">WAITING FOR APPROVAL</span>
            <span className="text-on-surface-variant">→</span>
            <span className={`px-2 py-0.5 border border-on-surface-variant opacity-50 ${decision === "approve" ? "!opacity-100 border-retro-green text-retro-green font-bold" : ""}`}>APPROVED</span>
            <span className="text-on-surface-variant">/</span>
            <span className={`px-2 py-0.5 border border-on-surface-variant opacity-50 ${decision === "reject" ? "!opacity-100 border-error text-error font-bold" : ""}`}>REJECTED</span>
          </div>

          {/* Action Buttons */}
          {decision ? (
            <div className={`
              flex items-center justify-center gap-3 p-4 border-2 border-on-background font-headline-md text-lg font-bold
              ${decision === "approve" ? "bg-retro-green text-on-background" : "bg-error text-white"}
            `}>
              <span className="material-symbols-outlined text-2xl">
                {decision === "approve" ? "check_circle" : "cancel"}
              </span>
              {decision === "approve" ? "AUTHORIZED — RESUMING AGENT..." : "REJECTED — STOPPING AGENT..."}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                id="approval-gate-reject-btn"
                onClick={handleReject}
                className="bg-surface text-on-background border-4 border-on-background px-6 py-4 font-headline-md text-lg uppercase btn-brutal flex items-center justify-center gap-2 hover:bg-error hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">block</span>
                REJECT
              </button>
              <button
                id="approval-gate-authorize-btn"
                onClick={handleApprove}
                className="bg-primary-container text-on-primary-container border-4 border-on-background px-6 py-4 font-headline-md text-lg uppercase btn-brutal flex items-center justify-center gap-2 hover:bg-retro-green hover:text-on-background transition-colors shadow-brutal"
              >
                <span className="material-symbols-outlined text-xl">verified</span>
                AUTHORIZE
              </button>
            </div>
          )}

          <p className="mt-4 text-center font-data-mono text-[10px] text-on-surface-variant">
            The agent is paused and waiting. No action will be taken until you decide.
          </p>
        </div>
      </div>
    </div>
  );
}
