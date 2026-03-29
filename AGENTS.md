<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Smart Triage Copilot

> This file provides full project context for AI coding assistants (Claude Code, Cursor, Copilot).
> Read this file FIRST before writing any code.

## Project Summary

**Smart Triage** is a full-stack Next.js application that triages incoming business requests using AI. It classifies requests, searches a knowledge base for relevant policies, routes to the right team, drafts a response, and requires human approval before finalizing. Every step is visible in a trace panel.

**Purpose:** Interview portfolio project for an Associate AI Engineer role at Blank Metal (AI-native engineering consultancy, Vercel Solution Partner).

**Core Demo Flow:**
1. User submits a request (simulating a support ticket, ops question, or sales inquiry)
2. AI classifies it (category + priority + queue)
3. AI searches a small markdown knowledge base for relevant policy snippets
4. AI drafts a response grounded in those snippets
5. Human reviews and approves/rejects the draft
6. Trace panel shows every step with timing

## Tech Stack — DO NOT DEVIATE

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| AI SDK | Vercel AI SDK | 6.x (`ai` package) |
| AI Provider | OpenAI via `@ai-sdk/openai` | Latest |
| Model | `gpt-4o` (default, configurable via env) | - |
| UI | Tailwind CSS + shadcn/ui | Latest |
| State | In-memory (Map/Array) for weekend scope | - |
| Embeddings | AI SDK `embed` / `embedMany` + cosine similarity | - |
| Deployment | Vercel | - |

## Key Architectural Decisions

1. **NO separate backend.** Everything runs in Next.js API routes (App Router `route.ts` files).
2. **NO external vector database.** Embed the KB at startup using AI SDK's `embed`, store vectors in memory, do cosine similarity search. This is intentional — keeps infra simple.
3. **NO database.** Use in-memory Maps/Arrays. Mention Postgres/Vercel KV as production next steps in README.
4. **Use `streamText` with tools, NOT `ToolLoopAgent`.** The `streamText` + tools pattern is more battle-tested for chat UIs. Mention ToolLoopAgent as a refactor path.
5. **Use `needsApproval` for the draft_response tool.** This is the human-in-the-loop gate.
6. **Provider-agnostic design.** Use string model IDs so switching to Anthropic is a one-line change.

## File Structure

```
smart-triage/
├── AGENTS.md                          # THIS FILE — agent context
├── CLAUDE.md                          # Claude Code instructions
├── README.md                          # Project readme with arch diagram
├── .env.local.example                 # Environment variable template
├── package.json
├── tsconfig.json
├── next.config.ts
├── src/
│   └── app/
│       ├── layout.tsx                 # Root layout with font + providers
│       ├── page.tsx                   # Main dashboard page
│       ├── globals.css                # Tailwind base styles
│       └── api/
│           └── chat/
│               └── route.ts          # POST handler: streamText + tools
├── components/
│   ├── request-form.tsx              # Form to create new requests
│   ├── request-list.tsx              # Sidebar list of requests
│   ├── chat-interface.tsx            # Main chat area using useChat
│   ├── triage-result.tsx             # Displays classification result
│   ├── approval-card.tsx             # Approve/reject UI for drafts
│   └── trace-panel.tsx              # Shows tool call trace with timing
├── lib/
│   ├── kb.ts                         # Knowledge base loader + vector search
│   ├── embeddings.ts                 # Embedding + cosine similarity utilities
│   ├── types.ts                      # Shared TypeScript types
│   ├── requests-store.ts            # In-memory request store
│   └── seed-requests.ts             # 10 synthetic demo requests
└── kb/
    ├── refund-policy.md
    ├── escalation-guide.md
    ├── onboarding-process.md
    ├── security-incident-response.md
    ├── sla-guidelines.md
    ├── vendor-management.md
    ├── employee-pto-policy.md
    └── data-access-requests.md
```

## Implementation Details by File

### `/src/app/api/chat/route.ts` — The Core Route

This is the most important file. Pattern to follow:

```typescript
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { searchKB } from '@/lib/kb';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: `You are a request triage assistant for an enterprise operations team.
Your job is to:
1. Classify incoming requests by category, priority, and team queue
2. Search the knowledge base for relevant policies using the search_kb tool
3. Draft a response grounded in the retrieved policies
4. Present the draft for human approval using the draft_response tool

ALWAYS search the knowledge base before drafting a response.
ALWAYS cite which policy documents informed your draft.
Be concise and actionable.`,
    messages: await convertToModelMessages(messages),
    tools: {
      search_kb: {
        description: 'Search internal knowledge base for relevant policies, SOPs, and guidelines.',
        inputSchema: z.object({
          query: z.string().describe('Search query describing what policy or guideline you need'),
        }),
        execute: async ({ query }) => {
          const results = await searchKB(query);
          return results;
        },
      },
      classify_request: {
        description: 'Classify a request into a category, priority level, and recommended team queue.',
        inputSchema: z.object({
          category: z.enum(['billing', 'technical', 'security', 'hr', 'ops', 'sales', 'general']),
          priority: z.enum(['low', 'medium', 'high', 'critical']),
          queue: z.string().describe('Team or queue to route this request to'),
          reasoning: z.string().describe('Brief explanation of why this classification was chosen'),
        }),
        execute: async (input) => {
          return { classified: true, ...input };
        },
      },
      draft_response: {
        description: 'Draft a response to send back to the requester. This requires human approval before sending.',
        inputSchema: z.object({
          draft: z.string().describe('The draft response text'),
          cited_policies: z.array(z.string()).describe('List of KB document names that informed this draft'),
          confidence: z.number().min(0).max(1).describe('Confidence score for this draft (0-1)'),
        }),
        // NO execute function — this is a client-side tool requiring approval
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
```

