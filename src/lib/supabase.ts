import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseEnabled = Boolean(url && key);

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url as string, key as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

/**
 * When Supabase env vars are present, auth calls go to Supabase Auth.
 * Catalog, inquiries and messages still hydrate from the local store so the
 * app is fully usable before a project is linked. The SQL schema in
 * `supabase/schema.sql` is the source of truth for a hosted database.
 */
export async function supabaseSignIn(email: string, password: string) {
  if (!supabase) return { ok: false as const, reason: "Supabase is not configured." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false as const, reason: error.message };
  return { ok: true as const };
}

export async function supabaseSignUp(email: string, password: string, meta: Record<string, string>) {
  if (!supabase) return { ok: false as const, reason: "Supabase is not configured." };
  const { error } = await supabase.auth.signUp({ email, password, options: { data: meta } });
  if (error) return { ok: false as const, reason: error.message };
  return { ok: true as const };
}

export async function supabaseSignOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
