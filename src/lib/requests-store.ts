import { TriageRequest } from './types';
import { seedRequests } from './seed-requests';

const store = new Map<string, TriageRequest>();

// Initialize with seed data
for (const seed of seedRequests) {
  store.set(seed.id, {
    ...seed,
    status: 'pending',
  });
}

export function getRequest(id: string): TriageRequest | undefined {
  return store.get(id);
}

export function getAllRequests(): TriageRequest[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addRequest(request: Omit<TriageRequest, 'status'>): TriageRequest {
  const triageRequest: TriageRequest = { ...request, status: 'pending' };
  store.set(request.id, triageRequest);
  return triageRequest;
}

export function updateRequestStatus(id: string, status: TriageRequest['status']): void {
  const request = store.get(id);
  if (request) {
    store.set(id, { ...request, status });
  }
}
