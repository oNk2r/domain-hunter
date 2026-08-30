"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { LogEntry } from "@/lib/use-investigation";

interface LiveLogFeedProps {
  logs: (LogEntry | string)[];
  rawEvents?: Array<{ type: string; data: unknown; receivedAt: string }>;
  isStreaming?: boolean;
  currentPhase?: string;
}

interface ParsedLogItem {
  id: string;
  time: string;
  phase: "DISCOVERY" | "TRIAGE" | "RESEARCH" | "EVIDENCE" | "ASSESSMENT" | "SYSTEM";
  toolName?: string;
  message: string;
  type: "info" | "tool_call" | "tool_result" | "phase" | "error" | "agent";
  count: number;
}

export function LiveLogFeed({
  logs,
  rawEvents = [],
  isStreaming = true,
  currentPhase,
}: LiveLogFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showRawEvents, setShowRawEvents] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);

  // Normalize, filter noise & deduplicate consecutive logs
  const parsedLogs = useMemo(() => {
    const items: ParsedLogItem[] = [];

    for (let i = 0; i < logs.length; i++) {
      const raw = logs[i];
      const text = typeof raw === "string" ? raw : raw.text;
      const type = typeof raw === "string" ? "info" : raw.type;
      const timestamp = typeof raw === "object" && raw.timestamp ? raw.timestamp : new Date().toISOString();

      // Format time as HH:mm:ss
      let timeStr = "";
      try {
        const d = new Date(timestamp);
        if (!isNaN(d.getTime())) {
          timeStr = d.toTimeString().split(" ")[0];
        } else {
          timeStr = timestamp.slice(11, 19);
        }
      } catch {
        timeStr = "00:00:00";
      }

      // Filter out low-level noise, raw chunks, thinking narration, and non-actionable signals
      const lower = text.toLowerCase();
      if (
        lower.includes("tool response received") ||
        lower.includes("json chunk") ||
        lower.includes("model.message") ||
        lower.includes("turn.created") ||
        lower.includes("turn.done") ||
        lower.includes("thread.done") ||
        lower.startsWith("need to ") ||
        lower.startsWith("let's ") ||
        lower.startsWith("we will ") ||
        lower.startsWith("i will ")
      ) {
        continue;
      }

      // Determine Phase Tag
      let phase: ParsedLogItem["phase"] = "SYSTEM";
      if (typeof raw === "object" && raw.phase) {
        phase = raw.phase;
      } else if (lower.includes("discovery") || lower.includes("discovering")) {
        phase = "DISCOVERY";
      } else if (lower.includes("triage") || lower.includes("triaging") || lower.includes("fetch")) {
        phase = "TRIAGE";
      } else if (lower.includes("research") || lower.includes("intelligence") || lower.includes("threat")) {
        phase = "RESEARCH";
      } else if (lower.includes("evidence") || lower.includes("validat")) {
        phase = "EVIDENCE";
      } else if (lower.includes("assessment") || lower.includes("verdict") || lower.includes("classif")) {
        phase = "ASSESSMENT";
      } else if (currentPhase) {
        const cp = currentPhase.toLowerCase();
        if (cp.includes("discovery")) phase = "DISCOVERY";
        else if (cp.includes("triage")) phase = "TRIAGE";
        else if (cp.includes("research")) phase = "RESEARCH";
        else if (cp.includes("evidence")) phase = "EVIDENCE";
        else if (cp.includes("assessment")) phase = "ASSESSMENT";
      }

      // Extract real tool name if present in the event text
      let toolName: string | undefined = typeof raw === "object" ? raw.toolName : undefined;
      if (!toolName) {
        if (lower.includes("web_search_exa")) toolName = "web_search_exa";
        else if (lower.includes("web_fetch_exa")) toolName = "web_fetch_exa";
        else if (lower.includes("evidence-reviewer")) toolName = "evidence-reviewer";
        else if (lower.includes("domain-discovery")) toolName = "domain-discovery";
        else if (lower.includes("domain-triage")) toolName = "domain-triage";
      }

      // Clean message
      let message = text.replace(/^>\s*/, "").replace(/^⛔\s*/, "").replace(/^🤖\s*/, "").trim();

      // Collapse duplicate consecutive entries
      const prev = items[items.length - 1];
      if (
        prev &&
        prev.phase === phase &&
        (prev.toolName === toolName || (!prev.toolName && !toolName)) &&
        prev.message === message
      ) {
        prev.count += 1;
        continue;
      }

      items.push({
        id: `${i}-${timestamp}`,
        time: timeStr || "00:00:00",
        phase,
        toolName,
        message,
        type,
        count: 1,
      });
    }

    return items;
  }, [logs, currentPhase]);

  // Keep latest 8 items visible when collapsed
  const visibleLogs = useMemo(() => {
    if (showAllLogs || parsedLogs.length <= 8) {
      return parsedLogs;
    }
    return parsedLogs.slice(parsedLogs.length - 8);
  }, [parsedLogs, showAllLogs]);

  const hiddenCount = parsedLogs.length - visibleLogs.length;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLogs, showRawEvents]);

  const streamingStatusText = currentPhase
    ? `TRUEFORGE AGENT ${currentPhase.toUpperCase().replace(/_/g, " ")}...`
    : "AWAITING TRUEFORGE EVENTS...";

  const phaseBadgeStyles: Record<ParsedLogItem["phase"], { bg: string; text: string }> = {
    DISCOVERY: { bg: "bg-retro-yellow text-on-background", text: "text-retro-yellow" },
    TRIAGE: { bg: "bg-orange-500 text-white", text: "text-orange-400" },
    RESEARCH: { bg: "bg-blue-600 text-white", text: "text-blue-400" },
    EVIDENCE: { bg: "bg-purple-600 text-white", text: "text-purple-400" },
    ASSESSMENT: { bg: "bg-retro-green text-on-background", text: "text-retro-green" },
    SYSTEM: { bg: "bg-neutral-700 text-white", text: "text-neutral-400" },
  };

  return (
    <div className="bg-inverse-surface border-4 border-on-background flex flex-col shadow-brutal transform rotate-0.5 h-full min-h-[380px]">
      {/* Terminal Title Bar */}
      <div className="bg-primary-container border-b-4 border-on-background p-3 flex justify-between items-center text-on-primary-container">
        <div className="flex items-center gap-2 font-headline-md text-sm sm:text-base uppercase font-black">
          <span className="material-symbols-outlined text-lg">terminal</span>
          {showRawEvents ? "DEVELOPER RAW AUDIT" : "LIVE OPERATIONAL FEED"}
        </div>
        <div className="flex items-center gap-2">
          {rawEvents.length > 0 && (
            <button
              onClick={() => setShowRawEvents(!showRawEvents)}
              className="text-[10px] font-data-mono font-bold px-2 py-0.5 bg-black text-on-primary border border-on-background hover:bg-neutral-800 transition-colors"
            >
              {showRawEvents ? "[ VIEW FEED ]" : `[ RAW EVENTS (${rawEvents.length}) ]`}
            </button>
          )}
          {isStreaming && (
            <span className="flex items-center gap-1.5 font-label-caps text-[11px] bg-black text-retro-green px-2 py-0.5 border border-on-background font-black">
              <span className="w-2 h-2 rounded-full bg-retro-green animate-pulse" />
              LIVE
            </span>
          )}
          <span className="w-3.5 h-3.5 rounded-full border-2 border-on-background bg-error" />
        </div>
      </div>

      {/* Console Output Area */}
      <div
        ref={containerRef}
        className="flex-1 p-3 sm:p-4 font-data-mono text-xs text-retro-green overflow-y-auto max-h-[380px] flex flex-col gap-2.5 relative bg-black/95 select-text"
      >
        {/* CRT Scanline effect */}
        <div className="crt-scanlines absolute inset-0 pointer-events-none opacity-30" />

        {showRawEvents ? (
          <div className="flex flex-col gap-2">
            {rawEvents.map((evt, idx) => (
              <div key={idx} className="border-b border-retro-green/20 pb-1.5 font-data-mono text-[11px]">
                <span className="text-retro-yellow font-bold">[{evt.type}]</span>{" "}
                <span className="text-white/60 text-[10px]">{evt.receivedAt}</span>
                <pre className="text-[10px] text-retro-green/80 whitespace-pre-wrap overflow-x-auto max-h-32 mt-1">
                  {JSON.stringify(evt.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Expand / Collapse Button for Earlier Events */}
            {hiddenCount > 0 && !showAllLogs && (
              <button
                onClick={() => setShowAllLogs(true)}
                className="w-full text-center py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-700 text-[10px] font-data-mono font-bold transition-colors cursor-pointer"
              >
                [ VIEW ACTIVITY LOG ({hiddenCount} EARLIER EVENTS) ]
              </button>
            )}

            {showAllLogs && parsedLogs.length > 8 && (
              <button
                onClick={() => setShowAllLogs(false)}
                className="w-full text-center py-1 px-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-700 text-[10px] font-data-mono font-bold transition-colors cursor-pointer"
              >
                [ COLLAPSE TO LATEST EVENTS ]
              </button>
            )}

            {/* Clean Structured Event Entries */}
            {visibleLogs.map((item) => {
              const isError = item.type === "error" || item.message.includes("FAILED") || item.message.includes("ERROR");
              const isApproval = item.message.includes("PAUSED") || item.message.includes("APPROVAL");
              const isComplete = item.message.includes("COMPLETE") || item.message.includes("SEALED");
              const badge = phaseBadgeStyles[item.phase] || phaseBadgeStyles.SYSTEM;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col gap-0.5 p-1.5 border-l-2 ${
                    isError
                      ? "border-error bg-error/10 text-error"
                      : isApproval
                      ? "border-retro-yellow bg-retro-yellow/10 text-retro-yellow"
                      : isComplete
                      ? "border-retro-green bg-retro-green/10 text-retro-green"
                      : "border-retro-green/40 hover:bg-white/5"
                  } transition-colors font-data-mono`}
                >
                  {/* Timestamp + Phase Badge + Tool Badge */}
                  <div className="flex items-center gap-2 flex-wrap text-[10px]">
                    <span className="text-neutral-400 font-bold">{item.time}</span>
                    <span className={`px-1.5 py-0.2 font-black border border-black/40 text-[9px] uppercase ${badge.bg}`}>
                      {item.phase}
                    </span>
                    {item.toolName && (
                      <span className="text-[#88ccff] font-bold bg-[#88ccff]/10 px-1 py-0.2 border border-[#88ccff]/30 text-[9px]">
                        TOOL: {item.toolName}
                      </span>
                    )}
                    {item.count > 1 && (
                      <span className="text-retro-yellow font-black text-[9px] bg-black px-1 border border-retro-yellow">
                        ×{item.count}
                      </span>
                    )}
                  </div>

                  {/* Message */}
                  <div className="text-xs leading-relaxed pl-1 text-white/90 font-medium">
                    {item.message}
                  </div>
                </div>
              );
            })}

            {/* Pulsing Status Cursor */}
            {isStreaming && (
              <div className="flex items-center gap-1.5 text-primary-container font-bold animate-pulse pt-1 text-xs">
                <span>&gt;</span>
                <span className="w-2 h-3.5 bg-primary-container inline-block" />
                <span className="text-[11px]">{streamingStatusText}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
