import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://apuacmltpgvqdltfrakr.supabase.co'

let _db: SupabaseClient | null = null

export function getDb(): SupabaseClient {
  if (!_db) {
    _db = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY!)
  }
  return _db
}

export const db = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getDb() as any)[prop]
  },
})
