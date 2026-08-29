"use client";

import React, { useState } from "react";
import { ScannedEvidence } from "@/lib/investigation-data";

interface PolaroidCardProps {
  evidence: ScannedEvidence;
  rotation?: string;
}

export function PolaroidCard({ evidence, rotation = "rotate-1" }: PolaroidCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const renderVisualPayload = () => {
    switch (evidence.type) {
      case "fake_login":
        return (
          <div className="w-full h-full bg-[#1b1c1a] text-white p-3 flex flex-col justify-between font-data-mono text-xs border border-on-background relative overflow-hidden">
            {/* Spoofed UI Mockup */}
            <div className="flex items-center justify-between border-b border-white/20 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-error" />
                <span className="w-2.5 h-2.5 rounded-full bg-retro-yellow" />
                <span className="w-2.5 h-2.5 rounded-full bg-retro-green" />
              </div>
              <span className="text-[10px] text-error font-bold tracking-widest bg-error/20 px-1 border border-error">
                UNTRUSTED ORIGIN
              </span>
            </div>

            <div className="my-auto space-y-2 py-2 text-center">
              <div className="font-headline-sm text-retro-yellow text-sm font-bold uppercase tracking-wider">
                ENTERPRISE SIGN-ON
              </div>
              <div className="bg-surface-container/20 border border-white/30 p-1 text-[10px] text-left text-white/70">
                [USER_INPUT]: victim@enterprise.corp
              </div>
              <div className="bg-error/30 border border-error p-1 text-[10px] text-left text-error font-bold animate-pulse">
                [PAYLOAD HOOK]: capture_keystrokes()
              </div>
            </div>

            <div className="flex justify-between text-[9px] text-white/50 border-t border-white/20 pt-1">
              <span>POST /api/steal-creds</span>
              <span className="text-error font-bold">200 HARVESTED</span>
            </div>
          </div>
        );

      case "obfuscated_js":
        return (
          <div className="w-full h-full bg-[#0d1117] text-[#58a6ff] p-3 flex flex-col font-data-mono text-[10px] border border-on-background overflow-hidden">
            <div className="text-retro-yellow font-bold mb-1">// OBFUSCATED HARVESTER PAYLOAD</div>
            <div className="text-white/60 leading-tight break-all font-data-mono">
              eval(function(p,a,c,k,e,r){"{e=function(c){return(c<a?'':e(parseInt(c/a)))+String.fromCharCode(c%a+161)}}"}
            </div>
            <div className="mt-auto bg-retro-yellow/20 text-retro-yellow border border-retro-yellow p-1 font-bold">
              &gt;&gt; TELEGRAM BOT EXFIL DETECTED &lt;&lt;
            </div>
          </div>
        );

      case "stolen_assets":
      default:
        return (
          <div className="w-full h-full bg-surface-variant p-3 flex flex-col justify-center items-center text-center font-data-mono text-xs border border-on-background">
            <span className="material-symbols-outlined text-4xl text-primary mb-1">
              copyright
            </span>
            <div className="font-bold text-on-background uppercase">{evidence.title}</div>
            <div className="text-[10px] text-on-surface-variant mt-1">
              Hash: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div
        onClick={() => setIsZoomed(true)}
        className={`bg-surface p-4 border-border-width-thick border-on-background shadow-brutal ${rotation} hover:rotate-0 hover:scale-[1.02] transition-all cursor-pointer group relative`}
      >
        {/* Tape Effect */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-surface-variant border border-on-background shadow-brutal-xs opacity-90 rotate-1 z-10" />

        {/* Polaroid Inner Frame */}
        <div className="border-2 border-on-background bg-surface-variant aspect-[4/3] mb-3 relative overflow-hidden">
          {renderVisualPayload()}

          {/* Badge Stamp */}
          <div
            className={`absolute top-2 right-2 font-label-caps text-[10px] px-2 py-0.5 border-2 border-on-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-3 font-bold ${
              evidence.tagType === "error"
                ? "bg-error text-on-error"
                : evidence.tagType === "warning"
                ? "bg-retro-yellow text-on-background"
                : "bg-secondary-container text-on-secondary-container"
            }`}
          >
            {evidence.tag}
          </div>
        </div>

        {/* Polaroid Caption */}
        <div className="font-data-mono text-xs text-on-surface-variant space-y-1">
          <div className="font-bold text-on-background truncate">
            LOC: <span className="text-tertiary">{evidence.location}</span>
          </div>
          <div className="text-[11px] line-clamp-2 leading-relaxed">
            {evidence.observation}
          </div>
        </div>

        {/* Hover inspect hint */}
        <div className="mt-2 text-right">
          <span className="font-label-caps text-[10px] text-primary underline font-bold group-hover:text-primary-container">
            CLICK TO INSPECT FORENSICS →
          </span>
        </div>
      </div>

      {/* Full Forensics Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="bg-surface border-4 border-on-background shadow-brutal-lg max-w-2xl w-full p-6 relative rotate-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-label-caps text-xs bg-primary text-on-primary px-2 py-0.5 border border-on-background font-bold uppercase">
                  FORENSIC ARTIFACT
                </span>
                <h3 className="font-headline-lg text-headline-lg uppercase text-on-background mt-1">
                  {evidence.title}
                </h3>
              </div>
              <button
                onClick={() => setIsZoomed(false)}
                className="w-8 h-8 bg-surface text-on-background border-2 border-on-background shadow-brutal-sm font-bold hover:bg-error hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="h-64 border-2 border-on-background mb-4 overflow-hidden">
              {renderVisualPayload()}
            </div>

            <div className="bg-surface-container p-4 border-2 border-on-background font-data-mono text-xs space-y-2 mb-6">
              <div>
                <span className="text-on-surface-variant font-bold">EXACT ENDPOINT:</span>{" "}
                <span className="text-tertiary">{evidence.location}</span>
              </div>
              <div>
                <span className="text-on-surface-variant font-bold">ANALYSIS NOTES:</span>{" "}
                <span>{evidence.observation}</span>
              </div>
              <div>
                <span className="text-on-surface-variant font-bold">TAMPER STATUS:</span>{" "}
                <span className="text-retro-green font-bold">SHA-256 VERIFIED SEALED</span>
              </div>
            </div>

            <button
              onClick={() => setIsZoomed(false)}
              className="w-full bg-primary text-on-primary border-2 border-on-background py-2.5 font-headline-md uppercase btn-brutal"
            >
              CLOSE ARTIFACT INSPECTOR
            </button>
          </div>
        </div>
      )}
    </>
  );
}
