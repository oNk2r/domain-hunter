"use client";

import { useState, useCallback, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────

export type InvestigationPhase =
  | "idle"
  | "starting"
  | "discovery"
  | "triage"
  | "public_research"
  | "evidence_review"
  | "final_assessment"
  | "agent_investigation" // fallback when phase cannot be determined
  | "complete"
  | "error"
  | "cancelled";

export interface LogEntry {
  timestamp: string;
  text: string;
  type: "info" | "tool_call" | "tool_result" | "phase" | "error" | "agent";
  phase?: "DISCOVERY" | "TRIAGE" | "RESEARCH" | "EVIDENCE" | "ASSESSMENT" | "SYSTEM";
  toolName?: string;
}

/** Classification from TrueForge agent output */
export type DomainClassification =
  | "LEGITIMATE"
  | "SUSPICIOUS"
  | "LIKELY_IMPERSONATION"
  | "INCONCLUSIVE"
  | "PARKED_OR_INACTIVE";

export interface EvidenceSourceItem {
  name: string;
  type?: string;
  url?: string;
}

/** A single domain result parsed from the final agent output */
export interface DomainResult {
  domain: string;
  classification: DomainClassification;
  confidence: number | null;
  currentObservations: string[];
  historicalEvidence: string[];
  contradictoryEvidence: string[];
  evidenceSources: (string | EvidenceSourceItem)[];
  reasoning: string;
  recommendedAction: string;
  humanReviewRequired: boolean;
  discoveryTool?: string;
  triageMethod?: string;
}

/** The full investigation result */
export interface InvestigationResult {
  brand: string;
  domains: DomainResult[];
  rawAgentOutput: string;
  parseSucceeded: boolean;
  sessionId: string;
  completedAt: string;
  startedAt?: number | null;
  logs?: LogEntry[];
  events?: RawTrueForgeEvent[];
}

/** A raw TrueForge event preserved verbatim */
export interface RawTrueForgeEvent {
  type: string;
  data: unknown;
  receivedAt: string;
}

export interface PendingApproval {
  toolName: string;
  sessionId: string;
  /** thread_id from tool.response_required — needed to submit user.tool_approval turn */
  threadId?: string;
  /** tool_call_id from tool.response_required — needed to submit user.tool_approval turn */
  toolCallId?: string;
  description?: string;
  receivedAt: string;
}

export interface InvestigationState {
  phase: InvestigationPhase;
  logs: LogEntry[];
  events: RawTrueForgeEvent[];
  result: InvestigationResult | null;
  error: string | null;
  sessionId: string | null;
  brand: string;
  startedAt: number | null;
  /** Non-null when TrueForge has fired tool.approval_required and is waiting. */
  pendingApproval: PendingApproval | null;
}

// ── Helpers ────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

function makeLog(
  text: string,
  type: LogEntry["type"] = "info",
  phase?: LogEntry["phase"],
  toolName?: string
): LogEntry {
  return { timestamp: now(), text, type, phase, toolName };
}

const PHASE_RANKS: Record<InvestigationPhase, number> = {
  idle: 0,
  starting: 0,
  discovery: 1,
  triage: 2,
  public_research: 3,
  agent_investigation: 3,
  evidence_review: 4,
  final_assessment: 5,
  complete: 6,
  error: 6,
  cancelled: 6,
};

/**
 * Infer the investigation phase sequentially from thread titles, tool calls, or explicit status events.
 */
function inferPhaseFromActivity(
  activity: string,
  isToolCall = false,
  currentPhase: InvestigationPhase = "starting"
): InvestigationPhase | null {
  const t = activity.toLowerCase();

  // 1. Sub-agent threads & designated names
  if (t.includes("domain-discovery") || t.includes("discover candidate") || t.includes("discovering domain")) {
    return "discovery";
  }
  if (t.includes("domain-triage") || t.includes("triaging candidate") || t.includes("triage")) {
    return "triage";
  }
  if (t.includes("evidence-reviewer") || t.includes("validating evidence") || t.includes("reviewing evidence")) {
    return "evidence_review";
  }
  if (t.includes("threat intelligence") || t.includes("threat research") || t.includes("intel")) {
    return "public_research";
  }

  // 2. Tool calls
  if (isToolCall) {
    if (t.includes("web_search_exa") || t.includes("web_search")) {
      if (currentPhase === "triage" || currentPhase === "public_research" || currentPhase === "evidence_review") {
        return "public_research";
      }
      return "discovery";
    }
    if (t.includes("web_fetch_exa") || t.includes("web_fetch") || t.includes("fetch") || t.includes("curl") || t.includes("http")) {
      return "triage";
    }
    if (t.includes("sandbox") || t.includes("exec") || t.includes("whois") || t.includes("dig") || t.includes("dns")) {
      return "public_research";
    }
    return null;
  }

  // 3. Status messages
  if (
    t.startsWith("compiling final") ||
    t.startsWith("investigation report") ||
    t.startsWith("final verdict") ||
    t.includes("generating final dossier") ||
    t.includes("classifying")
  ) {
    return "final_assessment";
  }

  return null;
}

/**
 * Try to parse the final agent output as structured JSON or Markdown investigation.
 * Falls back gracefully if not parseable.
 */
function parseFinalOutput(
  content: string,
  brand: string,
  sessionId: string
): InvestigationResult {
  const base: InvestigationResult = {
    brand,
    domains: [],
    rawAgentOutput: content,
    parseSucceeded: false,
    sessionId,
    completedAt: now(),
  };

  if (!content || !content.trim()) {
    return base;
  }

  // Strip think tags if any
  const cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // 1. Try to find JSON in the content (code blocks or raw JSON object/array)
  let jsonStr = "";
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  } else {
    // Look for outermost JSON object { ... } containing "domains" or "status" or "brand"
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = cleaned.slice(firstBrace, lastBrace + 1).trim();
    } else {
      const firstBracket = cleaned.indexOf("[");
      const lastBracket = cleaned.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket > firstBracket) {
        jsonStr = cleaned.slice(firstBracket, lastBracket + 1).trim();
      }
    }
  }

  if (jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      const domains = extractDomainsFromJson(parsed);
      if (domains.length > 0) {
        base.domains = domains;
        base.parseSucceeded = true;
        base.rawAgentOutput = JSON.stringify(parsed, null, 2);
        return base;
      }
      if (typeof parsed === "object" && parsed !== null) {
        const obj = parsed as Record<string, unknown>;
        if (String(obj.status || "").toUpperCase() === "FAILED") {
          base.parseSucceeded = false;
          base.rawAgentOutput = JSON.stringify(parsed, null, 2);
          return base;
        }
      }
    } catch {
      // JSON parse failed
    }
  }

  // Strict: Do NOT attempt to convert unstructured planning text into fake domain cards.
  return base;
}

