'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isToolUIPart } from 'ai';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TriageResult } from './triage-result';
import { ApprovalCard } from './approval-card';
import { Search, Tag, FileText, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SeedRequest } from '@/lib/seed-requests';
import type { TraceEntry } from '@/lib/types';

interface ChatInterfaceProps {
  request: SeedRequest | null;
  onTraceUpdate: (entries: TraceEntry[]) => void;
}

// Extract tool name from part type (e.g., "tool-classify_request" -> "classify_request")
function getToolName(part: { type: string; toolName?: string }): string {
  if ('toolName' in part && part.toolName) return part.toolName;
  return part.type.replace(/^tool-/, '');
}

const toolIcons: Record<string, typeof Search> = {
  classify_request: Tag,
  search_kb: Search,
  draft_response: FileText,
};

const toolLabels: Record<string, string> = {
  classify_request: 'Classifying request',
  search_kb: 'Searching knowledge base',
  draft_response: 'Preparing draft',
};

export function ChatInterface({ request, onTraceUpdate }: ChatInterfaceProps) {
  const hasSent = useRef(false);

  const { messages, sendMessage, addToolOutput, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    // No sendAutomaticallyWhen — we manually send after approve/reject to avoid loops
  });

  // Send triage message once on mount (component remounts per request via key)
  useEffect(() => {
    if (!request || hasSent.current) return;
    hasSent.current = true;

    sendMessage({
      text: `Please triage this request:\n\n**Subject:** ${request.subject}\n**Channel:** ${request.channel}\n**Message:** ${request.message}`,
    });
  }, [request, sendMessage]);

  // Derive trace from messages (no side-effect, no render loop)
  const traceEntries = useMemo(() => {
    const trace: TraceEntry[] = [];
    for (const message of messages) {
      if (message.role !== 'assistant') continue;
      for (const part of message.parts) {
        if (!isToolUIPart(part)) continue;

        const toolName = getToolName(part);
        let traceStatus: TraceEntry['status'] = 'running';
        if (part.state === 'output-available') {
          traceStatus = 'complete';
        } else if (
          toolName === 'draft_response' &&
          part.state === 'input-available'
        ) {
          traceStatus = 'awaiting_approval';
        }

        trace.push({
          toolName,
          status: traceStatus,
          startTime: Date.now(),
          endTime: part.state === 'output-available' ? Date.now() : undefined,
        });
      }
    }
    return trace;
  }, [messages]);

  // Sync trace to parent — deduplicate by comparing a stable key to avoid render loops
  const prevTraceKey = useRef('');
  useEffect(() => {
    const key = traceEntries.map((t) => `${t.toolName}:${t.status}`).join(',');
    if (key !== prevTraceKey.current) {
      prevTraceKey.current = key;
      onTraceUpdate(traceEntries);
    }
  }, [traceEntries, onTraceUpdate]);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Inbox className="h-12 w-12 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground/50">
          Select a request to begin
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5 max-w-2xl mx-auto">
        {messages.map((message) => (
          <div key={message.id} className="space-y-4">
            {/* User message: show as a small muted indicator instead of a bubble */}
            {message.role === 'user' && (
              <div className="flex items-center gap-2 py-1.5">
                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <span className="text-xs text-muted-foreground/60 font-medium">
                  Triaging: {request.subject}
                </span>
              </div>
            )}

            {message.role === 'assistant' && (
              <div className="space-y-4">
                {message.parts.map((part, i) => {
                  // Text parts
                  if (part.type === 'text') {
                    const text = (part as { type: 'text'; text: string }).text;
                    if (!text.trim()) return null;
                    return (
                      <div
                        key={i}
                        className="text-sm leading-7 text-foreground/90"
                      >
                        {text}
                      </div>
                    );
                  }

                  // Tool parts
                  if (isToolUIPart(part)) {
                    const toolName = getToolName(part);

                    // classify_request — show result card
                    if (
                      toolName === 'classify_request' &&
                      part.state === 'output-available'
                    ) {
                      const result = part.output as {
                        category: string;
                        priority: string;
                        queue: string;
                        reasoning: string;
                      };
                      return (
                        <TriageResult
                          key={i}
                          category={result.category}
                          priority={result.priority}
                          queue={result.queue}
                          reasoning={result.reasoning}
                        />
                      );
                    }

                    // search_kb — show search results with relevance bars
                    if (
                      toolName === 'search_kb' &&
                      part.state === 'output-available'
                    ) {
                      const results = part.output as Array<{
                        source: string;
                        content: string;
                        relevance: number;
                      }>;
                      return (
                        <div key={i} className="space-y-2.5">
                          <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                            Knowledge Base &middot; {results.length} matches
                          </p>
                          <div className="space-y-2">
                            {results.map((r, j) => (
                              <div
                                key={j}
                                className="rounded-lg border border-border/50 bg-muted/30 p-3"
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-medium text-foreground/80">
                                    {r.source}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 rounded-full bg-muted-foreground/10 overflow-hidden">
                                      <div
                                        className={cn(
                                          'h-full rounded-full transition-all',
                                          r.relevance >= 0.8
                                            ? 'bg-emerald-500/70'
                                            : r.relevance >= 0.6
                                              ? 'bg-amber-500/70'
                                              : 'bg-muted-foreground/30'
                                        )}
                                        style={{
                                          width: `${Math.round(r.relevance * 100)}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums w-8 text-right">
                                      {(r.relevance * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2">
                                  {r.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // draft_response — show approval card only when input is fully available
                    if (
                      toolName === 'draft_response' &&
                      part.input &&
                      (part.state === 'input-available' || part.state === 'output-available')
                    ) {
                      const input = part.input as {
                        draft: string;
                        cited_policies: string[];
                        confidence: number;
                      };
                      const decided = part.state === 'output-available';
                      return (
                        <ApprovalCard
                          key={i}
                          draft={input.draft}
                          citedPolicies={input.cited_policies}
                          confidence={input.confidence}
                          decided={decided}
                          onApprove={async () => {
                            addToolOutput({
                              tool: 'draft_response',
                              toolCallId: part.toolCallId,
                              output: {
                                approved: true,
                                approvedAt: new Date().toISOString(),
                              },
                            });
                            // Manually continue the conversation after approval
                            await sendMessage({ text: 'The draft has been approved. Please confirm.' });
                          }}
                          onReject={async () => {
                            addToolOutput({
                              tool: 'draft_response',
                              toolCallId: part.toolCallId,
                              output: {
                                approved: false,
                                reason: 'Rejected by reviewer',
                              },
                            });
                            // Manually continue the conversation after rejection
                            await sendMessage({ text: 'The draft has been rejected. Please revise.' });
                          }}
                        />
                      );
                    }

                    // Inline step indicator for in-progress tools
                    if (
                      part.state === 'input-streaming' ||
                      part.state === 'input-available'
                    ) {
                      const ToolIcon = toolIcons[toolName] || Tag;
                      const label = toolLabels[toolName] || toolName;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 py-1"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                          </span>
                          <ToolIcon className="h-3 w-3 text-muted-foreground/50" />
                          <span className="text-xs text-muted-foreground/70 font-mono">
                            {label}
                          </span>
                        </div>
                      );
                    }
                  }

                  return null;
                })}
              </div>
            )}
          </div>
        ))}

        {/* Streaming / submitted indicator */}
        {(status === 'streaming' || status === 'submitted') && (
          <div className="flex items-center gap-3 py-2">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
            </div>
            <span className="text-xs text-muted-foreground/50">
              Triaging&hellip;
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
