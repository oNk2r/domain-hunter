"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface NewScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewScanModal({ isOpen, onClose }: NewScanModalProps) {
  const router = useRouter();
  const [brandInput, setBrandInput] = useState("");
  const [scanMode, setScanMode] = useState<"deep" | "fast" | "sandbox">("deep");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPresets = ["Stripe", "PayPal", "Netflix", "Shopify", "Coinbase", "Apple", "GitHub", "Acme Corp"];

  const handleStartScan = async (brandToScan?: string) => {
    if (isSubmitting) return;

    const raw = (brandToScan || brandInput).trim();
    if (!raw) {
      setErrorMsg("Please enter a brand name");
      return;
    }

    setErrorMsg(null);
    const cleanBrand = raw.replace(/[\x00-\x1F\x7F]/g, "").slice(0, 100);
    setIsSubmitting(true);

    onClose();
    if (typeof window !== "undefined") {
      window.location.href = `/scan?brand=${encodeURIComponent(cleanBrand)}`;
    } else {
      router.push(`/scan?brand=${encodeURIComponent(cleanBrand)}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-surface border-border-width-thick border-on-background shadow-brutal-lg max-w-xl w-full p-6 relative rotate-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header tape */}
        <div className="wavy-ribbon -mx-6 -mt-6 p-3 mb-6 flex justify-between items-center bg-primary-container text-on-primary-container border-b-4 border-on-background">
          <div className="flex items-center gap-2 font-headline-md text-headline-md uppercase">
            <span className="material-symbols-outlined text-2xl">radar</span>
            INITIATE BRAND HUNT
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-none bg-surface text-on-background border-2 border-on-background shadow-brutal-sm flex items-center justify-center font-bold text-lg hover:bg-error hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Brand Search Input */}
        <div className="mb-6">
          <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2 font-bold uppercase tracking-wider">
            Target Brand or Domain Pattern
          </label>
          <div className="flex items-center bg-white border-border-width-thick border-on-background shadow-brutal-sm p-1">
            <span className="material-symbols-outlined px-3 text-on-surface-variant text-2xl">
              search
            </span>
            <input
              type="text"
              value={brandInput}
              onChange={(e) => setBrandInput(e.target.value)}
              placeholder="E.G. PAYPAL, STRIPE, NETFLIX..."
              className="w-full bg-transparent border-none focus:ring-0 font-data-mono text-data-mono text-base uppercase placeholder:text-on-surface-variant/50 outline-none py-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleStartScan();
              }}
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <span className="font-label-caps text-[11px] text-on-surface-variant block mb-2 font-bold uppercase">
            Quick Intel Targets:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setBrandInput(preset);
                  handleStartScan(preset);
                }}
                className="bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container border-2 border-on-background font-data-mono text-xs px-3 py-1 shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 transition-colors"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Scan Mode Selector */}
        <div className="mb-8">
          <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2 font-bold uppercase">
            Investigation Depth
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "deep", label: "FULL SPECTRUM", desc: "DOM, SSL, Passive DNS", icon: "biotech" },
              { id: "fast", label: "RAPID TRIAGE", desc: "Cert Stream only", icon: "speed" },
              { id: "sandbox", label: "SANDBOX PROBE", desc: "Payload Execution", icon: "terminal" },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setScanMode(mode.id as any)}
                className={`p-3 border-2 border-on-background text-left transition-all ${
                  scanMode === mode.id
                    ? "bg-retro-yellow text-on-background shadow-brutal-sm font-bold -rotate-1 border-4"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-variant"
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-lg">{mode.icon}</span>
                  <span className="font-label-caps text-[11px]">{mode.label}</span>
                </div>
                <div className="font-data-mono text-[10px] opacity-75">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-surface text-on-background border-border-width-thick border-on-background font-headline-sm py-3 btn-brutal uppercase"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={() => handleStartScan()}
            disabled={isSubmitting}
            className="flex-2 w-2/3 bg-primary text-on-primary border-border-width-thick border-on-background font-headline-md py-3 btn-brutal uppercase flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                DEPLOYING AGENT...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">rocket_launch</span>
                DISPATCH SCAN
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
