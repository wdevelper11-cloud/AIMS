"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    setLoading(true);
    setError(null);
    try {
      const { error: signOutError } = await createBrowserClient().auth.signOut();
      if (signOutError) {
        setError(signOutError.message);
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Sign out failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="text-right"><button type="button" disabled={loading} onClick={() => void logout()} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60">{loading ? "Signing out…" : "Sign out"}</button>{error && <p role="alert" className="mt-1 max-w-52 text-xs text-red-600">{error}</p>}</div>;
}
