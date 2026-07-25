import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children, email, workspaceName }: { children: ReactNode; email: string; workspaceName: string }) {
  return <div className="min-h-screen bg-slate-50"><Sidebar /><div className="md:pl-64"><Topbar email={email} workspaceName={workspaceName} /><main className="p-5 sm:p-8">{children}</main></div></div>;
}
