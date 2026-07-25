"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"login" | "signup" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function authenticate(action: "login" | "signup") {
    if (!email || !password) {
      setMessage({ type: "error", text: "Enter both an email address and password." });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setLoading(action);
    setMessage(null);
    try {
      const supabase = createBrowserClient();
      const result = action === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (result.error) {
        setMessage({ type: "error", text: result.error.message });
        return;
      }

      if (result.data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setMessage({ type: "success", text: "Account created. Check your email to confirm your account, then return here to sign in." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Authentication could not be completed. Please try again.",
      });
    } finally {
      setLoading(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void authenticate("login");
  }

  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12"><section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"><Link href="/" className="text-xl font-bold text-slate-950">AIMS<span className="text-indigo-600">.</span></Link><h1 className="mt-8 text-3xl font-bold tracking-tight">Welcome back</h1><p className="mt-2 text-sm text-slate-500">Sign in or create your AIMS account.</p><form className="mt-7 space-y-5" onSubmit={handleSubmit}><label className="block text-sm font-semibold">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="operator@company.com" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label><label className="block text-sm font-semibold">Password<input required minLength={6} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label>{!isSupabaseConfigured && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Supabase authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.</p>}{message && <p role="status" className={`rounded-lg p-3 text-sm ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{message.text}</p>}<button disabled={loading !== null} type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">{loading === "login" ? "Signing in…" : "Sign in"}</button><button disabled={loading !== null} type="button" onClick={() => void authenticate("signup")} className="w-full rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">{loading === "signup" ? "Creating account…" : "Create account"}</button></form></section></main>;
}
