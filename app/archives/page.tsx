"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PAST_ARCHIVES, generateDynamicInvestigation } from "@/lib/investigation-data";
import { useRouter } from "next/navigation";

export default function ArchivesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredArchives = PAST_ARCHIVES.filter((item) => {
    const matchesSearch =
      item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.targetDomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || item.status.includes(statusFilter);
    return matchesSearch && matchesStatus;
  });

  const handleReopenCase = (brandName: string) => {
    const dynamicCase = generateDynamicInvestigation(brandName);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_case", JSON.stringify(dynamicCase));
    }
    router.push("/evidence");
  };

  return (
    <div className="flex-1 p-4 md:p-8 relative overflow-x-hidden">
      {/* Header */}
      <header className="mb-10 relative">
        <div className="inline-block bg-surface border-4 border-on-background px-4 py-2 shadow-brutal -rotate-1 mb-2">
          <h1 className="font-headline-xl text-3xl sm:text-4xl uppercase text-on-background flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary font-bold">
              inventory_2
            </span>
            EVIDENCE ROOM &amp; CASE ARCHIVES
          </h1>
        </div>
        <p className="font-data-mono text-xs sm:text-sm text-on-surface-variant max-w-xl">
          Historical repository of sealed investigations, registrar takedown filings, and neutralised brand impersonation networks.
        </p>
      </header>

      {/* Filter and Search Controls */}
      <div className="bg-surface border-border-width-thick border-on-background p-4 shadow-brutal mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center rotate-0.5">
        <div className="flex items-center bg-white border-2 border-on-background px-3 py-1.5 w-full sm:w-80 shadow-brutal-xs">
          <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH CASES BY BRAND / DOMAIN..."
            className="w-full bg-transparent border-none font-data-mono text-xs uppercase outline-none"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["ALL", "TAKEDOWN", "DISMANTLED", "SUSPENDED", "BLOCKED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 font-label-caps text-[11px] font-bold border-2 border-on-background transition-all ${
                statusFilter === st
                  ? "bg-primary text-on-primary shadow-brutal-xs -rotate-1"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArchives.map((caseItem, idx) => (
          <div
            key={caseItem.id}
            className={`bg-surface border-border-width-thick border-on-background p-6 shadow-brutal relative transition-transform hover:scale-[1.01] ${
              idx % 2 === 0 ? "-rotate-0.5" : "rotate-0.5"
            }`}
          >
            {/* Top Tape Sticker */}
            <div className="absolute -top-3 right-6 bg-retro-yellow border-2 border-on-background font-label-caps text-[10px] px-3 py-0.5 font-black rotate-2 shadow-brutal-xs">
              CASE RECORD: {caseItem.id.toUpperCase()}
            </div>

            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-label-caps text-xs text-on-surface-variant font-bold">
                  TARGET BRAND
                </span>
                <h3 className="font-headline-lg text-2xl uppercase text-primary font-black">
                  {caseItem.brandName}
                </h3>
              </div>
              <div className="text-right">
                <span className="font-data-mono text-[10px] text-on-surface-variant font-bold block">
                  THREAT SCORE
                </span>
                <span className="font-headline-md text-xl text-error font-black">
                  {caseItem.threatScore}%
                </span>
              </div>
            </div>

            <div className="bg-surface-container p-3 border-2 border-on-background font-data-mono text-xs mb-4 space-y-1">
              <div>
                <span className="text-on-surface-variant font-bold">SEIZED DOMAIN:</span>{" "}
                <span className="text-tertiary font-bold break-all">{caseItem.targetDomain}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>
                  STATUS: <strong className="text-retro-green">{caseItem.status}</strong>
                </span>
                <span>
                  DATE: <strong>{caseItem.date}</strong>
                </span>
              </div>
              <div className="text-[11px] text-on-surface-variant">
                INVESTIGATOR: {caseItem.resolvedBy} • {caseItem.findings} Sealed Evidence Bundles
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleReopenCase(caseItem.brandName)}
                className="flex-1 bg-primary-container text-on-primary-container border-2 border-on-background py-2 font-headline-sm text-xs uppercase btn-brutal flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-base">visibility</span>
                INSPECT CASE FORENSICS
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
