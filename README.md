# 🕵️ Domain Hunter — AI Brand Impersonation Agent

> **Built for The Agent Harness Hackathon 2026**  
> *"Give AI models a license to act"*

Domain Hunter is an AI-powered investigation agent that discovers, triages, and forensically analyses domains impersonating your brand — then keeps a human firmly in control of every consequential action.

A chatbot tells you there *might* be a phishing site. Domain Hunter **finds it, proves it, and waits for your approval before doing anything about it.**

---

## Problem

Brand impersonation costs companies billions every year. Phishing domains appear overnight — cloning login pages, harvesting credentials, and deceiving customers. Security teams have to manually monitor Certificate Transparency logs, WHOIS records, and DNS buffers, then cross-reference findings with web evidence before they can act.

This is exactly the kind of painful, multi-step, tool-heavy workflow that an AI agent should handle — with a human staying firmly in control at the moment of action.

---

## Solution

Domain Hunter is a **TrueForge agent** that runs an automated investigation pipeline:

```
User enters brand name
        ↓
TrueForge Agent starts
        ↓
Domain Discovery  (Certificate Transparency + DNS buffers)
        ↓
Domain Triage     (Registration date, IP geo, SSL check)
        ↓
Web Research      (EXA MCP — live web evidence)
        ↓
Sandbox Inspection (Daytona — safe code/DOM analysis)
        ↓
Evidence Review   (forensic classification per domain)
        ↓
Final Verdict     (confidence-scored dossier)
        ↓
⛔ HUMAN APPROVAL GATE ⛔
        ↓
Takedown Notice Dispatched
```

---

## Demo

