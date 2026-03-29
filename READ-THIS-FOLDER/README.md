# Smart Triage — AI Request Triage Copilot

An AI-powered internal tool that classifies incoming requests, retrieves relevant policies from a knowledge base, drafts responses, and requires human approval before finalizing. Built with Next.js, Vercel AI SDK 6, and OpenAI.

## Live Demo

→ [Deployed on Vercel](https://smart-triage.vercel.app) *(update after deployment)*

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                         │
│                                                               │
│  ┌──────────┐   ┌──────────────────┐   ┌──────────────────┐ │
│  │ Request   │   │  Chat Interface  │   │  Trace Panel     │ │
│  │ List      │   │  (useChat hook)  │   │  (tool call log) │ │
│  │           │   │                  │   │                  │ │
│  │ Seed data │   │ ┌──────────────┐ │   │ • search_kb ✓    │ │
│  │ + new     │   │ │ Triage Result│ │   │   142ms          │ │
│  │ requests  │   │ └──────────────┘ │   │ • classify ✓     │ │
│  │           │   │ ┌──────────────┐ │   │   89ms           │ │
│  │           │   │ │ Approval Card│ │   │ • draft ⏳       │ │
│  │           │   │ │ [Approve]    │ │   │   awaiting human │ │
│  │           │   │ │ [Reject]     │ │   │                  │ │
│  │           │   │ └──────────────┘ │   │ Tokens: 1,847    │ │
│  └──────────┘   └────────┬─────────┘   └──────────────────┘ │
│                          │                                    │
│              ┌───────────▼───────────┐                        │
│              │  /api/chat (route.ts) │                        │
│              │  streamText + tools   │                        │
│              └───┬──────┬──────┬─────┘                        │
│                  │      │      │                              │
│          ┌───────▼┐ ┌──▼────┐ ┌▼──────────┐                  │
│          │search  │ │classi │ │draft      │                  │
│          │_kb     │ │fy     │ │_response  │                  │
│          │(auto)  │ │(auto) │ │(approval) │                  │
│          └───┬────┘ └───────┘ └───────────┘                  │
│              │                                                │
│      ┌───────▼────────┐                                      │
│      │  KB Vector      │                                      │
│      │  Search          │                                      │
│      │  (in-memory      │                                      │
│      │   embeddings)    │                                      │
│      └─────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
                          │
                   ┌──────▼──────┐
                   │  OpenAI API │
                   │  gpt-4o +   │
                   │  embeddings │
                   └─────────────┘
```

## Quick Start

```bash
git clone <repo-url>
cd smart-triage
npm install
cp .env.local.example .env.local
# Add your OPENAI_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. **Submit a request** — Select a seed request or write your own (simulating a Slack message or support ticket)
2. **AI triages** — The agent calls three tools in sequence:
   - `search_kb`: Embeds the query, performs cosine similarity against the knowledge base, returns top-K policy chunks with citations
   - `classify_request`: Categorizes by type (billing, security, HR, etc.), assigns priority, and routes to a team queue
   - `draft_response`: Produces a draft reply grounded in the retrieved policies
3. **Human approves** — The draft pauses for review. Approve to finalize, or reject to have the AI revise
4. **Trace panel** — Every tool call is visible: inputs, outputs, timing, and token estimates

## Design Decisions

**Why AI SDK 6 with `streamText` + tools (not LangGraph or LangChain)?**
The Vercel AI SDK provides native tool calling, streaming, and human-in-the-loop via `needsApproval` — all in TypeScript, all deployed on Vercel's edge. No Python service, no orchestration framework, no extra infrastructure. For a request triage workflow with 3 tools, this is the right level of abstraction. LangGraph would be warranted for more complex state machines with branching/looping.

**Why in-memory embeddings (not Pinecone/Chroma)?**
The knowledge base is ~8 documents, chunked into ~40-60 paragraphs. At this scale, cosine similarity over in-memory vectors runs in <5ms. Adding a vector DB would increase architectural complexity without measurable benefit. Production version would use pgvector on Postgres for persistence and scale.

**Why `needsApproval` for the draft tool?**
In enterprise workflows, AI should not take irreversible actions without human review. The AI SDK's tool approval pattern provides this as a first-class primitive — the tool call pauses, the client renders approve/reject UI, and the agent resumes only after human input. No custom approval service needed.

**Why provider-agnostic?**
The model is configured via environment variable. Switching from OpenAI to Anthropic requires changing `OPENAI_MODEL` to an Anthropic model string and swapping the provider import. This is intentional — enterprise clients have model preferences, and a good AI system doesn't lock you in.

**Why trace visibility?**
Observability is the difference between a demo and a production system. Every tool call, its inputs, outputs, and execution time are rendered in the trace panel. This enables debugging, cost estimation, and audit trails — patterns that matter in enterprise deployments.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **AI:** Vercel AI SDK 6 (`ai` + `@ai-sdk/openai`)
- **Model:** OpenAI gpt-4o (configurable)
- **Embeddings:** text-embedding-3-small via AI SDK
- **UI:** Tailwind CSS + shadcn/ui
- **Deployment:** Vercel

## Knowledge Base

The `/kb` directory contains 8 synthetic SOP/policy documents covering billing, security, HR, ops, and vendor management. These are chunked by paragraph and embedded at startup. In production, this would be connected to a document management system or CMS.

## Production Next Steps

If I were taking this to production, I would:
1. **Add Postgres + pgvector** for persistent vector storage and request history
2. **Refactor to `ToolLoopAgent`** for reusable agent definitions across API routes
3. **Add an eval harness** — 20 test requests with expected classifications, run nightly, track accuracy over time
4. **Implement LLM-as-judge evaluation** for draft quality scoring
5. **Add structured logging** via OpenTelemetry for production observability
6. **Add authentication** and role-based approval workflows
7. **Connect to real intake channels** (Slack webhook, email parser) instead of seed data

## License

MIT