**CRITICAL:** The `draft_response` tool has NO `execute` function. This makes it a client-side tool that pauses for user interaction. The client renders approve/reject buttons and calls `addToolOutput` to resume.

### `/lib/kb.ts` — Knowledge Base with Embeddings

```typescript
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import fs from 'fs';
import path from 'path';

interface KBChunk {
  docName: string;
  content: string;
  embedding: number[];
}

let kbChunks: KBChunk[] = [];
let initialized = false;

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function chunkMarkdown(content: string, docName: string): { docName: string; content: string }[] {
  return content
    .split(/\n\n+/)
    .filter(chunk => chunk.trim().length > 50)
    .map(chunk => ({ docName, content: chunk.trim() }));
}

export async function initializeKB() {
  if (initialized) return;
  const kbDir = path.join(process.cwd(), 'kb');
  const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.md'));

  const allChunks: { docName: string; content: string }[] = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(kbDir, file), 'utf-8');
    allChunks.push(...chunkMarkdown(content, file));
  }

  const { embeddings } = await embedMany({
    model: openai.embeddingModel('text-embedding-3-small'),
    values: allChunks.map(c => c.content),
  });

  kbChunks = allChunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i],
  }));

  initialized = true;
}

export async function searchKB(query: string, topK = 4) {
  await initializeKB();
  const { embedding: queryEmbedding } = await embed({
    model: openai.embeddingModel('text-embedding-3-small'),
    value: query,
  });

  const scored = kbChunks
    .map(chunk => ({
      docName: chunk.docName,
      content: chunk.content,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return scored.map(s => ({
    source: s.docName,
    content: s.content,
    relevance: Math.round(s.similarity * 100) / 100,
  }));
}
```

### Client-Side Tool Handling Pattern

When the model calls `draft_response`, the SDK sends a tool part with state `'partial-call'` → `'call'`. Since there's no server execute function, the client must handle it:

```typescript
{message.parts?.map((part, i) => {
  if (part.type.startsWith('tool-') && part.state === 'call') {
    if (part.toolInvocation.toolName === 'draft_response') {
      return (
        <ApprovalCard
          key={i}
          draft={part.toolInvocation.input.draft}
          citedPolicies={part.toolInvocation.input.cited_policies}
          confidence={part.toolInvocation.input.confidence}
          onApprove={() => {
            addToolOutput({
              toolCallId: part.toolInvocation.toolCallId,
              output: { approved: true, approvedAt: new Date().toISOString() },
            });
          }}
          onReject={() => {
            addToolOutput({
              toolCallId: part.toolInvocation.toolCallId,
              output: { approved: false, reason: 'Rejected by reviewer' },
            });
          }}
        />
      );
    }
  }
})}
```

**NOTE:** The exact part type format in AI SDK 6 uses `part.type` as a string like `'tool-draft_response'`. Check the part's `state` property: `'partial-call'`, `'call'`, `'partial-output'`, `'output-available'`. Render approval UI when state is `'call'` (tool was called but no output yet).

## AI SDK 6 Import Reference

```typescript
// Server
import { streamText, convertToModelMessages, UIMessage, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Client
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
```

## Tool Part States in message.parts

- `'partial-call'` — tool is being called (streaming)
- `'call'` — tool call complete, waiting for execution/approval
- `'partial-output'` — output is streaming
- `'output-available'` — tool execution complete, output available

For client-side tools (no execute fn), render UI when state is `'call'`.
After user action, call `addToolOutput({ toolCallId, output })`.

## Styling Guidelines

- Use shadcn/ui components: Card, Button, Badge, ScrollArea, Separator
- Color-code priorities: critical=red, high=orange, medium=yellow, low=green
- Use monospace font for trace timing data
- Keep the layout responsive but optimize for desktop (1200px+)
- Minimal animations — this is an enterprise tool, not a consumer app

## Seed Requests (10 synthetic)

Store in `/lib/seed-requests.ts`. Each request has:
```typescript
interface SeedRequest {
  id: string;
  channel: 'email' | 'slack' | 'web';
  subject: string;
  message: string;
  createdAt: string;
}
```

Include a mix: 2 billing, 2 technical, 2 security, 1 HR, 1 ops, 1 sales, 1 general.

## Environment Variables

```
OPENAI_API_KEY=sk-...
# Optional: override model
OPENAI_MODEL=gpt-4o
```

## What NOT To Do

- Do NOT use `localStorage` or `sessionStorage`
- Do NOT install Chroma, Pinecone, or any external vector DB
- Do NOT create a separate FastAPI/Express backend
- Do NOT use the deprecated AI SDK RSC (`streamUI`, `createStreamableUI`)
- Do NOT use LangChain or LangGraph — use AI SDK native tools
- Do NOT over-engineer — no RBAC, no auth, no real database
- Do NOT name the project "Shippy" or reference Blank Metal's internal tools

## What TO Do

- Use `streamText` + tools pattern from AI SDK 6 docs
- Use `needsApproval` pattern (client-side tool with no execute fn) for HITL
- Use `embed`/`embedMany` from AI SDK for vector search
- Show tool execution trace in the UI with timing
- Handle errors gracefully — show error states, not crashes
- Make the provider configurable (env var) so it's trivially swappable
- Write a great README with architecture diagram and talking points
- Deploy to Vercel

## Testing the Demo

After building, verify these flows work:
1. Submit a billing-related request → should classify as billing/high → search refund policy → draft response citing it → show approval card
2. Submit a security incident → should classify as security/critical → search incident response doc → draft with escalation steps
3. Reject a draft → model should acknowledge rejection and offer to revise
4. Check trace panel shows all tool calls with timing for each request
