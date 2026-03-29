import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';

const priorityColorMap: Record<string, string> = {
  critical: 'bg-red-500/90 text-white border-red-500/50',
  high: 'bg-amber-500/90 text-white border-amber-500/50',
  medium: 'bg-yellow-500/90 text-black border-yellow-500/50',
  low: 'bg-emerald-500/90 text-white border-emerald-500/50',
};

interface TriageResultProps {
  category: string;
  priority: string;
  queue: string;
  reasoning: string;
}

export function TriageResult({ category, priority, queue, reasoning }: TriageResultProps) {
  return (
    <Card
      className={cn(
        'animate-fade-in-up',
        'border-t-2 border-t-emerald-500/80',
        'bg-[oklch(0.17_0.005_260)] ring-1 ring-white/[0.06]',
      )}
    >
      <CardHeader className="pb-1 pt-3 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/90">
          <Tag className="size-3.5 text-emerald-400" />
          Classification
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="capitalize text-xs">
            {category}
          </Badge>
          <Badge
            className={cn(
              'capitalize text-xs',
              priorityColorMap[priority] || 'bg-muted text-muted-foreground',
            )}
          >
            {priority}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {queue}
          </Badge>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{reasoning}</p>
      </CardContent>
    </Card>
  );
}
