import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-extrabold bg-gradient-to-r from-white to-brand bg-clip-text text-transparent">
          DepositAI
        </div>
        <div className="flex gap-8 items-center">
          <Link href="/builder" className="text-sm text-gray-400 hover:text-white transition">Builder</Link>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition">Dashboard</Link>
          <Link href="https://github.com/hlevi0648-wq/deposit-ai" className="text-sm text-gray-400 hover:text-white transition">GitHub</Link>
          <Link href="/builder" className="px-4 py-2 rounded-lg bg-brand text-navy font-semibold text-sm hover:translate-y-[-1px] transition shadow-[0_0_24px_rgba(0,212,170,0.4)]">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_8px_#00D4AA]"></span>
            AI-powered · SOC 2 ready · NACHA compliant
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight mb-5">
            Direct deposit forms, <span className="text-brand">instantly compliant</span>.
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-md">
            Create secure, bank-ready direct deposit forms with AI. Streamline payroll setup, reduce errors, and stay compliant — effortlessly.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/builder" className="px-6 py-3 rounded-lg bg-brand text-navy font-semibold hover:translate-y-[-1px] transition shadow-[0_0_24px_rgba(0,212,170,0.4)]">
              Start for free
            </Link>
            <Link href="https://github.com/hlevi0648-wq/deposit-ai" className="px-6 py-3 rounded-lg border border-white/15 text-white font-semibold hover:border-brand hover:text-brand transition">
              View on GitHub →
            </Link>
          </div>
        </div>
        <div className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur">
          <div className="bg-navy-800 rounded-xl overflow-hidden">
            <div className="flex gap-1.5 px-4 py-3 border-b border-white/[0.06]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
            </div>
            <div className="p-5">
              <div className="inline-block px-2.5 py-1 rounded bg-brand/15 text-brand text-[10px] font-semibold mb-3">⚡ AI auto-filling 4 fields</div>
              {['Employee Name', 'Bank Routing #', 'Account #', 'Account Type'].map((label) => (
                <div key={label} className="mb-3.5">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</div>
                  <div className="h-8 bg-brand/[0.08] border border-brand/30 rounded-md relative flex items-center px-3">
                    <span className="text-brand text-xs font-medium">✓ Validated</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-3">Everything payroll needs</h2>
          <p className="text-gray-400">From form generation to compliance validation — all in one platform.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '⚡', title: 'AI Form Generation', desc: 'Auto-fill from employer/employee data. Upload a void check or W-4 and let AI extract the rest.' },
            { icon: '✓', title: 'Compliance Validation', desc: 'NACHA rules, bank requirements, and state regulations — validated in real-time.' },
            { icon: '🔒', title: 'Bank-Grade Security', desc: 'Encrypted at rest, tokenized PII, SOC 2 ready. Account numbers never stored in plaintext.' },
            { icon: '📄', title: 'Multi-Format Export', desc: 'PDF, CSV, or direct bank API payload via Plaid. One form, every output format.' },
            { icon: '📊', title: 'Audit Trail', desc: 'Every form generation, edit, and export logged immutably. Compliance-ready.' },
            { icon: '🔌', title: 'Integrations', desc: 'Plaid bank API, bulk CSV import, webhooks. Connect to your existing payroll stack.' },
          ].map((f) => (
            <div key={f.title} className="p-8 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-brand/30 hover:translate-y-[-2px] transition">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight mb-4">Stop wrestling with forms.</h2>
        <p className="text-gray-400 mb-8 text-lg">Let AI handle the paperwork. Your payroll team will thank you.</p>
        <Link href="/builder" className="inline-block px-8 py-4 rounded-lg bg-brand text-navy font-semibold hover:translate-y-[-1px] transition shadow-[0_0_24px_rgba(0,212,170,0.4)]">
          Get started — it's free
        </Link>
      </section>

      <footer className="border-t border-white/[0.06] py-10 text-center text-gray-400 text-sm">
        <p>DepositAI · <Link href="https://github.com/hlevi0648-wq/deposit-ai" className="hover:text-brand">GitHub</Link> · MIT License · © 2026</p>
      </footer>
    </main>
  );
}
