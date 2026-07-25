import Link from "next/link";

const capabilities = ["Agent registry", "Tool governance", "Execution logging", "Cost & latency monitoring", "Audit trail"];

export default function Home() {
  return <main className="min-h-screen bg-slate-950 text-white">
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7"><span className="text-xl font-bold">AIMS<span className="text-indigo-400">.</span></span><Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white">Sign in</Link></nav>
    <section className="mx-auto grid max-w-6xl gap-14 px-6 py-20 lg:grid-cols-[1.2fr_.8fr] lg:items-center lg:py-28">
      <div><p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">AI Agent Management System</p><h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">The operations control plane for governed, observable AI agents.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Register every agent, govern its approved tools and knowledge, and review execution health, cost, latency, failures, and risk from one workspace.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/dashboard" className="rounded-lg bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-400">View dashboard</Link><Link href="/login" className="rounded-lg border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-900">Login</Link></div></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl"><p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-500">Control plane capabilities</p><ul className="space-y-3">{capabilities.map((item) => <li key={item} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4"><span className="h-2 w-2 rounded-full bg-indigo-400" /><span className="font-medium">{item}</span></li>)}</ul></div>
    </section>
  </main>;
}
