'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, X, FileText, Send, Ban } from 'lucide-react';

interface ApprovalCardProps {
  draft: string;
  citedPolicies: string[];
  confidence: number;
  onApprove: () => void;
  onReject: () => void;
  decided?: boolean;
}

export function ApprovalCard({
  draft,
  citedPolicies,
  confidence,
  onApprove,
  onReject,
  decided,
}: ApprovalCardProps) {
  // Determine border color based on state
  // Parent passes decided=true after approve/reject. We infer approved vs rejected
  // by convention: if decided is true the parent already resolved the tool call.
  // We don't know the decision here, so we keep amber until decided, then go emerald
  // (the parent can wrap or extend if needed). For a richer signal we accept an
  // optional data attribute on the card root set by the parent.

  const confidencePct = Math.round((confidence ?? 0) * 100);

  const confidenceColor =
    confidencePct >= 80
      ? 'text-emerald-400 border-emerald-500/40'
      : confidencePct >= 50
        ? 'text-amber-400 border-amber-500/40'
        : 'text-red-400 border-red-500/40';

  return (
    <Card
      className={cn(
        'animate-fade-in-up',
        'border-l-[3px] ring-1 ring-white/[0.06]',
        'bg-[oklch(0.17_0.005_260)]',
        decided
          ? 'border-l-emerald-500/70'
          : 'border-l-amber-400/80',
      )}
    >
      <CardHeader className="pb-1 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/90">
            <FileText className="size-3.5 text-amber-400" />
            Draft Response
          </CardTitle>
          <Badge
            variant="outline"
            className={cn('text-[10px] tabular-nums', confidenceColor)}
          >
            {confidencePct}% confidence
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        {/* Draft text area */}
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
          {draft}
        </div>

        {/* Cited policies */}
        {citedPolicies && citedPolicies.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mr-0.5">
              Sources
            </span>
            {citedPolicies.map((policy) => (
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

        {/* Action buttons or decided status */}
        {!decided ? (
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={onApprove}
              className={cn(
                'gap-1.5 bg-emerald-600 text-white border-emerald-500/30',
                'hover:bg-emerald-500 hover:shadow-[0_0_12px_oklch(0.72_0.19_160_/_0.3)]',
                'transition-all duration-200',
              )}
            >
              <Check className="size-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              className={cn(
                'gap-1.5 text-red-400 border-red-500/30',
                'hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50',
                'transition-all duration-200',
              )}
            >
              <X className="size-3.5" />
              Reject
            </Button>
          </div>
        ) : (
          <div className="pt-1">
            <Badge
              className={cn(
                'gap-1 text-xs',
                'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
              )}
            >
              <Send className="size-3" />
              Sent
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
