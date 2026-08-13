'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  employeeName: string;
  employeeEmail: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  employerName: string;
  employerId: string;
  payFrequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  depositAmount: string;
  depositType: 'full' | 'percent' | 'fixed';
}

const emptyForm: FormData = {
  employeeName: '',
  employeeEmail: '',
  bankName: '',
  routingNumber: '',
  accountNumber: '',
  accountType: 'checking',
  employerName: '',
  employerId: '',
  payFrequency: 'biweekly',
  depositAmount: '',
  depositType: 'full',
};

export default function FormBuilder() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [aiSuggestions, setAiSuggestions] = useState<Partial<FormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ABA routing number checksum validation
  const validateRoutingNumber = (routing: string): boolean => {
    if (routing.length !== 9) return false;
    const digits = routing.split('').map(Number);
    const sum = 3 * (digits[0] + digits[3] + digits[6]) +
               7 * (digits[1] + digits[4] + digits[7]) +
               1 * (digits[2] + digits[5] + digits[8]);
    return sum % 10 === 0;
  };

  const handleAIExtract = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: 'auto' }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
        setForm((prev) => ({ ...prev, ...data.suggestions }));
      }
    } catch (err) {
      console.error('AI extraction failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.employeeName.trim()) newErrors.employeeName = 'Required';
    if (!form.employeeEmail.includes('@')) newErrors.employeeEmail = 'Valid email required';
    if (!validateRoutingNumber(form.routingNumber))
      newErrors.routingNumber = 'Invalid routing number (failed ABA checksum)';
    if (form.accountNumber.length < 4) newErrors.accountNumber = 'Min 4 digits';
    if (!form.employerName.trim()) newErrors.employerName = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Direct Deposit Form Builder</h1>
        <p className="text-gray-400">AI-assisted · NACHA compliant · Real-time validation</p>
      </div>

      {/* AI Extract Button */}
      <button
        onClick={handleAIExtract}
        disabled={isGenerating}
        className="mb-8 px-4 py-2 rounded-lg bg-brand/15 border border-brand/30 text-brand font-semibold text-sm hover:bg-brand/20 transition disabled:opacity-50"
      >
        {isGenerating ? '⚡ AI extracting...' : '⚡ AI Auto-Fill from Documents'}
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Section */}
        <section className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-4">Employee Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Employee Name" error={errors.employeeName}>
              <input
                value={form.employeeName}
                onChange={(e) => update('employeeName', e.target.value)}
                className="input"
                placeholder="Sarah Chen"
              />
            </Field>
            <Field label="Employee Email" error={errors.employeeEmail}>
              <input
                value={form.employeeEmail}
                onChange={(e) => update('employeeEmail', e.target.value)}
                className="input"
                placeholder="sarah@company.com"
              />
            </Field>
          </div>
        </section>

        {/* Bank Section */}
        <section className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-4">Bank Account Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Bank Name" >
              <input
                value={form.bankName}
                onChange={(e) => update('bankName', e.target.value)}
                className="input"
                placeholder="Chase Bank"
              />
            </Field>
            <Field label="Routing Number (9 digits)" error={errors.routingNumber}>
              <input
                value={form.routingNumber}
                onChange={(e) => update('routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
                className="input"
                placeholder="026009593"
                maxLength={9}
              />
            </Field>
            <Field label="Account Number" error={errors.accountNumber}>
              <input
                value={form.accountNumber}
                onChange={(e) => update('accountNumber', e.target.value.replace(/\D/g, ''))}
                className="input"
                placeholder="••••4821"
              />
            </Field>
            <Field label="Account Type">
              <select
                value={form.accountType}
                onChange={(e) => update('accountType', e.target.value)}
                className="input"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Employer Section */}
        <section className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-4">Employer & Deposit Setup</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Employer Name" error={errors.employerName}>
              <input
                value={form.employerName}
                onChange={(e) => update('employerName', e.target.value)}
                className="input"
                placeholder="Acme Corp"
              />
            </Field>
            <Field label="Employer ID">
              <input
                value={form.employerId}
                onChange={(e) => update('employerId', e.target.value)}
                className="input"
                placeholder="EIN-12-3456789"
              />
            </Field>
            <Field label="Pay Frequency">
              <select
                value={form.payFrequency}
                onChange={(e) => update('payFrequency', e.target.value)}
                className="input"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="semimonthly">Semimonthly</option>
                <option value="monthly">Monthly</option>
              </select>
            </Field>
            <Field label="Deposit Amount">
              <input
                value={form.depositAmount}
                onChange={(e) => update('depositAmount', e.target.value)}
                className="input"
                placeholder="Full or $ amount"
              />
            </Field>
          </div>
        </section>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-lg bg-brand text-navy font-semibold hover:translate-y-[-1px] transition shadow-[0_0_24px_rgba(0,212,170,0.4)] disabled:opacity-50"
          >
            {isSubmitting ? 'Generating...' : 'Generate Form'}
          </button>
          <button
            type="button"
            onClick={() => setForm(emptyForm)}
            className="px-6 py-3 rounded-lg border border-white/15 text-white font-semibold hover:border-brand hover:text-brand transition"
          >
            Reset
          </button>
        </div>
      </form>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #00D4AA;
        }
      `}</style>
    </main>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