const VALID_CLASSIFICATIONS: DomainClassification[] = [
  "LEGITIMATE",
  "SUSPICIOUS",
  "LIKELY_IMPERSONATION",
  "INCONCLUSIVE",
  "PARKED_OR_INACTIVE",
];

function normalizeClassification(s: string): DomainClassification {
  const upper = String(s || "").toUpperCase().replace(/[\s-]+/g, "_").trim();
  if (VALID_CLASSIFICATIONS.includes(upper as DomainClassification)) {
    return upper as DomainClassification;
  }
  if (upper.includes("IMPERSONAT") || upper.includes("PHISH") || upper.includes("MALICIOUS")) return "LIKELY_IMPERSONATION";
  if (upper.includes("SUSPICIOUS") || upper.includes("ALERT") || upper.includes("RISK")) return "SUSPICIOUS";
  if (upper.includes("LEGITIMATE") || upper.includes("OFFICIAL") || upper.includes("SAFE")) return "LEGITIMATE";
  if (upper.includes("PARKED") || upper.includes("INACTIVE")) return "PARKED_OR_INACTIVE";
  return "INCONCLUSIVE";
}

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((v) => (typeof v === "object" && v !== null ? JSON.stringify(v) : String(v))).filter(Boolean);
  }
  if (typeof val === "string" && val.trim()) return [val.trim()];
  return [];
}

function parseSources(val: unknown): (string | EvidenceSourceItem)[] {
  if (!Array.isArray(val)) {
    if (typeof val === "string" && val.trim()) return [val.trim()];
    return [];
  }
  return val.map((item) => {
    if (typeof item === "string") return item.trim();
    if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        name: String(obj.name || obj.source || obj.title || "Source").trim(),
        type: obj.type ? String(obj.type).trim() : undefined,
        url: obj.url ? String(obj.url).trim() : undefined,
      };
    }
    return String(item).trim();
  }).filter(Boolean);
}

function sanitizeActionLanguage(action: string): string {
  const trimmed = action.trim();
  if (!trimmed) {
    return "Consider manual review by a security analyst before taking action.";
  }

  let sanitized = trimmed;
  if (/^immediate(ly)? block/i.test(sanitized)) {
    sanitized = "Consider blocking at the network perimeter after human analyst review and approval.";
  } else if (/^(submit|file|send|issue)\s+(a\s+)?takedown/i.test(sanitized)) {
    sanitized = "Consider preparing a takedown request after human analyst review and approval.";
  } else if (/^schedule a re-?check/i.test(sanitized)) {
    sanitized = "Recommended: re-check after 7 days. No automated monitoring has been scheduled.";
  } else if (/^report/i.test(sanitized) && !/after human/i.test(sanitized)) {
    sanitized = `Consider abuse reporting after human analyst approval: ${sanitized}`;
  }

  return sanitized;
}


function sanitizeReasoningSummary(reasoning: string): string {
  if (!reasoning) return "";
  let clean = reasoning.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  clean = clean
    .split("\n")
    .map((l) => l.trim())
    .filter((line) => {
      const lower = line.toLowerCase();
      return (
        line.length > 0 &&
        !lower.startsWith("need to ") &&
        !lower.startsWith("let's ") &&
        !lower.startsWith("could use ") &&
        !lower.startsWith("maybe ") &&
        !lower.startsWith("we will ") &&
        !lower.startsWith("i will ") &&
        !lower.startsWith("now ") &&
        !lower.startsWith("can't ") &&
        !lower.startsWith("we need ") &&
        !lower.startsWith("we must ") &&
        !lower.startsWith("we should ") &&
        !lower.startsWith("first step ") &&
        !lower.startsWith("perhaps ") &&
        !lower.startsWith("search for ") &&
        !lower.includes("follow domain hunter workflow") &&
        !lower.includes("discover candidate domains") &&
        !lower.includes("call web_search_exa") &&
        !lower.includes("call web_fetch_exa")
      );
    })
    .join(" ")
    .trim();
  return clean;
}

