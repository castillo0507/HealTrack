import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublicKey);

let browserClient: SupabaseClient | null = null;

function requireSupabaseEnv() {
  if (!supabaseUrl || !supabasePublicKey) {
    throw new Error(
      "Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }

  return { supabaseUrl, supabasePublicKey };
}

export function getSupabaseBrowserClient() {
  const { supabaseUrl: url, supabasePublicKey: key } = requireSupabaseEnv();

  if (!browserClient) {
    browserClient = createClient(url, key);
  }

  return browserClient;
}

export function getSupabaseServerClient() {
  const { supabaseUrl: url, supabasePublicKey: key } = requireSupabaseEnv();

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