> 📹 **[Watch the 3-minute demo video](#)** *(link — add after recording)*

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        User (Browser)                    │
│                    Next.js 15 UI (Port 3000)             │
└─────────────────┬───────────────────────────────────────┘
                  │  POST /api/investigate (brand)
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js API Route (route.ts)                │
│  Creates TrueForge session → starts turn → SSE proxy     │
└─────────────────┬───────────────────────────────────────┘
                  │  SSE event stream
                  ▼
┌─────────────────────────────────────────────────────────┐
│              TrueForge Agent Runtime (Port 8790)         │
│                  Agent: "domain-hunter"                  │
│                                                          │
│   ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│   │ Domain     │  │ Evidence   │  │  Final           │  │
│   │ Discovery  │  │ Reviewer   │  │  Assessment      │  │
│   │ Subagent   │  │ Subagent   │  │  Subagent        │  │
│   └─────┬──────┘  └─────┬──────┘  └──────────────────┘  │
│         │               │                                 │
│         ▼               ▼                                 │
│   ┌─────────────┐  ┌──────────────────────────────────┐  │
│   │  EXA MCP    │  │  Daytona Sandbox (code execution) │  │
│   │  web_search │  │  Safe DOM inspection, network     │  │
│   │  web_fetch  │  │  telemetry, JS analysis           │  │
│   └─────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                  │
                  ▼  tool.approval_required event
┌─────────────────────────────────────────────────────────┐
│              ⛔ HUMAN APPROVAL MODAL ⛔                  │
│   Agent STOPS — shows proposed action to user            │
│   [Authorize] → Agent continues                          │
│   [Reject]    → Agent stops, no action taken             │
└─────────────────────────────────────────────────────────┘
```

---

## How TrueForge Is Used

TrueForge is the **execution runtime** — not a chatbot wrapper. Removing TrueForge leaves zero investigation capability.

| TrueForge Capability | How Domain Hunter uses it |
|---|---|
| **Agent Sessions** | Each investigation creates a persistent TrueForge session (returned as `X-TrueForge-Session` header) |
| **MCP Tools** | EXA MCP provides `web_search_exa` + `web_fetch_exa` for live domain evidence |
| **Subagents** | Domain Discovery, Evidence Reviewer, and Final Assessment run as dedicated subagent threads |
| **Sandbox (Daytona)** | Generated DOM inspection code runs inside an isolated Daytona workspace |
| **Human Approval** | `tool.approval_required` TrueForge event gates action — UI hard-blocks until user responds |
| **Persistent Sessions** | Session ID preserved in state; cancel API calls TrueForge's server-side cancellation endpoint |
| **Skills** | Investigation protocol loaded from `SKILL.md` at agent start |
| **SSE Streaming** | Real-time event stream surfaces phase advances, tool calls, subagent starts to UI |

---

## MCP Tools

### EXA Search & Fetch

Configured in **TrueForge → Settings → Connectors**:

- **`web_search_exa`** — discovers public web evidence of phishing activity for each candidate domain  
- **`web_fetch_exa`** — fetches page content from suspicious domains for DOM analysis

> Set your EXA API key inside TrueForge's connector settings — not in this app's `.env`.

---

## Sandbox

Generated code for DOM inspection and network telemetry runs inside a **Daytona sandbox workspace** managed by TrueForge.

Configure the Daytona sandbox provider in:
```
TrueForge → Settings → Sandbox providers
```

The `sandbox.created` event is surfaced in the Live Telemetry Feed and advances the investigation phase indicator.

---

## Human Approval

When TrueForge fires a `tool.approval_required` event, Domain Hunter:

1. **Hard-pauses** the investigation (log shows `⛔ WAITING FOR HUMAN APPROVAL`)
2. **Surfaces a blocking modal** showing the proposed action and tool name
3. Waits for the user to click **[AUTHORIZE]** or **[REJECT]**
4. Calls back to TrueForge's session API to resume or cancel the agent turn

A second human authorization is required inside the **Takedown Modal** before any registrar abuse / DMCA / UDRP notice is dispatched.

---

## Subagents

The `domain-hunter` TrueForge agent spawns three subagents (visible via `thread.created` events):

| Subagent | Role |
|---|---|
| `domain-discovery` | Discovers candidate impersonating domains from CT logs and DNS |
| `evidence-reviewer` | Validates forensic evidence per domain |
| `final-assessment` | Compiles the confidence-scored dossier |

Each subagent start is shown as a highlighted badge in the Live Telemetry Feed.

---

## Setup

### Prerequisites

- Node.js 22+
- TrueForge running locally: `npx @truefoundry/trueforge`
- An EXA API key (for MCP web search)
- (Optional) Daytona account for sandbox execution

### 1. Clone the repo

```bash
git clone https://github.com/<your-handle>/domain-hunter
cd domain-hunter
```

### 2. Install dependencies

```bash
npm install
```

### 3. Copy environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
TRUEFORGE_URL=http://localhost:8790
```

### 4. Start TrueForge

```bash
npx @truefoundry/trueforge
```

Then open [http://localhost:8790](http://localhost:8790) and:

1. **Settings → Models** — add your model provider + API key
2. **Settings → Connectors** — add the EXA MCP server with your EXA API key
3. **Settings → Sandbox providers** — add Daytona (optional)
4. Create an agent named **`domain-hunter`** using these connectors

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TRUEFORGE_URL` | ✅ | URL of your local TrueForge instance (default: `http://localhost:8790`) |

> MCP API keys (EXA, etc.) are configured directly inside TrueForge — not in this app's `.env`.

---

## Running Locally

```bash
npm run dev      # Development server with hot reload
npm run build    # Production build
npm run lint     # ESLint check
```

---

## Example Workflow

1. Open [http://localhost:3000](http://localhost:3000)
2. Enter a brand name (e.g. `Stripe`) and click **START INVESTIGATION**
3. Watch the Live Telemetry Feed as TrueForge:
   - Creates a session
   - Spawns Domain Discovery subagent (shown as badge in feed)
   - Calls EXA MCP to search for suspicious domains
   - Runs Daytona sandbox to inspect page content
   - Spawns Evidence Reviewer subagent
4. When TrueForge reaches a consequential action, the UI **hard-pauses** and shows a Human Approval modal
5. **[Authorize]** → investigation continues | **[Reject]** → agent stops cleanly
6. Results page shows every domain with confidence scores, evidence, and classification
7. For suspicious domains, click **AUTHORIZE TAKEDOWN** to generate a registrar abuse / DMCA / UDRP notice

---

## Tech Stack

| Layer | Technology |
|---|---|
| Agent Runtime | TrueForge (`@truefoundry/trueforge-sdk ^0.1.3`) |
| Web Search | EXA (`web_search_exa`, `web_fetch_exa` via MCP) |
| Sandbox | Daytona (via TrueForge sandbox provider) |
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | TailwindCSS 3, custom brutalist design tokens |
| State Management | React hooks + SSE streaming |

---

## License

MIT
