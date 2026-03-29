'use client';

import { useState, useCallback } from 'react';
import { seedRequests, type SeedRequest } from '@/lib/seed-requests';
import { RequestList } from '@/components/request-list';
import { RequestForm } from '@/components/request-form';
import { ChatInterface } from '@/components/chat-interface';
import { CachedTriageView } from '@/components/cached-triage-view';
import { TracePanel } from '@/components/trace-panel';
import { Badge } from '@/components/ui/badge';
import type { TraceEntry, TriageCache } from '@/lib/types';

export default function Home() {
  const [requests, setRequests] = useState<SeedRequest[]>(seedRequests);
  const [selectedRequest, setSelectedRequest] = useState<SeedRequest | null>(null);
  const [traceEntries, setTraceEntries] = useState<TraceEntry[]>([]);
  const [triageCache, setTriageCache] = useState<Map<string, TriageCache>>(new Map());

  const handleSelect = useCallback((request: SeedRequest) => {
    setSelectedRequest(request);
    // Restore cached trace if available, otherwise clear
    const cached = triageCache.get(request.id);
    setTraceEntries(cached ? cached.traceEntries : []);
  }, [triageCache]);

  const handleNewRequest = useCallback((request: SeedRequest) => {
    setRequests((prev) => [request, ...prev]);
    setSelectedRequest(request);
    setTraceEntries([]);
  }, []);

  const handleTraceUpdate = useCallback((entries: TraceEntry[]) => {
    setTraceEntries(entries);
  }, []);

  const handleTriageComplete = useCallback((requestId: string, cache: TriageCache) => {
    setTriageCache((prev) => {
      const next = new Map(prev);
      next.set(requestId, cache);
      return next;
    });
  }, []);

  const channelColors: Record<string, string> = {
    email: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    slack: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    web: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0b] text-white">
      {/* Top status bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0a0a0b] px-4">
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            System Online
          </span>
          <span className="text-white/20">|</span>
          <span>{requests.length} requests</span>
          <span className="text-white/20">|</span>
          <span>{triageCache.size} completed</span>
          <span className="text-white/20">|</span>
          <span>{traceEntries.length} trace events</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/30">
          <span className="font-mono">v1.0</span>
          <span className="text-white/20">|</span>
          <span>GPT-4o</span>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — Request list + form */}
        <div className="flex w-80 shrink-0 flex-col border-r border-white/[0.06] bg-[#0c0c0d]">
          {/* Sidebar header */}
          <div className="shrink-0 border-b border-white/[0.06] px-4 py-4">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              </span>
              <h1 className="text-base font-semibold tracking-tight text-white">
                Smart Triage
              </h1>
            </div>
            <p className="mt-1 pl-5 text-[11px] font-medium uppercase tracking-widest text-white/30">
              AI Triage Copilot
            </p>
          </div>

          {/* Request list */}
          <div className="flex-1 overflow-hidden">
            <RequestList
              requests={requests}
              selectedId={selectedRequest?.id ?? null}
              onSelect={handleSelect}
              completedIds={triageCache}
            />
          </div>

          {/* New request form */}
          <div className="shrink-0 border-t border-white/[0.06]">
            <RequestForm onSubmit={handleNewRequest} />
          </div>
        </div>

        {/* Center — Chat / triage area */}
        <div className="flex flex-1 flex-col min-w-0 bg-[#0a0a0b]">
          {/* Center header */}
          {selectedRequest ? (
            <div className="shrink-0 border-b border-white/[0.06] px-5 py-3.5 transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-medium text-white/90">
                    {selectedRequest.subject}
                  </h2>
                  <div className="mt-1.5 flex items-center gap-2.5 text-[11px] text-white/35">
                    <Badge
                      variant="outline"
                      className={`rounded-md border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wider ${channelColors[selectedRequest.channel] ?? ''}`}
                    >
                      {selectedRequest.channel}
                    </Badge>
                    <span>
                      {new Date(selectedRequest.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' at '}
                      {new Date(selectedRequest.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-white/15">|</span>
                    <span className="font-mono text-white/25">{selectedRequest.id}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="shrink-0 border-b border-white/[0.06] px-5 py-3.5">
              <h2 className="text-sm font-medium text-white/30">No request selected</h2>
              <p className="mt-0.5 text-[11px] text-white/20">
                Select a request from the sidebar to begin triage
              </p>
            </div>
          )}

          {/* Chat area */}
          <div className="flex-1 overflow-hidden">
            {selectedRequest && triageCache.has(selectedRequest.id) ? (
              <CachedTriageView
                key={`cached-${selectedRequest.id}`}
                request={selectedRequest}
                cache={triageCache.get(selectedRequest.id)!}
              />
            ) : selectedRequest ? (
              <ChatInterface
                key={selectedRequest.id}
                request={selectedRequest}
                onTraceUpdate={handleTraceUpdate}
                onTriageComplete={handleTriageComplete}
              />
            ) : (
              /* Empty state */
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-6 text-center">
                  {/* Animated gradient orb */}
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent blur-2xl animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="h-10 w-10 text-white/[0.08]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 0 1-1.59.659H9.06a2.25 2.25 0 0 1-1.591-.659L5 14.5m14 0-1.543-3.857A2.25 2.25 0 0 0 15.364 9H8.636a2.25 2.25 0 0 0-2.093 1.643L5 14.5"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/20">
                      Ready to triage
                    </p>
                    <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-white/[0.12]">
                      Select a request from the queue or create a new one to start
                      the AI classification and response workflow.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel — Agent Trace */}
        <div className="flex w-[300px] shrink-0 flex-col border-l border-white/[0.06] bg-[#0c0c0d]">
          <div className="shrink-0 border-b border-white/[0.06] px-4 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="h-3.5 w-3.5 text-white/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                  />
                </svg>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Agent Trace
                </h3>
              </div>
              {traceEntries.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/[0.08] px-1.5 font-mono text-[10px] text-white/40">
                  {traceEntries.length}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <TracePanel entries={traceEntries} />
          </div>
        </div>
      </div>
    </div>
  );
}
