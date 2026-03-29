'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { TraceEntry } from '@/lib/types';
import { Search, Tag, FileText, Check, AlertCircle, Activity } from 'lucide-react';

const toolIcons: Record<string, typeof Search> = {
  classify_request: Tag,
  search_kb: Search,
  draft_response: FileText,
};

const toolLabels: Record<string, string> = {
  classify_request: 'Classify Request',
  search_kb: 'Search Knowledge Base',
  draft_response: 'Draft Response',
};

interface TracePanelProps {
  entries: TraceEntry[];
}

export function TracePanel({ entries }: TracePanelProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="relative">
          <Activity className="h-8 w-8 text-muted-foreground/30" />
          <span className="absolute inset-0 animate-ping">
            <Activity className="h-8 w-8 text-muted-foreground/10" />
          </span>
        </div>
        <p className="text-xs text-muted-foreground/50 uppercase tracking-widest">
          Waiting for triage&hellip;
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h3 className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-[0.15em] mb-5">
          Agent Trace
        </h3>

        {/* Timeline */}
        <div className="relative">
          {entries.map((entry, i) => {
            const ToolIcon = toolIcons[entry.toolName] || Tag;
            const label = toolLabels[entry.toolName] || entry.toolName;
            const isLast = i === entries.length - 1;
            const duration = entry.endTime
              ? `${((entry.endTime - entry.startTime) / 1000).toFixed(1)}s`
              : null;

            const isRunning = entry.status === 'running';
            const isComplete = entry.status === 'complete';
            const isAwaiting = entry.status === 'awaiting_approval';
            const isError = entry.status === 'error';

            return (
              <div key={i} className="relative flex gap-3.5 pb-6 last:pb-0">
                {/* Vertical connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'absolute left-[9px] top-[22px] w-px bottom-0',
                      isComplete
                        ? 'bg-emerald-500/30'
                        : 'bg-muted-foreground/15'
                    )}
                  />
                )}

                {/* Step dot */}
                <div className="relative shrink-0 flex items-start pt-0.5">
                  <div
                    className={cn(
                      'h-[18px] w-[18px] rounded-full flex items-center justify-center border-2',
                      isComplete && 'bg-emerald-500/15 border-emerald-500',
                      isRunning && 'bg-blue-500/15 border-blue-500',
                      isAwaiting && 'bg-amber-500/15 border-amber-500',
                      isError && 'bg-red-500/15 border-red-500'
                    )}
                  >
                    {isComplete && (
                      <Check className="h-2.5 w-2.5 text-emerald-400" />
                    )}
                    {isRunning && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                      </span>
                    )}
                    {isAwaiting && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                    )}
                    {isError && (
                      <AlertCircle className="h-2.5 w-2.5 text-red-400" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-px">
                  <div className="flex items-center gap-2 mb-1">
                    <ToolIcon className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                    <span className="text-xs font-mono text-foreground/90 truncate">
                      {label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] px-1.5 py-0 h-4 font-normal border-none',
                        isComplete && 'bg-emerald-500/10 text-emerald-400',
                        isRunning && 'bg-blue-500/10 text-blue-400',
                        isAwaiting && 'bg-amber-500/10 text-amber-400',
                        isError && 'bg-red-500/10 text-red-400'
                      )}
                    >
                      {isComplete && 'Complete'}
                      {isRunning && 'Running'}
                      {isAwaiting && 'Awaiting Approval'}
                      {isError && 'Error'}
                    </Badge>

                    {duration && (
                      <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums">
                        {duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
