# IMPLEMENTATION_CHECKLIST.md

> Use this as your build order. Check off each item as you complete it.
> Estimated total: 14-18 hours.

## Phase 1: Scaffold (Saturday 9-10am, ~1hr)

- [ ] `npx create-next-app@latest smart-triage --typescript --tailwind --app --src-dir=false`
- [ ] Install deps: `npm install ai @ai-sdk/openai @ai-sdk/react zod`
- [ ] Install shadcn: `npx shadcn@latest init` then add: `button card badge scroll-area separator input textarea tabs`
- [ ] Create `.env.local` with `OPENAI_API_KEY`
- [ ] Create the `/kb` directory and add all 8 markdown files from KB_SEED_DOCS.md
- [ ] Copy `AGENTS.md` into project root
- [ ] Verify `npm run dev` works

## Phase 2: Knowledge Base + Embeddings (Saturday 10am-12pm, ~2hrs)

- [ ] Create `/lib/types.ts` with all shared types
- [ ] Create `/lib/embeddings.ts` with cosine similarity utility
- [ ] Create `/lib/kb.ts` with markdown loading, chunking, and embedding logic
- [ ] Test KB initialization: create a temp API route that calls `searchKB("refund")` and logs results
- [ ] Verify embedding works — should return ranked chunks from refund-policy.md

## Phase 3: Core API Route + Tools (Saturday 1-3pm, ~2hrs)

- [ ] Create `/app/api/chat/route.ts` with `streamText` + all 3 tools
- [ ] `search_kb` tool: auto-executed, calls `searchKB()` from lib
- [ ] `classify_request` tool: auto-executed, returns classification object
- [ ] `draft_response` tool: NO execute function (client-side approval)
- [ ] Write system prompt that instructs the agent to use tools in sequence
- [ ] Test with curl or a minimal page — verify tool calls stream back

## Phase 4: Seed Data (Saturday 3-3:30pm, ~30min)

- [ ] Create `/lib/seed-requests.ts` with 10 synthetic requests
- [ ] Create `/lib/requests-store.ts` — simple in-memory store (Map)

## Phase 5: UI Shell (Saturday 3:30-6pm, ~2.5hrs)

- [ ] Create `/app/layout.tsx` — root layout with Inter font, dark/light support
- [ ] Create `/app/page.tsx` — three-column layout (sidebar, main, trace)
- [ ] Create `/components/request-list.tsx` — clickable list with priority badges
- [ ] Create `/components/request-form.tsx` — simple form to create custom requests
- [ ] Create `/components/chat-interface.tsx` — `useChat` hook integration
- [ ] Verify: selecting a request populates the chat and triggers triage

## Phase 6: Tool UI Components (Saturday 7-9pm, ~2hrs)

- [ ] Create `/components/triage-result.tsx` — card showing category/priority/queue
- [ ] Create `/components/approval-card.tsx` — draft display + approve/reject buttons
- [ ] Create `/components/trace-panel.tsx` — timeline of tool calls with timing
- [ ] Wire up `addToolOutput` for approve/reject flow
- [ ] Verify full flow: submit → classify → search → draft → approve

## Phase 7: Polish + Reliability (Sunday 9am-12pm, ~3hrs)

- [ ] Error handling: wrap API route in try/catch, show error states in UI
- [ ] Loading states: skeleton/spinner while triage runs
- [ ] Streaming: ensure text streams visibly (not just a loading → result jump)
- [ ] Handle rejection: when user rejects draft, model should acknowledge and offer revision
- [ ] KB citation display: show which documents were retrieved with relevance scores
- [ ] Mobile-responsive: at minimum don't break on smaller screens

## Phase 8: Trace Panel Detail (Sunday 12-1:30pm, ~1.5hrs)

- [ ] Extract timing from tool parts (use metadata or compute from timestamps)
- [ ] Show each tool call as a timeline entry: name, status icon, duration
- [ ] Show tool inputs/outputs in collapsible sections
- [ ] Show token estimate (can be approximate — count message length)

## Phase 9: Deploy + README (Sunday 2-4pm, ~2hrs)

- [ ] Push to GitHub
- [ ] Connect to Vercel, deploy
- [ ] Verify deployed version works (env vars set in Vercel dashboard)
- [ ] Finalize README with live URL
- [ ] Add screenshots or a short demo description
- [ ] Review AGENTS.md is included in repo

## Phase 10: Demo Script (Sunday 4-5pm, ~1hr)

- [ ] Practice the demo flow 3 times
- [ ] Write down 3 talking points you can deliver in 60 seconds each
- [ ] Prepare for questions: "Why not LangGraph?" / "How would you add persistence?" / "What if the KB grows to 10k docs?"

---

# Seed Requests Data

Copy this into `/lib/seed-requests.ts`:

