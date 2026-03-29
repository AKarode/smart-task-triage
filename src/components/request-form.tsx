'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import type { SeedRequest } from '@/lib/seed-requests';

interface RequestFormProps {
  onSubmit: (request: SeedRequest) => void;
}

export function RequestForm({ onSubmit }: RequestFormProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    onSubmit({
      id: `req-custom-${Date.now()}`,
      channel: 'web',
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    });

    setSubject('');
    setMessage('');
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 space-y-3 border-t border-zinc-800">
      <div className="flex items-center gap-1.5">
        <Plus className="h-3.5 w-3.5 text-emerald-500" />
        <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
          New Request
        </p>
      </div>
      <Input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="text-sm bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-zinc-700"
      />
      <Textarea
        placeholder="Describe your request..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="text-sm resize-none bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-zinc-700"
      />
      <Button
        type="submit"
        size="sm"
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors duration-150"
      >
        Submit Request
      </Button>
    </form>
  );
}
