import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const validUrl =
    url && url.startsWith("http") && !url.includes("your-supabase-url")
      ? url
      : "https://placeholder.supabase.co";
  const validKey = key && !key.includes("your-supabase-anon-key") ? key : "placeholder-key";

  return createBrowserClient(validUrl, validKey);
}
