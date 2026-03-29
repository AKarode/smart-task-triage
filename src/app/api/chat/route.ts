import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { searchKB } from '@/lib/kb';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai(process.env.OPENAI_MODEL || 'gpt-4o'),
    system: `You are a request triage assistant for an enterprise operations team.
Your job is to:
1. Classify incoming requests by category, priority, and team queue using the classify_request tool
2. Search the knowledge base for relevant policies using the search_kb tool
3. Draft a response grounded in the retrieved policies using the draft_response tool

ALWAYS use all three tools in sequence: classify first, then search, then draft.
ALWAYS search the knowledge base before drafting a response.
ALWAYS cite which policy documents informed your draft.
Be concise and actionable.`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
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
      draft_response: {
        description: 'Draft a response to send back to the requester. This requires human approval before sending.',
        inputSchema: z.object({
          draft: z.string().describe('The draft response text'),
          cited_policies: z.array(z.string()).describe('List of KB document names that informed this draft'),
          confidence: z.number().min(0).max(1).describe('Confidence score for this draft (0-1)'),
        }),
        // NO execute function — client-side tool requiring human approval
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
