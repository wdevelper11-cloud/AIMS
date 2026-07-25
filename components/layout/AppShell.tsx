import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { createServerClient } from "@/lib/supabase/server";

export async function AppShell({ children }: { children: ReactNode }) {
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const user = isConfigured ? (await createServerClient().auth.getUser()).data.user : null;
  return <div className="min-h-screen bg-slate-50"><Sidebar /><div className="md:pl-64"><Topbar email={user?.email ?? "Signed in"} /><main className="p-5 sm:p-8">{children}</main></div></div>;
}
