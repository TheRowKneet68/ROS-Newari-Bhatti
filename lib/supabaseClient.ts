// lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Client-side Supabase instance for use in React components/pages.
 *
 * Expects:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * If these env vars are missing in development you'll get a friendly warning.
 * In production the code throws so you don't accidentally deploy broken config.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  const message =
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';
  if (process.env.NODE_ENV === 'production') {
    // Fail hard in production
    throw new Error(message);
  } else {
    // Dev-friendly warning so you can still run local builds while you fix env vars
    // eslint-disable-next-line no-console
    console.warn(`[lib/supabaseClient] ${message}`);
  }
}

/**
 * Export a single Supabase client instance for use in the browser.
 *
 * Notes:
 * - This client is safe to use in browser/React components (it uses the anon key).
 * - Do NOT use a SERVICE_ROLE key on the client — that key must remain secret and only used server-side.
 */
export const supabase: SupabaseClient = createClient(
  url ?? '', // createClient requires strings; we already validated above
  anonKey ?? '',
  {
    // Browser-specific auth options:
    auth: {
      // Keep sessions in localStorage so auth persists across page refreshes
      persistSession: true,
      // If you use OAuth redirect flows in the browser, detect session from URL
      detectSessionInUrl: true,
    },
    // Optional: set a custom global fetch implementation if you need it
    // fetch: globalThis.fetch.bind(globalThis)
  }
);

export default supabase;

/**
 * Optional: server-side helper (commented).
 *
 * If you need to perform privileged operations from the server (server components,
 * API routes, or Next.js server actions), create a server-only Supabase client using
 * the SERVICE_ROLE key. NEVER expose the service role key to the browser.
 *
 * Example (server-only):
 *
 * import { createClient } from '@supabase/supabase-js';
 *
 * export function createServerSupabase() {
 *   const url = process.env.SUPABASE_URL;
 *   const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
 *   if (!url || !serviceRoleKey) {
 *     throw new Error('Missing server supabase env vars (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).');
 *   }
 *   return createClient(url, serviceRoleKey, { /* server options *\/ });
 * }
 *
 * Use the server helper only inside server code (getServerSideProps, API routes,
 * server actions, or server components).
 */
