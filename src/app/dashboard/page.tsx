export default function DashboardPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Forms Dashboard</h1>
      <p className="text-gray-400 mb-8">All generated direct deposit forms</p>

      <div className="p-12 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center">
        <div className="text-4xl mb-4">📋</div>
        <h2 className="text-xl font-semibold mb-2">No forms yet</h2>
        <p className="text-gray-400 mb-6">Create your first direct deposit form to get started.</p>
        <a
          href="/builder"
          className="inline-block px-6 py-3 rounded-lg bg-brand text-navy font-semibold hover:translate-y-[-1px] transition shadow-[0_0_24px_rgba(0,212,170,0.4)]"
        >
          Create form →
        </a>
      </div>
    </main>
  );
}
