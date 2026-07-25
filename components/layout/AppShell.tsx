import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-50"><Sidebar /><div className="md:pl-64"><Topbar /><main className="p-5 sm:p-8">{children}</main></div></div>;
}
