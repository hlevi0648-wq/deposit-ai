'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

interface Form {
  id: string;
  employee_name: string;
  employer_name: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  submitted_at: string | null;
}

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    try {
      const res = await fetch('/api/forms');
      const data = await res.json();
      if (data.forms) setForms(data.forms);
    } catch (err) {
      console.error('Failed to fetch forms:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && userId) fetchForms();
  }, [isLoaded, userId, fetchForms]);

  const handleApprove = async (formId: string, action: 'approve' | 'reject') => {
    setActionLoading(formId);
    try {
      const res = await fetch('/api/forms/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, action }),
      });
      if (res.ok) {
        await fetchForms();
      }
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === 'all' ? forms : forms.filter((f) => f.status === filter);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    approved: 'bg-green-500/10 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
    draft: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  };

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
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Forms Dashboard</h1>
          <p className="text-gray-400">Manage and approve direct deposit forms</p>
        </div>
        <Link href="/builder" className="px-4 py-2 rounded-lg bg-brand text-navy font-semibold text-sm hover:translate-y-[-1px] transition shadow-[0_0_24px_rgba(0,212,170,0.4)]">
          + New Form
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', count: forms.length, color: 'text-white' },
          { label: 'Pending', count: forms.filter((f) => f.status === 'pending').length, color: 'text-yellow-400' },
          { label: 'Approved', count: forms.filter((f) => f.status === 'approved').length, color: 'text-green-400' },
          { label: 'Rejected', count: forms.filter((f) => f.status === 'rejected').length, color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              filter === f ? 'bg-brand text-navy' : 'bg-white/[0.03] text-gray-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Forms list */}
      {loading ? (
        <div className="p-12 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center text-gray-400">Loading forms...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-xl font-semibold mb-2">No forms yet</h2>
          <p className="text-gray-400 mb-6">Create your first direct deposit form to get started.</p>
          <Link href="/builder" className="inline-block px-6 py-3 rounded-lg bg-brand text-navy font-semibold hover:translate-y-[-1px] transition shadow-[0_0_24px_rgba(0,212,170,0.4)]">
            Create form →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((form) => (
            <div key={form.id} className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{form.employee_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[form.status]}`}>
                      {form.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>Employer: {form.employer_name}</span>
                    <span>Created: {new Date(form.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* PDF Export */}
                  <a
                    href={`/api/forms/export?formId=${form.id}`}
                    className="px-3 py-2 rounded-lg border border-white/15 text-white text-sm font-medium hover:border-brand hover:text-brand transition"
                  >
                    PDF
                  </a>
                  {/* Approve/Reject (only for pending) */}
                  {form.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(form.id, 'approve')}
                        disabled={actionLoading === form.id}
                        className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/20 transition disabled:opacity-50"
                      >
                        {actionLoading === form.id ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleApprove(form.id, 'reject')}
                        disabled={actionLoading === form.id}
                        className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition disabled:opacity-50"
                      >
                        {actionLoading === form.id ? '...' : 'Reject'}
                      </button>
                    </>
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
