import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing public Supabase environment variables.");
  }

  const cookieStore = cookies();

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
      storage: {
        getItem: (key) => cookieStore.get(key)?.value ?? null,
        setItem: (key, value) => {
          try {
            cookieStore.set(key, value, {
              httpOnly: false,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              path: "/",
            });
          } catch {
            // Server Components cannot set cookies. Middleware refreshes them.
          }
        },
        removeItem: (key) => {
          try {
            cookieStore.delete(key);
          } catch {
            // Server Components cannot set cookies. Middleware refreshes them.
          }
        },
      },
    },
  });
}
