import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';

let browserClientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window !== 'undefined' && browserClientInstance) {
    return browserClientInstance;
  }

  const client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  if (typeof window !== 'undefined') {
    browserClientInstance = client;
  }

  return client;
}

export function getSupabaseBrowserClient() {
  return createClient();
}

export default createClient;
