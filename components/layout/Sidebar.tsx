"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Dashboard", "/dashboard"], ["Agents", "/agents"], ["Tools", "/tools"],
  ["Knowledge", "/knowledge"], ["Run monitoring", "/runs"], ["Audit timeline", "/audit"],
];

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="border-b border-slate-800 bg-slate-950 text-white md:fixed md:inset-y-0 md:w-64 md:border-b-0 md:border-r">
    <div className="flex h-20 items-center px-6"><Link href="/" className="text-xl font-bold tracking-tight">AIMS<span className="text-indigo-400">.</span></Link></div>
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:pb-0" aria-label="Main navigation">
      {links.map(([label, href]) => <Link key={href} href={href} className={`block whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition ${pathname === href ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>{label}</Link>)}
    </nav>
    <div className="hidden px-6 text-xs leading-5 text-slate-500 md:absolute md:bottom-6 md:block">Agent operations<br />Private workspace</div>
  </aside>;
}
