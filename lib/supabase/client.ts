import { createClient } from "@supabase/supabase-js";

let browserClient: ReturnType<typeof createClient> | undefined;

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: {
        storage: {
          getItem: (key) => {
            const cookie = document.cookie.split("; ").find((item) => item.startsWith(`${key}=`));
            return cookie ? decodeURIComponent(cookie.slice(key.length + 1)) : null;
          },
          setItem: (key, value) => {
            const secure = window.location.protocol === "https:" ? "; Secure" : "";
            document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${secure}`;
          },
          removeItem: (key) => {
            document.cookie = `${key}=; Path=/; Max-Age=0; SameSite=Lax`;
          },
        },
      },
    });
  }

  return browserClient;
}