function formatToolCallLog(
  toolName: string,
  phase: InvestigationPhase = "discovery"
): { text: string; phaseTag: LogEntry["phase"]; toolName: string } {
  const t = toolName.toLowerCase();
  let phaseTag: LogEntry["phase"] = "DISCOVERY";
  let text = `Running tool ${toolName}`;

  if (t.includes("web_search_exa") || t.includes("search")) {
    if (phase === "triage" || phase === "public_research" || phase === "evidence_review") {
      phaseTag = "RESEARCH";
      text = "Reviewing historical threat intelligence records";
    } else {
      phaseTag = "DISCOVERY";
      text = "Searching public sources for candidate lookalike domains";
    }
  } else if (t.includes("web_fetch_exa") || t.includes("fetch") || t.includes("curl") || t.includes("triage")) {
    phaseTag = "TRIAGE";
    text = "Checking live DNS, SSL, and content for candidate domains";
  } else if (t.includes("reviewer") || t.includes("evidence")) {
    phaseTag = "EVIDENCE";
    text = "Validating evidence provenance and contradiction analysis";
  } else if (t.includes("whois") || t.includes("dig") || t.includes("dns") || t.includes("sandbox") || t.includes("exec")) {
    phaseTag = "RESEARCH";
    text = "Executing sandbox inspection and domain telemetry check";
  } else if (t.includes("discovery")) {
    phaseTag = "DISCOVERY";
    text = "Starting candidate domain discovery";
  }

  return { text, phaseTag, toolName };
}

function extractDomainsFromJson(payload: unknown): DomainResult[] {
  if (!payload || typeof payload !== "object") return [];

  let candidates: unknown[] = [];
  if (Array.isArray(payload)) {
    candidates = payload;
  } else {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.domains)) candidates = obj.domains;
    else if (Array.isArray(obj.candidates)) candidates = obj.candidates;
    else if (Array.isArray(obj.results)) candidates = obj.results;
    else if (obj.investigation && typeof obj.investigation === "object") {
      const inv = obj.investigation as Record<string, unknown>;
      if (Array.isArray(inv.domains)) candidates = inv.domains;
      else if (Array.isArray(inv.candidates)) candidates = inv.candidates;
      else if (Array.isArray(inv.results)) candidates = inv.results;
    }
  }

  return candidates
    .filter((c): c is Record<string, unknown> => typeof c === "object" && c !== null)
    .map((c): DomainResult => {
      const domain = String(c.domain || c.domainName || c.name || "unknown").toLowerCase().trim();
      const classification = normalizeClassification(String(c.classification || c.status || ""));

      let confidence: number | null = null;
      if (typeof c.confidence === "number" && !isNaN(c.confidence)) {
        if (c.confidence >= 0 && c.confidence <= 1) {
          confidence = Math.round(c.confidence * 100);
        } else if (c.confidence > 1 && c.confidence <= 100) {
          confidence = Math.round(c.confidence);
        }
      }

      const rawAction = String(c.recommended_action || c.recommendedAction || c.action || "");
      const recommendedAction = sanitizeActionLanguage(rawAction);
      const needsHumanReview = detectHumanReviewNeeded(c, classification);

      const discoveryTool = typeof c.discovery_tool === "string" && c.discovery_tool.trim() ? c.discovery_tool.trim() : (typeof c.discovered_via === "string" && c.discovered_via.trim() ? c.discovered_via.trim() : undefined);
      const triageMethod = typeof c.triage_method === "string" && c.triage_method.trim() ? c.triage_method.trim() : (typeof c.triage_tool === "string" && c.triage_tool.trim() ? c.triage_tool.trim() : undefined);

      return {
        domain,
        classification,
        confidence,
        currentObservations: toStringArray(c.current_observations || c.currentObservations || c.observations),
        historicalEvidence: toStringArray(c.historical_evidence || c.historicalEvidence),
        contradictoryEvidence: toStringArray(c.contradictory_evidence || c.contradictoryEvidence),
        evidenceSources: parseSources(c.evidence_sources || c.evidenceSources || c.sources),
        reasoning: sanitizeReasoningSummary(String(c.reasoning_summary || c.reasoning || c.reason || c.analysis || "")),
        recommendedAction,
        humanReviewRequired: needsHumanReview,
        discoveryTool,
        triageMethod,
      };
    })
    .filter((d) => d.domain !== "unknown");
}

function detectHumanReviewNeeded(c: Record<string, unknown>, classification?: DomainClassification): boolean {
  if (c.requires_human_review === true || c.humanReviewRequired === true || c.human_review_required === true) return true;
  if (classification === "SUSPICIOUS" || classification === "LIKELY_IMPERSONATION" || classification === "PARKED_OR_INACTIVE") return true;
  const action = String(c.recommended_action || c.recommendedAction || c.action || "").toLowerCase();
  const consequentialKeywords = ["takedown", "report", "abuse", "contact", "notify", "dmca", "suspend", "block", "monitor"];
  return consequentialKeywords.some((kw) => action.includes(kw));
}



// ── Extract text content from model.message event ──────────────────────

