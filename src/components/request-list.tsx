'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Hash, Globe } from 'lucide-react';
import type { SeedRequest } from '@/lib/seed-requests';

const channelIcons = {
  email: Mail,
  slack: Hash,
  web: Globe,
} as const;

const priorityHints: Record<string, string> = {
  'req-001': 'billing',
  'req-002': 'technical',
  'req-003': 'security',
  'req-004': 'hr',
  'req-005': 'ops',
  'req-006': 'ops',
  'req-007': 'sales',
  'req-008': 'hr',
  'req-009': 'billing',
  'req-010': 'security',
};

function getCategoryColor(id: string) {
  const cat = priorityHints[id] || 'general';
  const colors: Record<string, string> = {
    billing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    technical: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    security: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    hr: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    ops: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    sales: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    general: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };
  return colors[cat] || colors.general;
}

interface RequestListProps {
  requests: SeedRequest[];
  selectedId: string | null;
  onSelect: (request: SeedRequest) => void;
}

export function RequestList({ requests, selectedId, onSelect }: RequestListProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-0.5 p-2">
        {requests.map((request) => {
          const Icon = channelIcons[request.channel];
          const isSelected = selectedId === request.id;
          return (
            <button
              key={request.id}
              onClick={() => onSelect(request)}
              className={cn(
                'group w-full text-left rounded-lg p-3 transition-all duration-150',
                'border-l-2 border-transparent',
                'hover:bg-zinc-800/60',
                isSelected
                  ? 'bg-zinc-800/80 border-l-emerald-500'
                  : 'hover:border-l-zinc-700'
              )}
            >
              <div className="flex items-start gap-2.5">
                <Icon
                  className={cn(
                    'h-4 w-4 mt-0.5 shrink-0 transition-colors duration-150',
                    isSelected
                      ? 'text-emerald-400'
                      : 'text-zinc-500 group-hover:text-zinc-400'
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium leading-tight truncate transition-colors duration-150',
                      isSelected ? 'text-zinc-100' : 'text-zinc-300 group-hover:text-zinc-200'
                    )}
                  >
                    {request.subject}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-medium px-1.5 py-0 leading-4 rounded-md',
                        getCategoryColor(request.id)
                      )}
                    >
                      {priorityHints[request.id] || 'general'}
                    </Badge>
                    <span className="text-[10px] font-mono text-zinc-600">
                      {new Date(request.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
