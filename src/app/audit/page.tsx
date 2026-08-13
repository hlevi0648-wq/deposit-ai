'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

interface AuditEntry {
  id: string;
  form_id: string | null;
  action: string;
  actor_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const actionColors: Record<string, string> = {
  created: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  updated: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  submitted: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  approved: 'bg-green-500/10 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
  exported: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  deleted: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

export default function AuditLogPage() {
  const { isLoaded, userId } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/audit');
      const data = await res.json();
      if (data.entries) setEntries(data.entries);
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && userId) fetchEntries();
  }, [isLoaded, userId, fetchEntries]);

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.action === filter);
  const actions = ['all', ...Array.from(new Set(entries.map((e) => e.action)))];

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>;

  if (!userId) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
          <Link href="/sign-in" className="px-6 py-3 rounded-lg bg-brand text-navy font-semibold">Sign in</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Audit Log</h1>
          <p className="text-gray-400">Immutable record of every action taken on forms</p>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">← Back to Dashboard</Link>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {actions.map((a) => (
          <button
            key={a}
            onClick={() => setFilter(a)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              filter === a ? 'bg-brand text-navy' : 'bg-white/[0.03] text-gray-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="p-12 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center text-gray-400">Loading audit log...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center text-gray-400">No audit entries found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <div key={entry.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${actionColors[entry.action] || actionColors.updated}`}>
                      {entry.action}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">{entry.actor_id}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {entry.form_id && (
                      <span>Form: <code className="text-brand text-xs">{entry.form_id.slice(0, 8)}...</code> · </span>
                    )}
                    <span>{new Date(entry.created_at).toLocaleString()}</span>
                  </div>
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">Metadata</summary>
                      <pre className="mt-2 p-2 rounded-lg bg-black/30 text-xs text-gray-400 overflow-x-auto">{JSON.stringify(entry.metadata, null, 2)}</pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
