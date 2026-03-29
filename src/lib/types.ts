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

export interface TriageCache {
  classification: Classification | null;
  kbResults: KBSearchResult[];
  draft: DraftResponse | null;
  decision: 'approved' | 'rejected';
  confirmationText: string;
  traceEntries: TraceEntry[];
  completedAt: string;
}
