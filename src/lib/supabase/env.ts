/**
 * Reads the public Supabase credentials. There is no local-database fallback:
 * production (Vercel) must have these set, including at build time, because
 * Next.js inlines NEXT_PUBLIC_* values into the server and client bundles.
 */
export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  const urlLooksPlaceholder =
    !url.startsWith("https://") ||
    url.includes("your-project") ||
    url.includes("your-supabase-url") ||
    url.includes("placeholder.supabase.co");

  const keyLooksPlaceholder =
    anonKey.length < 20 ||
    anonKey.includes("your-anon-key") ||
    anonKey.includes("your-supabase-anon-key") ||
    anonKey === "placeholder-key";

  if (urlLooksPlaceholder || keyLooksPlaceholder) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the Vercel project (Production, Preview, and Development), then redeploy so the values are present at build time."
    );
  }

  return { url, anonKey };
}