```typescript
export interface SeedRequest {
  id: string;
  channel: 'email' | 'slack' | 'web';
  subject: string;
  message: string;
  createdAt: string;
}

export const seedRequests: SeedRequest[] = [
  {
    id: 'req-001',
    channel: 'email',
    subject: 'Requesting refund for last month charge',
    message: 'Hi, I was charged $249 for the Pro plan last month but I cancelled my subscription on the 3rd. I never used the service after cancellation. Can I get a full refund? My order number is ORD-88421.',
    createdAt: '2026-03-27T09:15:00Z',
  },
  {
    id: 'req-002',
    channel: 'slack',
    subject: 'Production API returning 500 errors',
    message: 'Our production integration has been returning intermittent 500 errors for the last 30 minutes. Affecting approximately 15% of requests. We are on the Enterprise tier. This is impacting our checkout flow. Need immediate assistance.',
    createdAt: '2026-03-27T10:02:00Z',
  },
  {
    id: 'req-003',
    channel: 'web',
    subject: 'Suspicious login attempts on admin account',
    message: 'I noticed 47 failed login attempts on our admin account from an IP address in a country where we have no employees. The attempts happened between 2am and 4am EST. Our account is currently locked. Is there a way to check if any data was accessed?',
    createdAt: '2026-03-27T08:30:00Z',
  },
  {
    id: 'req-004',
    channel: 'email',
    subject: 'New hire starting Monday needs system access',
    message: 'We have a new software engineer starting Monday March 31st. Name: Jordan Rivera. They need access to GitHub, Jira, Slack, and staging environments. Their manager is Sarah Chen in the Platform team. Can you make sure everything is provisioned before their start date?',
    createdAt: '2026-03-27T14:00:00Z',
  },
  {
    id: 'req-005',
    channel: 'slack',
    subject: 'Need access to customer analytics database',
    message: 'I need read access to the customer analytics database for a quarterly business review presentation. Specifically need the usage_metrics and revenue_by_segment tables. My manager (Lisa Park, VP Sales) has approved this verbally. How do I formally request this?',
    createdAt: '2026-03-27T11:45:00Z',
  },
  {
    id: 'req-006',
    channel: 'web',
    subject: 'Vendor security questionnaire needs completion',
    message: 'One of our vendors (CloudSync Corp) sent us their annual security questionnaire. It needs to be completed by April 15th. The questionnaire covers data handling practices, encryption standards, and incident response procedures. Who should I route this to?',
    createdAt: '2026-03-27T13:20:00Z',
  },
  {
    id: 'req-007',
    channel: 'email',
    subject: 'Enterprise pricing inquiry from Acme Corp',
    message: 'Acme Corp (Fortune 500, manufacturing sector) reached out asking about enterprise pricing for 500+ seats. They are currently using a competitor and their contract ends in Q3. They want a demo next week and a custom pricing proposal. Who handles enterprise deals of this size?',
    createdAt: '2026-03-27T15:30:00Z',
  },
  {
    id: 'req-008',
    channel: 'slack',
    subject: 'PTO request question — blackout period',
    message: 'I want to take a week off from April 14-18 but I heard there might be a product launch blackout period around that time. Can someone clarify the blackout dates? Also, do I need extra approval since it is more than 3 days?',
    createdAt: '2026-03-27T09:50:00Z',
  },
  {
    id: 'req-009',
    channel: 'web',
    subject: 'Billing discrepancy on latest invoice',
    message: 'Our latest invoice (INV-2026-0342) shows a charge of $12,400 but our contract rate should be $9,800/month. The difference appears to be overage charges but we have not exceeded our usage limits according to our dashboard. Can someone review this?',
    createdAt: '2026-03-27T16:10:00Z',
  },
  {
    id: 'req-010',
    channel: 'email',
    subject: 'Phishing email reported by marketing team',
    message: 'Three people on the marketing team received an email claiming to be from our CEO asking them to purchase gift cards. One person clicked the link but did not enter any information. The email came from ceo@company-secure.net which is not our domain. What should we do?',
    createdAt: '2026-03-27T12:15:00Z',
  },
];
```

---

# Types Definition

Copy this into `/lib/types.ts`:

```typescript
export interface TriageRequest {
  id: string;
  channel: 'email' | 'slack' | 'web';
  subject: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'triaging' | 'awaiting_approval' | 'approved' | 'rejected';
}

export interface KBSearchResult {
  source: string;
  content: string;
  relevance: number;
}

export interface Classification {
  category: string;
  priority: string;
  queue: string;
  reasoning: string;
}

export interface DraftResponse {
  draft: string;
  cited_policies: string[];
  confidence: number;
}

export interface TraceEntry {
  toolName: string;
  status: 'running' | 'complete' | 'error' | 'awaiting_approval';
  startTime: number;
  endTime?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}
```

---

# Environment Variables

Copy this to `.env.local.example`:

```
# Required: Your OpenAI API key
OPENAI_API_KEY=sk-your-key-here

# Optional: Override the default model (gpt-4o)
# OPENAI_MODEL=gpt-4o-mini
```

---

# Package.json Dependencies

When you run `create-next-app`, add these dependencies:

```json
{
  "dependencies": {
    "ai": "^6.0.0",
    "@ai-sdk/openai": "^1.0.0",
    "@ai-sdk/react": "^1.0.0",
    "zod": "^3.23.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  }
}
```

Plus whatever shadcn/ui adds automatically.