function extractTextFromModelMessage(event: Record<string, unknown>): string {
  if (typeof event.text === "string") return event.text;
  if (typeof event.content === "string") return event.content;

  const delta = event.delta as Record<string, unknown> | undefined;
  if (delta && typeof delta === "object") {
    if (typeof delta.text === "string") return delta.text;
    if (typeof delta.content === "string") return delta.content;
  }

  const content = event.content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (typeof part === "object" && part !== null) {
          const p = part as Record<string, unknown>;
          if (p.type === "text" && typeof p.text === "string") return p.text;
          if (p.type !== "reasoning" && typeof p.content === "string") return p.content;
        }
        return "";
      })
      .join("");
  }
  return "";
}

/**
 * Shared canonical tool name extractor from raw tool call item or object.
 * Supports: function.name, toolInfo.name, and name / toolName / tool_name.
 */
export function extractCanonicalToolName(tc: unknown): string | null {
  if (!tc || typeof tc !== "object") return null;
  const obj = tc as Record<string, unknown>;
  const fnObj = obj.function as Record<string, unknown> | undefined;
  const infoObj = obj.toolInfo as Record<string, unknown> | undefined;

  const candidate =
    (fnObj && typeof fnObj.name === "string" ? fnObj.name : null) ||
    (infoObj && typeof infoObj.name === "string" ? infoObj.name : null) ||
    (typeof obj.name === "string" ? obj.name : null) ||
    (typeof obj.toolName === "string" ? obj.toolName : null) ||
    (typeof obj.tool_name === "string" ? obj.tool_name : null);

  if (candidate && candidate.trim()) {
    return candidate.trim();
  }
  return null;
}

/**
 * Extract all canonical tool names called within a single event object.
 * Handles both top-level and nested `data` envelopes.
 */
export function extractToolCallNames(event: Record<string, unknown>): string[] {
  if (!event || typeof event !== "object") return [];
  const data = (event.data && typeof event.data === "object" ? event.data : event) as Record<string, unknown>;
  const rawCalls = data.toolCalls || data.tool_calls || event.toolCalls || event.tool_calls;

  const names: string[] = [];

  if (Array.isArray(rawCalls)) {
    for (const tc of rawCalls) {
      const name = extractCanonicalToolName(tc);
      if (name && !names.includes(name)) {
        names.push(name);
      }
    }
  }

  // Also check single toolInfo on event/data
  const singleName = extractCanonicalToolName(data.toolInfo || event.toolInfo);
  if (singleName && !names.includes(singleName)) {
    names.push(singleName);
  }

  return names;
}

/**
 * Extract all unique canonical tool names from a list of raw TrueForge events.
 */
export function extractUniqueToolNamesFromEvents(events?: RawTrueForgeEvent[]): string[] {
  if (!events || !Array.isArray(events) || events.length === 0) return [];
  const set = new Set<string>();

  for (const ev of events) {
    const evObj = (ev.data && typeof ev.data === "object" ? ev.data : ev) as Record<string, unknown>;
    const names = extractToolCallNames(evObj);
    for (const n of names) {
      set.add(n);
    }
  }

  return Array.from(set);
}

export interface RecordedStageTelemetry {
  uniqueTools: string[];
  discovery: { proven: boolean; tool?: string };
  triage: { proven: boolean; tool?: string };
  historicalIntel: { proven: boolean; tool?: string };
  evidenceReview: { proven: boolean; tool?: string };
}

function isValidResultString(str: unknown): boolean {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  if (trimmed.length === 0 || trimmed === "{}" || trimmed === "[]") return false;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("error") || lower.startsWith("fail") || lower.startsWith("exception")) {
    return false;
  }
  return true;
}

function isValidSubagentResult(evData: Record<string, unknown>): boolean {
  // Check for error statuses
  const status = String(
    (evData.state as Record<string, unknown>)?.status ||
    evData.status ||
    ""
  ).toLowerCase();
  if (status === "error" || status === "failed" || status === "cancelled") {
    return false;
  }

  // Check state.output, output, content, or result
  const stateObj = evData.state as Record<string, unknown> | undefined;
  const rawOutput = stateObj?.output ?? evData.output ?? evData.content ?? stateObj?.result ?? evData.result;

  // A validated non-empty result payload is strictly required — status alone does not prove stage completion
  if (rawOutput === null || rawOutput === undefined) {
    return false;
  }

  if (typeof rawOutput === "string") {
    return isValidResultString(rawOutput);
  }

  if (Array.isArray(rawOutput)) {
    return rawOutput.length > 0;
  }

  if (typeof rawOutput === "object" && rawOutput !== null) {
    const obj = rawOutput as Record<string, unknown>;
    const content = obj.content || obj.text || obj.result || obj.domains || obj.findings;
    if (typeof content === "string") {
      return isValidResultString(content);
    }
    if (Array.isArray(content)) {
      return content.length > 0;
    }
    const nonStatusKeys = Object.keys(obj).filter(
      (k) => k !== "status" && k !== "id" && k !== "thread_id" && k !== "threadId" && k !== "type"
    );
    if (nonStatusKeys.length === 0) return false;
    return nonStatusKeys.some((k) => {
      const v = obj[k];
      if (typeof v === "string") return isValidResultString(v);
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "object" && v !== null) return Object.keys(v).length > 0;
      return typeof v === "number" || typeof v === "boolean";
    });
  }

  return false;
}

/**
 * Extract proven investigation stage telemetry by evaluating explicit thread metadata
 * and tool calls scoped to specific stages, rather than loose global substring matching.
 */
