# INTERVIEW_PREP.md

> Talking points and anticipated questions for the Blank Metal Associate AI Engineer interview.
> This is NOT to be included in the repo — this is for your personal prep.

## 60-Second Project Pitch

"I built an AI-powered request triage tool over the weekend using Next.js and the Vercel AI SDK. When a request comes in — like a support ticket or an ops question — the system searches an internal knowledge base using embeddings, classifies the request by category and priority, and drafts a grounded response with citations. The draft requires human approval before it goes out. Everything streams in real-time, and there's a trace panel showing every tool call with timing. I chose this stack because the AI SDK gives me tool calling, streaming, and human-in-the-loop as native primitives — no orchestration framework needed for a workflow this straightforward."

## Anticipated Questions + Answers

### "Why didn't you use LangGraph or LangChain?"

"For a 3-tool sequential workflow, LangGraph would add orchestration overhead without meaningful benefit. The AI SDK's streamText with tool calling handles the sequence naturally — the model decides tool order, and the needsApproval pattern gives me the human gate. If the workflow had complex branching, parallel tool execution, or state that needed to persist across sessions, LangGraph would be the right call. I'd be excited to use it on a project where that complexity is warranted."

### "How would you add persistence?"

"I'd swap the in-memory stores for Postgres — requests table, runs table, trace_events table. For the vector search, pgvector on the same Postgres instance keeps the stack simple. Vercel Postgres or Supabase would both work since they're Vercel-ecosystem. The API contracts wouldn't change — just the storage layer behind them."

### "What if the knowledge base grows to 10,000 documents?"

"At that scale, in-memory embeddings break down. I'd move to pgvector or a dedicated vector database like Pinecone. I'd also add chunking strategy improvements — overlapping windows instead of paragraph splitting, and metadata filtering so the search can narrow by document type before doing similarity. The AI SDK's embed function stays the same; only the retrieval backend changes."

### "How do you know the AI is giving good answers?"

"Right now, the trace panel gives operator visibility into what was retrieved and what was classified. For systematic evaluation, I'd build an eval harness: a set of 20-30 test requests with expected classifications and reference responses. Run the agent against the golden set, use an LLM-as-judge to score the draft quality, and track accuracy over time. The key metrics would be classification accuracy, retrieval relevance, and draft groundedness — whether the draft actually uses the retrieved policy content."

### "What would you do differently with more time?"

"Three things. First, an eval suite — it's the most important missing piece for production confidence. Second, I'd refactor to use the ToolLoopAgent class so the agent definition is reusable across different routes and contexts. Third, I'd add streaming metadata to the trace panel — right now timing is approximate, but the AI SDK supports event callbacks that could give precise step-level telemetry."

### "Tell me about a technical decision you'd push back on."

"If someone asked me to auto-execute the draft without approval to make the demo faster, I'd push back. In enterprise workflows, AI drafts that go out unreviewed create liability and erode trust. The approval gate is a feature, not a speed bump. I'd rather show a slightly slower demo that reflects how production AI should work."

### "Why Blank Metal?"

"I'm drawn to the model of shipping production AI fast with small, senior teams — that's how I want to learn. Most consulting firms have junior people doing the bulk of the work. Here, the associate is pair-programming with senior engineers on real client deliverables. I'll learn more in 6 months doing that than in 2 years at a place where I'm writing test cases. I'm also excited about the breadth — working across different industries and problem types means I'd build pattern recognition faster."

### "You asked for $110K — the range is $77-100K."

"I appreciate you sharing that. I was operating without the range when I submitted that number. The growth opportunity here — learning production AI patterns from your team, working across client engagements — is worth more to me than a salary delta. I'd be happy at the top of band, around $95-100K, and I plan to earn my way to the next level quickly."

## Things to Reference About Blank Metal (Naturally, Don't Force)

- Their Anthropic healthcare partnership (Jan 2026) — shows they work with multiple providers
- The "capability decomposition" framing from their Feb 2026 blog — shift from "automate tasks" to "map capabilities"
- Shippy's four layers: ambient capture, intelligence core, custom web apps, agent suite
- Their AI Sprint methodology — 2-week validation sprints shipping working prototypes
- The Vertical Insure case: validation layers + monitoring + caching turned unreliable AI into 95% accuracy
- The Parallax case: pricing coach built with LangGraph + OpenAI in 5 weeks

## Body Language / Tone

- You're an associate. Show humility and curiosity, not senior architect energy.
- Ask them questions about their patterns: "How do you approach observability on client projects?"
- When they point out something you could improve, say "That's a great point — I'd love to learn how you handle that" not "Yeah I was going to do that but ran out of time"
- Show excitement about the learning trajectory, not about being the smartest person in the room
