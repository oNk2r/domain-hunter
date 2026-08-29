"use client";

import React, { useEffect, useRef, useState } from "react";

interface LiveLogFeedProps {
  logs: string[];
  rawEvents?: Array<{ type: string; data: unknown; receivedAt: string }>;
  isStreaming?: boolean;
  currentPhase?: string;
}

export function LiveLogFeed({ logs, rawEvents = [], isStreaming = true, currentPhase }: LiveLogFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showRawEvents, setShowRawEvents] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, showRawEvents]);

  const streamingStatusText = currentPhase
    ? `TRUEFORGE AGENT ${currentPhase.toUpperCase().replace(/_/g, " ")}...`
    : "AWAITING TRUEFORGE EVENTS...";

  return (
    <div className="bg-inverse-surface border-4 border-on-background flex flex-col shadow-brutal transform rotate-0.5 h-full min-h-[360px]">
      {/* Terminal Title Bar */}
      <div className="bg-primary-container border-b-4 border-on-background p-3 flex justify-between items-center text-on-primary-container">
        <div className="flex items-center gap-2 font-headline-md text-headline-md uppercase">
          <span className="material-symbols-outlined text-xl">terminal</span>
          {showRawEvents ? "DEVELOPER RAW EVENT AUDIT" : "LIVE TELEMETRY FEED"}
        </div>
        <div className="flex items-center gap-2">
          {rawEvents.length > 0 && (
            <button
              onClick={() => setShowRawEvents(!showRawEvents)}
              className="text-[10px] font-data-mono px-2 py-0.5 bg-black text-on-primary border border-on-background hover:bg-neutral-800 transition-colors"
            >
              {showRawEvents ? "[ VIEW TELEMETRY ]" : `[ RAW EVENTS (${rawEvents.length}) ]`}
            </button>
          )}
          {isStreaming && (
            <span className="flex items-center gap-1.5 font-label-caps text-xs bg-black text-retro-green px-2 py-0.5 border border-on-background">
              <span className="w-2 h-2 rounded-full bg-retro-green animate-pulse" />
              RECORDING
            </span>
          )}
          <span className="w-3.5 h-3.5 rounded-full border-2 border-on-background bg-error" />
        </div>
      </div>

      {/* Console Output Area */}
      <div
        ref={containerRef}
        className="flex-1 p-4 font-data-mono text-xs sm:text-sm text-retro-green overflow-y-auto max-h-[380px] flex flex-col gap-2 relative bg-black/90 select-text"
      >
        {/* CRT Scanline effect */}
        <div className="crt-scanlines absolute inset-0 pointer-events-none opacity-40" />

        {showRawEvents ? (
          <div className="flex flex-col gap-2">
            {rawEvents.map((evt, idx) => (
              <div key={idx} className="border-b border-retro-green/20 pb-1">
                <span className="text-retro-yellow font-bold">[{evt.type}]</span>{" "}
                <span className="text-white/60 text-[11px]">{evt.receivedAt}</span>
                <pre className="text-[11px] text-retro-green/80 whitespace-pre-wrap overflow-x-auto max-h-32 mt-1">
                  {JSON.stringify(evt.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <>
            {logs.map((log, index) => {
              const isApproval = log.includes("AGENT PAUSED") || log.includes("APPROVAL REQUIRED") || log.includes("HUMAN AUTHORIZED") || log.includes("HUMAN REJECTED");
              const isSubagent = log.includes("SUBAGENT") || log.includes("THREAD");
              const isWarning = log.includes("WARNING") || log.includes("MISMATCH") || log.includes("HIGH THREAT") || log.includes("ERROR") || log.includes("FAILED");
              const isSkill = log.includes("PROTOCOLS") || log.includes("MCP") || log.includes("SANDBOX");
              const isSuccess = log.includes("SECURED") || log.includes("SEALED") || log.includes("COMPLETE") || log.includes("200 OK") || log.includes("AUTHORIZED");
              const isToolCall = log.includes("EXA") || log.includes("TOOL") || log.includes("TRIAGE") || log.includes("REVIEWER") || log.includes("DISCOVERY");
              const isToolResult = log.includes("RESPONSE RECEIVED");

              // Approval events get a bold banner treatment
              if (isApproval) {
                const isWaiting = log.includes("AGENT PAUSED") || log.includes("APPROVAL REQUIRED");
                return (
                  <div
                    key={index}
                    className={`px-2 py-1.5 border-2 font-data-mono text-xs font-bold flex items-center gap-2 ${
                      isWaiting
                        ? "border-retro-yellow bg-retro-yellow/20 text-retro-yellow"
                        : log.includes("AUTHORIZED")
                        ? "border-retro-green bg-retro-green/10 text-retro-green"
                        : "border-error bg-error/10 text-error"
                    }`}
                  >
                    <span>{isWaiting ? "⛔" : log.includes("AUTHORIZED") ? "✅" : "🚫"}</span>
                    {log.replace(/^> /, "")}
                  </div>
                );
              }

              // Subagent thread events get a special badge
              if (isSubagent) {
                return (
                  <div
                    key={index}
                    className="px-2 py-1 bg-primary-container/20 border-l-4 border-primary-container text-primary-container font-data-mono text-xs font-bold flex items-center gap-2"
                  >
                    <span>🤖</span>
                    {log.replace(/^> /, "")}
                  </div>
                );
              }

              let colorClass = "text-retro-green/90";
              if (isWarning) colorClass = "text-retro-yellow font-bold bg-retro-yellow/10 px-1 border-l-2 border-retro-yellow";
              else if (isToolCall) colorClass = "text-[#88ccff] font-semibold";
              else if (isToolResult) colorClass = "text-[#aaddee]";
              else if (isSkill) colorClass = "text-tertiary-container font-semibold";
              else if (isSuccess) colorClass = "text-[#00ffcc] font-bold";

              return (
                <div key={index} className={`${colorClass} tracking-wide leading-relaxed font-data-mono`}>
                  {log}
                </div>
              );
            })}

            {isStreaming && (
              <div className="flex items-center gap-1 text-primary-container font-bold animate-pulse pt-2">
                <span>&gt;</span>
                <span className="w-2 h-4 bg-primary-container inline-block" />
                <span>{streamingStatusText}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

