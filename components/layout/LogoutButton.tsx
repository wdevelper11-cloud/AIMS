"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await createBrowserClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return <button type="button" disabled={loading} onClick={() => void logout()} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60">{loading ? "Signing out…" : "Sign out"}</button>;
}