export function extractStageTelemetryFromEvents(events?: RawTrueForgeEvent[]): RecordedStageTelemetry {
  const telemetry: RecordedStageTelemetry = {
    uniqueTools: [],
    discovery: { proven: false },
    triage: { proven: false },
    historicalIntel: { proven: false },
    evidenceReview: { proven: false },
  };

  if (!events || !Array.isArray(events) || events.length === 0) {
    return telemetry;
  }

  const threadStageMap = new Map<string, "discovery" | "triage" | "historicalIntel" | "evidenceReview">();
  const allTools = new Set<string>();

  for (const ev of events) {
    const evData = (ev.data && typeof ev.data === "object" ? ev.data : ev) as Record<string, unknown>;
    const type = String(ev.type || evData.type || "");

    // 1. Explicit thread creation & subagent registration (metadata mapping only)
    if (type === "thread.created") {
      const threadId = String(evData.id || evData.thread_id || evData.threadId || "");
      const title = String(evData.title || (evData.agentInfo as Record<string, unknown>)?.name || "").toLowerCase();
      if (threadId) {
        if (title.includes("discovery") || title.includes("domain-discovery")) {
          threadStageMap.set(threadId, "discovery");
        } else if (title.includes("triage") || title.includes("domain-triage")) {
          threadStageMap.set(threadId, "triage");
        } else if (title.includes("reviewer") || title.includes("evidence-review") || title.includes("evidence_review")) {
          threadStageMap.set(threadId, "evidenceReview");
        } else if (title.includes("intel") || title.includes("historical")) {
          threadStageMap.set(threadId, "historicalIntel");
        }
      }
    }

    // 2. Thread completion with validated, non-empty result payload
    if (type === "thread.done") {
      const threadId = String(evData.id || evData.thread_id || evData.threadId || "");
      const threadStage = threadId ? threadStageMap.get(threadId) : undefined;
      if (threadStage && isValidSubagentResult(evData)) {
        telemetry[threadStage].proven = true;
      }
    }

    // 3. Tool calls and their associated thread scope
    const toolNames = extractToolCallNames(evData);
    const eventThreadId = String(evData.thread_id || evData.threadId || "");
    const threadStage = eventThreadId ? threadStageMap.get(eventThreadId) : undefined;

    for (const toolName of toolNames) {
      allTools.add(toolName);
      const lower = toolName.toLowerCase();

      // Explicit dedicated tools by name
      if (lower === "domain-discovery" || lower.includes("domain-discovery")) {
        telemetry.discovery.proven = true;
        telemetry.discovery.tool = toolName;
      } else if (lower === "domain-triage" || lower.includes("domain-triage")) {
        telemetry.triage.proven = true;
        telemetry.triage.tool = toolName;
      } else if (lower === "evidence-reviewer" || lower.includes("evidence-reviewer")) {
        telemetry.evidenceReview.proven = true;
        telemetry.evidenceReview.tool = toolName;
      }

      // If tool was called within a designated thread
      if (threadStage === "discovery") {
        telemetry.discovery.proven = true;
        if (!telemetry.discovery.tool) telemetry.discovery.tool = toolName;
      } else if (threadStage === "triage") {
        telemetry.triage.proven = true;
        if (!telemetry.triage.tool) telemetry.triage.tool = toolName;
      } else if (threadStage === "evidenceReview") {
        telemetry.evidenceReview.proven = true;
        if (!telemetry.evidenceReview.tool) telemetry.evidenceReview.tool = toolName;
      } else if (threadStage === "historicalIntel") {
        telemetry.historicalIntel.proven = true;
        if (!telemetry.historicalIntel.tool) telemetry.historicalIntel.tool = toolName;
      } else {
        // Main thread tool calls: assign specifically without loose cross-contamination
        if (lower.includes("fetch") && !telemetry.triage.tool) {
          telemetry.triage.proven = true;
          telemetry.triage.tool = toolName;
        }
        if (lower.includes("search") && !telemetry.discovery.tool) {
          telemetry.discovery.proven = true;
          telemetry.discovery.tool = toolName;
        }
      }
    }
  }

  telemetry.uniqueTools = Array.from(allTools);
  return telemetry;
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useInvestigation() {
  const [state, setState] = useState<InvestigationState>({
    phase: "idle",
    logs: [],
    events: [],
    result: null,
    error: null,
    sessionId: null,
    brand: "",
    startedAt: null,
    pendingApproval: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const lastMessageRef = useRef<string>("");
  const streamedDeltasRef = useRef<string>("");

  const addLog = useCallback(
    (
      text: string,
      type: LogEntry["type"] = "info",
      phaseTag?: LogEntry["phase"],
      toolName?: string
    ) => {
      setState((prev) => ({
        ...prev,
        logs: [...prev.logs, makeLog(text, type, phaseTag, toolName)],
      }));
    },
    []
  );

  const addEvent = useCallback((type: string, data: unknown) => {
    setState((prev) => ({
      ...prev,
      events: [...prev.events, { type, data, receivedAt: now() }],
    }));
  }, []);

  const advancePhase = useCallback((newPhase: InvestigationPhase | null) => {
    if (!newPhase) return;
    setState((prev) => {
      const currentRank = PHASE_RANKS[prev.phase] ?? 0;
      const newRank = PHASE_RANKS[newPhase] ?? 0;
      if (newRank > currentRank && prev.phase !== "complete" && prev.phase !== "error" && prev.phase !== "cancelled") {
        return { ...prev, phase: newPhase };
      }
      return prev;
    });
  }, []);

  const processEvent = useCallback(
    (type: string, event: Record<string, unknown>, brand: string) => {
      switch (type) {
        case "turn.created": {
          addLog(`Searching public sources for ${brand} impersonation domains`, "phase", "DISCOVERY");
          advancePhase("discovery");
          setState((prev) => ({
            ...prev,
            sessionId: prev.sessionId || (event.turnId as string) || null,
          }));
          break;
        }

        case "thread.created": {
          const title = String(event.title || "");
          const agentInfo = event.agentInfo as Record<string, unknown> | undefined;
          const agentName = agentInfo ? String(agentInfo.name || "") : "";
          const displayTitle = title || agentName;

          if (displayTitle) {
            setState((prev) => {
              const inferred = inferPhaseFromActivity(displayTitle, false, prev.phase);
              if (inferred) advancePhase(inferred);
              const phaseTag: LogEntry["phase"] =
                inferred === "triage"
                  ? "TRIAGE"
                  : inferred === "evidence_review"
                  ? "EVIDENCE"
                  : inferred === "public_research"
                  ? "RESEARCH"
                  : "DISCOVERY";
              return {
                ...prev,
                logs: [...prev.logs, makeLog(`Subagent workflow started: ${displayTitle.toUpperCase()}`, "agent", phaseTag)],
              };
            });
          }
          break;
        }

        case "thread.done": {
          break;
        }

        case "model.message": {
          const text = extractTextFromModelMessage(event);
          const toolCalls = extractToolCallNames(event);

          if (text) {
            lastMessageRef.current = text;
          }

          if (toolCalls.length > 0) {
            // Clear intermediate streamed text when tool calls start so they don't pollute final JSON
            streamedDeltasRef.current = "";
            setState((prev) => {
              let updatedPhase = prev.phase;
              const newLogs = [...prev.logs];

              for (const toolName of toolCalls) {
                const toolPhase = inferPhaseFromActivity(toolName, true, updatedPhase);
                if (toolPhase) {
                  const currentRank = PHASE_RANKS[updatedPhase] ?? 0;
                  const newRank = PHASE_RANKS[toolPhase] ?? 0;
                  if (newRank > currentRank) {
                    updatedPhase = toolPhase;
                  }
                }
                const formatted = formatToolCallLog(toolName, toolPhase || updatedPhase);
                newLogs.push(makeLog(formatted.text, "tool_call", formatted.phaseTag, formatted.toolName));
              }

              return {
                ...prev,
                phase: updatedPhase,
                logs: newLogs,
              };
            });
          }
          break;
        }

        case "model.message.delta": {
          const deltaText = extractTextFromModelMessage(event);
          if (deltaText) {
            streamedDeltasRef.current += deltaText;
            lastMessageRef.current = streamedDeltasRef.current;
          }
          break;
        }

        case "tool.response": {
          streamedDeltasRef.current = "";
          break;
        }

        case "turn.done": {
          const state = event.state as Record<string, unknown> | undefined;
          const status = state?.status as string | undefined;

          if (status === "error") {
            const rawMsg = state?.message || (state?.error as Record<string, unknown>)?.message || state?.error || "Agent turn failed";
            const errorMsg = `TrueForge: ${String(rawMsg)}`;
            addLog(`Investigation failed: ${errorMsg}`, "error", "SYSTEM");
            setState((prev) => ({
              ...prev,
              phase: "error",
              error: errorMsg,
            }));
          } else if (status === "cancelled") {
            addLog("Investigation cancelled by operator", "phase", "SYSTEM");
            setState((prev) => ({ ...prev, phase: "cancelled" }));
          } else {
            let finalContent = "";

            // Check state.output directly (string or object with content/text)
            if (typeof state?.output === "string" && state.output.trim()) {
              finalContent = state.output.trim();
            } else if (typeof state?.output === "object" && state.output !== null) {
              const outObj = state.output as Record<string, unknown>;
              if (typeof outObj.content === "string" && outObj.content.trim()) {
                finalContent = outObj.content.trim();
              } else if (typeof outObj.text === "string" && outObj.text.trim()) {
                finalContent = outObj.text.trim();
              }
            }

            // Search assistant messages backwards for structured JSON
            if (!finalContent && state && Array.isArray((state as Record<string, unknown>).messages)) {
              const msgs = (state as Record<string, unknown>).messages as Record<string, unknown>[];
              for (let i = msgs.length - 1; i >= 0; i--) {
                if (msgs[i].role === "assistant") {
                  const text = extractTextFromModelMessage(msgs[i]);
                  if (text && (text.includes("{") || text.includes("["))) {
                    finalContent = text;
                    break;
                  }
                  if (text && !finalContent) {
                    finalContent = text;
                  }
                }
              }
            }

            if (!finalContent) {
              finalContent = lastMessageRef.current || streamedDeltasRef.current;
            }

            const isExplicitFailure =
              /STATUS:\s*FAILED/i.test(finalContent) ||
              /DOMAIN DISCOVERY UNAVAILABLE/i.test(finalContent) ||
              /EVIDENCE REVIEW UNAVAILABLE/i.test(finalContent);

            if (isExplicitFailure) {
              const reasonMatch = finalContent.match(/REASON:\s*([^\n]+)/i);
              const failureReason = reasonMatch ? reasonMatch[1].trim() : "DOMAIN DISCOVERY UNAVAILABLE";
              addLog(`Investigation failed: ${failureReason}`, "error", "DISCOVERY");
              setState((prev) => ({
                ...prev,
                phase: "error",
                error: `INVESTIGATION FAILED: ${failureReason}`,
              }));
              return;
            }

            setState((prev) => {
              const completionLog = makeLog("Classification and forensic dossier complete", "phase", "ASSESSMENT");
              const finalLogs = [...prev.logs, completionLog];
              const result = parseFinalOutput(finalContent, brand, prev.sessionId || "");
              result.startedAt = prev.startedAt;
              result.logs = finalLogs;
              result.events = prev.events;

              if (!result.parseSucceeded || result.domains.length === 0) {
                const failureReason = "INVALID OR INCOMPLETE INVESTIGATION RESULT";
                addLog(`Investigation failed: ${failureReason}`, "error", "ASSESSMENT");
                return {
                  ...prev,
                  phase: "error",
                  error: `INVESTIGATION FAILED: ${failureReason}`,
                  logs: [...prev.logs, makeLog(`Error: ${failureReason}`, "error", "ASSESSMENT")],
                };
              }

              return { ...prev, phase: "complete", result, logs: finalLogs };
            });
          }
          break;
        }

        case "mcp.auth_required": {
          const serverName = String((event as Record<string, unknown>).name || "unknown");
          addLog(`> MCP AUTH REQUIRED: ${serverName.toUpperCase()}`, "info");
          break;
        }

        case "mcp.initialize": {
          const serverName = String((event as Record<string, unknown>).name || "EXA");
          addLog(`> MCP SERVER INITIALIZED: ${serverName.toUpperCase()}`, "info");
          break;
        }

        case "sandbox.created": {
          addLog("> SANDBOX INITIALIZED", "info");
          setState((prev) => ({
            ...prev,
            phase: prev.phase === "starting" || prev.phase === "discovery" || prev.phase === "triage" ? "public_research" : prev.phase,
          }));
          break;
        }

        // TrueForge fires `tool.response_required` (verified from SDK types:
        // ToolResponseRequiredEvent = { type: "tool.response_required", id, thread_id, tool_calls: [{id, source_event_id}] })
        // This is the event that pauses the agent and requires a user.tool_approval response.
        case "tool.response_required": {
          const ev = event as Record<string, unknown>;
          const threadId = String(ev.thread_id || "");
          const toolCallsRaw = ev.tool_calls as Array<Record<string, unknown>> | undefined;
          const toolCallId = toolCallsRaw?.[0]?.id ? String(toolCallsRaw[0].id) : "";
          const toolName = toolCallId || "unknown_tool";
          addLog(`> ⛔ AGENT PAUSED — HUMAN APPROVAL REQUIRED FOR: ${toolName.toUpperCase()}`, "phase");
          setState((prev) => ({
            ...prev,
            pendingApproval: {
              toolName,
              sessionId: prev.sessionId || "",
              threadId: threadId || undefined,
              toolCallId: toolCallId || undefined,
              receivedAt: now(),
            },
          }));
          break;
        }

        // Keep handling tool.approval_required as a fallback in case
        // some TrueForge versions use this event name.
        case "tool.approval_required": {
          const toolName = String((event as Record<string, unknown>).name || "unknown");
          const approvalDesc = String((event as Record<string, unknown>).description || "");
          addLog(`> ⛔ AGENT PAUSED — HUMAN APPROVAL REQUIRED FOR: ${toolName.toUpperCase()}`, "phase");
          setState((prev) => ({
            ...prev,
            pendingApproval: {
              toolName,
              sessionId: prev.sessionId || "",
              description: approvalDesc || undefined,
              receivedAt: now(),
            },
          }));
          break;
        }

        default: {
          break;
        }
      }
    },
    [addLog, advancePhase]
  );

  const start = useCallback(
    async (brand: string) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;
      lastMessageRef.current = "";
      streamedDeltasRef.current = "";

      const cleanBrand = brand.trim();
      if (!cleanBrand) return;

      setState({
        phase: "starting",
        logs: [makeLog(`> SCAN INITIATED FOR BRAND: ${cleanBrand.toUpperCase()}`, "phase")],
        events: [],
        result: null,
        error: null,
        sessionId: null,
        brand: cleanBrand,
        startedAt: Date.now(),
        pendingApproval: null,
      });

      try {
        const response = await fetch("/api/investigate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brand: cleanBrand }),
          signal: controller.signal,
        });

        const sessionId = response.headers.get("X-TrueForge-Session");
        if (sessionId) {
          setState((prev) => ({ ...prev, sessionId }));
        }

        if (!response.ok) {
          let errorMsg = `TrueForge returned ${response.status}`;
          try {
            const errBody = await response.json();
            errorMsg = errBody.error || errBody.details || errorMsg;
          } catch {
            // ignore JSON parse error
          }

          if (
            response.status === 503 ||
            errorMsg.includes("TRUEFORGE RUNTIME UNAVAILABLE") ||
            errorMsg.includes("ECONNREFUSED") ||
            errorMsg.includes("fetch failed")
          ) {
            errorMsg = "TRUEFORGE RUNTIME UNAVAILABLE";
            setState((prev) => ({
              ...prev,
              phase: "error",
              error: errorMsg,
              logs: [
                ...prev.logs,
                makeLog("> TRUEFORGE RUNTIME UNAVAILABLE — Local runtime required for live investigations", "error"),
              ],
            }));
            return;
          }

          setState((prev) => ({
            ...prev,
            phase: "error",
            error: errorMsg,
            logs: [...prev.logs, makeLog(`> ERROR: ${errorMsg}`, "error")],
          }));
          return;
        }

        if (!response.body) {
          setState((prev) => ({
            ...prev,
            phase: "error",
            error: "No event stream received from TrueForge",
            logs: [...prev.logs, makeLog("> ERROR: No event stream received", "error")],
          }));
          return;
        }

        addLog("> TRUEFORGE CONNECTION ESTABLISHED", "info");

        // Read SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const normalized = buffer.replace(/\r\n/g, "\n");
          const parts = normalized.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (!part.trim()) continue;

            const lines = part.split("\n");
            let eventData = "";
            let eventType = "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                eventData += line.slice(6);
              } else if (line.startsWith("event: ")) {
                eventType = line.slice(7).trim();
              }
            }

            if (!eventData) continue;

            try {
              const parsed = JSON.parse(eventData);
              const type = parsed.type || eventType || "unknown";

              addEvent(type, parsed);
              processEvent(type, parsed, cleanBrand);
            } catch {
              addLog(`> NON-JSON EVENT: ${eventData.slice(0, 120)}`, "info");
              addEvent("parse_error", { raw: eventData.slice(0, 500) });
            }
          }
        }

        // Stream ended — compile final output if turn.done wasn't triggered
        setState((prev) => {
          if (prev.phase !== "complete" && prev.phase !== "error" && prev.phase !== "cancelled") {
            const finalContent = lastMessageRef.current || streamedDeltasRef.current;
            const completionLog = makeLog("> INVESTIGATION COMPLETE", "phase");
            const finalLogs = [...prev.logs, completionLog];
            const result = parseFinalOutput(finalContent, cleanBrand, prev.sessionId || "");
            result.startedAt = prev.startedAt;
            result.logs = finalLogs;
            result.events = prev.events;

            if (!result.parseSucceeded || result.domains.length === 0) {
              const failureReason = "INVALID OR INCOMPLETE INVESTIGATION RESULT";
              return {
                ...prev,
                phase: "error",
                error: `INVESTIGATION FAILED: ${failureReason}`,
                logs: [...prev.logs, makeLog(`> ERROR: ${failureReason}`, "error")],
              };
            }

            return {
              ...prev,
              phase: "complete",
              result,
              logs: finalLogs,
            };
          }
          return prev;
        });
      } catch (err) {
        if (controller.signal.aborted) {
          setState((prev) => ({
            ...prev,
            phase: "cancelled",
            logs: [...prev.logs, makeLog("> INVESTIGATION CANCELLED BY USER", "phase")],
          }));
          return;
        }
        const msg = err instanceof Error ? err.message : "Unknown error";
        const isUnavailable =
          msg.includes("fetch failed") ||
          msg.includes("Failed to fetch") ||
          msg.includes("ECONNREFUSED");

        const displayMsg = isUnavailable ? "TRUEFORGE RUNTIME UNAVAILABLE" : msg;
        setState((prev) => ({
          ...prev,
          phase: "error",
          error: displayMsg,
          logs: [
            ...prev.logs,
            makeLog(
              isUnavailable
                ? "> TRUEFORGE RUNTIME UNAVAILABLE — Local runtime required for live investigations"
                : `> ERROR: ${msg}`,
              "error"
            ),
          ],
        }));
      }
    },
    [addLog, addEvent, processEvent]
  );

  /** Called when the user clicks Authorize in the ApprovalGateModal. */
  const approveAction = useCallback(async () => {
    const { sessionId, pendingApproval } = state;
    setState((prev) => ({
      ...prev,
      pendingApproval: null,
      logs: [...prev.logs, makeLog("> ✅ HUMAN AUTHORIZED — AGENT RESUMING", "phase")],
    }));
    if (sessionId) {
      try {
        await fetch("/api/investigate/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            decision: "allow",
            threadId: pendingApproval?.threadId,
            toolCallId: pendingApproval?.toolCallId,
          }),
        });
      } catch {
        // Best-effort — SSE stream may continue regardless
      }
    }
  }, [state]);

  /** Called when the user clicks Reject in the ApprovalGateModal. */
  const rejectAction = useCallback(async () => {
    const { sessionId } = state;
    setState((prev) => ({
      ...prev,
      pendingApproval: null,
      phase: "cancelled",
      logs: [...prev.logs, makeLog("> ⛔ HUMAN REJECTED ACTION — AGENT STOPPED", "phase")],
    }));
    if (sessionId) {
      try {
        await fetch("/api/investigate/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, decision: "deny", reason: "User rejected" }),
        });
      } catch {
        // Best-effort cancel
      }
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, [state]);

  const cancel = useCallback(async () => {
    // First abort the fetch stream
    if (abortRef.current) {
      abortRef.current.abort();
    }

    // Also try server-side cancellation if we have a session ID
    const sessionId = state.sessionId;
    if (sessionId) {
      try {
        await fetch("/api/investigate/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
      } catch {
        // Best-effort cancel — frontend abort already happened
      }
    }

    setState((prev) => ({
      ...prev,
      phase: "cancelled",
      logs: [...prev.logs, makeLog("> INVESTIGATION CANCELLED BY USER", "phase")],
    }));
  }, [state.sessionId]);

  return {
    ...state,
    start,
    cancel,
    approveAction,
    rejectAction,
  };
}
