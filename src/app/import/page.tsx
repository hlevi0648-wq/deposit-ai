'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

interface ImportResult {
  row: number;
  success: boolean;
  formId?: string;
  error?: string;
}

export default function ImportPage() {
  const { isLoaded, userId } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ total: number; succeeded: number; failed: number; results: ImportResult[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/forms/import', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) setResults(data);
      else alert(data.error || 'Import failed');
    } catch (err) {
      console.error('Import failed:', err);
      alert('Import failed');
    } finally {
      setLoading(false);
    }
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
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">← Back to Dashboard</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Bulk CSV Import</h1>
        <p className="text-gray-400">Upload a CSV file to create multiple direct deposit forms at once.</p>
      </div>

      {/* CSV format hint */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] mb-6">
        <h3 className="text-sm font-semibold mb-2">Required CSV columns:</h3>
        <code className="text-xs text-brand block overflow-x-auto pb-2">
          employeeName,employeeEmail,employeePhone,bankName,routingNumber,accountNumber,accountType,employerName,employerId,payFrequency,depositAmount,depositType
        </code>
        <p className="text-xs text-gray-500 mt-2">Required: employeeName, employeeEmail, routingNumber, accountNumber, accountType, employerName, payFrequency, depositType</p>
      </div>

      {/* Upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) setFile(f);
        }}
        className="border-2 border-dashed border-white/15 rounded-xl p-12 text-center cursor-pointer hover:border-brand transition"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file ? (
          <div>
            <div className="text-3xl mb-2">📄</div>
            <div className="text-sm font-medium">{file.name}</div>
            <div className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
        ) : (
          <div>
            <div className="text-3xl mb-2">📁</div>
            <div className="text-sm font-medium">Drop CSV here or click to browse</div>
            <div className="text-xs text-gray-500 mt-1">.csv files only</div>
          </div>
        )}
      </div>

      {file && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="mt-4 w-full px-6 py-3 rounded-lg bg-brand text-navy font-semibold disabled:opacity-50 hover:translate-y-[-1px] transition shadow-[0_0_24px_rgba(0,212,170,0.4)]"
        >
          {loading ? 'Importing...' : `Import ${file.name}`}
        </button>
      )}

      {/* Results */}
      {results && (
        <div className="mt-8">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div className="text-2xl font-bold text-white">{results.total}</div>
              <div className="text-xs text-gray-400 mt-1">Total</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div className="text-2xl font-bold text-green-400">{results.succeeded}</div>
              <div className="text-xs text-gray-400 mt-1">Succeeded</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div className="text-2xl font-bold text-red-400">{results.failed}</div>
              <div className="text-xs text-gray-400 mt-1">Failed</div>
            </div>
          </div>

          <div className="space-y-2">
            {results.results.map((r) => (
              <div
                key={r.row}
                className={`p-3 rounded-lg border text-sm ${
                  r.success ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
                }`}
              >
                <span className="font-mono text-xs">Row {r.row}</span>
                {r.success ? ` ✓ Created (${r.formId?.slice(0, 8)}...)` : ` ✗ ${r.error}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
