'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TriageResult } from './triage-result';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, FileText, Send, Ban } from 'lucide-react';
import type { TriageCache } from '@/lib/types';
import type { SeedRequest } from '@/lib/seed-requests';

interface CachedTriageViewProps {
  request: SeedRequest;
  cache: TriageCache;
}

export function CachedTriageView({ request, cache }: CachedTriageViewProps) {
  const isApproved = cache.decision === 'approved';

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5 max-w-2xl mx-auto">
        {/* Status banner */}
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium',
            isApproved
              ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
              : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
          )}
        >
          {isApproved ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <XCircle className="size-4" />
          )}
          <span>
            {isApproved ? 'Triage completed — response approved' : 'Triage completed — draft rejected'}
          </span>
          <span className="ml-auto text-xs opacity-60 font-mono">
            {new Date(cache.completedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Classification */}
        {cache.classification && (
          <TriageResult
            category={cache.classification.category}
            priority={cache.classification.priority}
            queue={cache.classification.queue}
            reasoning={cache.classification.reasoning}
          />
        )}

        {/* KB Results */}
        {cache.kbResults.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
              Knowledge Base &middot; {cache.kbResults.length} matches
            </p>
            <div className="space-y-2">
              {cache.kbResults.map((r, j) => (
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
                            'h-full rounded-full',
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
        )}

        {/* Draft */}
        {cache.draft && (
          <div
            className={cn(
              'rounded-lg ring-1 ring-white/[0.06] bg-[oklch(0.17_0.005_260)]',
              'border-l-[3px]',
              isApproved ? 'border-l-emerald-500/70' : 'border-l-red-500/70'
            )}
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/90">
                <FileText className="size-3.5 text-amber-400" />
                Draft Response
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] tabular-nums',
                  cache.draft.confidence >= 0.8
                    ? 'text-emerald-400 border-emerald-500/40'
                    : 'text-amber-400 border-amber-500/40'
                )}
              >
                {Math.round(cache.draft.confidence * 100)}% confidence
              </Badge>
            </div>
            <div className="px-4 pb-4 space-y-3">
              <div
                className={cn(
                  'relative rounded-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                  'bg-[oklch(0.14_0.005_260)] ring-1 ring-white/[0.04]',
                  'border-l-2 border-l-white/[0.06]',
                  'text-foreground/85',
                )}
              >
                <span
                  className="absolute top-2 left-1.5 text-lg leading-none text-muted-foreground/30 select-none"
                  aria-hidden
                >
                  &ldquo;
                </span>
                {cache.draft.draft}
              </div>

              {cache.draft.cited_policies && cache.draft.cited_policies.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mr-0.5">
                    Sources
                  </span>
                  {cache.draft.cited_policies.map((policy) => (
                    <Badge
                      key={policy}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground"
                    >
                      {policy}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="pt-1">
                <Badge
                  className={cn(
                    'gap-1 text-xs',
                    isApproved
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border-red-500/30'
                  )}
                >
                  {isApproved ? <Send className="size-3" /> : <Ban className="size-3" />}
                  {isApproved ? 'Sent' : 'Rejected'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation text from model */}
        {cache.confirmationText && (
          <div className="text-sm leading-7 text-foreground/90">
            {cache.confirmationText}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
