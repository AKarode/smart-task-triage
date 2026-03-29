@AGENTS.md

## Project

Smart Triage — AI request triage copilot. Next.js 15 App Router + Vercel AI SDK 6 + OpenAI.

## Commands

```bash
npm run dev        # Start dev server on localhost:3000
npm run build      # Production build
npm run lint       # ESLint
```

## Stack

- Next.js 15 App Router (TypeScript)
- Vercel AI SDK 6 (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`)
- Tailwind CSS + shadcn/ui
- Zod for schema validation
- No database — in-memory state
- No external vector DB — in-memory embeddings via AI SDK `embed`

## Architecture

Single Next.js app. No separate backend.

- `/src/app/api/chat/route.ts` — POST handler using `streamText` with 3 tools
- `/src/lib/kb.ts` — loads markdown from `/kb`, chunks by paragraph, embeds with `text-embedding-3-small`, cosine similarity search
- `/src/lib/types.ts` — shared TypeScript interfaces
- `/src/lib/seed-requests.ts` — 10 synthetic demo requests
- `/src/lib/requests-store.ts` — in-memory request store (Map)
- `/kb/*.md` — 8 policy/SOP documents (the knowledge base)

## Key Patterns

### Tool Calling

Use `streamText` with tools object. Three tools:

1. `search_kb` — has `execute` function, auto-runs server-side. Calls `searchKB()` from lib/kb.ts.
2. `classify_request` — has `execute` function, auto-runs server-side. Returns classification object.
3. `draft_response` — NO `execute` function. This is a client-side tool. The SDK pauses and waits for the client to call `addToolOutput`. This is the human-in-the-loop approval gate.

### Client-Side Tool Handling

```typescript
// In the chat component, iterate message.parts
// Tool parts have a state: 'partial-call' | 'call' | 'partial-output' | 'output-available'
// When draft_response is in 'call' state, render approve/reject UI
// Call addToolOutput({ toolCallId, output }) to resume
```

### Embeddings

```typescript
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

// Embed KB chunks at startup
const { embeddings } = await embedMany({
  model: openai.embeddingModel('text-embedding-3-small'),
  values: chunks.map(c => c.content),
});

// Query embedding for search
const { embedding } = await embed({
  model: openai.embeddingModel('text-embedding-3-small'),
  value: query,
});
```

### useChat Hook

```typescript
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

const { messages, sendMessage, addToolOutput, status } = useChat({
  transport: new DefaultChatTransport({ api: '/api/chat' }),
});
```

## Code Style

- Functional components, no class components
- `'use client'` directive only where needed (components with hooks)
- Prefer named exports
- Use Zod for all schemas passed to AI SDK tools
- Use `clsx` + `tailwind-merge` for conditional classnames
- shadcn/ui components imported from `@/components/ui/*`

## Do NOT

- Use localStorage or sessionStorage
- Use AI SDK RSC (streamUI, createStreamableUI) — these are deprecated
- Use LangChain or LangGraph
- Install Chroma, Pinecone, or any external vector DB
- Create a separate Express/FastAPI backend
- Use `ToolLoopAgent` class — use `streamText` with tools directly
- Name anything "Shippy" or reference Blank Metal internals

## Environment

```
OPENAI_API_KEY=sk-...
```

## Testing the App

After building, these flows must work:
1. Select seed request → triage runs → classification card appears → KB results shown → draft appears with approve/reject
2. Approve draft → model acknowledges approval
3. Reject draft → model acknowledges and offers revision
4. Trace panel shows all 3 tool calls with timing
5. Custom request via form → same triage flow works
