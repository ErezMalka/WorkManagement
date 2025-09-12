import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Safe environment variable access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Demo mode flag
export const isDemoMode = !supabaseUrl || !supabaseAnonKey

// Create client with fallback for demo mode
export function createClient() {
  if (isDemoMode) {
    console.warn('⚠️ Supabase environment variables not found. Running in demo mode.')
    // Return a mock client for demo mode
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: new Error('Demo mode') }),
        signUp: async () => ({ data: null, error: new Error('Demo mode') }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: null })
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          download: () => Promise.resolve({ data: null, error: null }),
          createSignedUrl: () => Promise.resolve({ data: null, error: null }),
          remove: () => Promise.resolve({ data: null, error: null })
        })
      }
    } as any
  }

  return createBrowserClient<Database>(
    supabaseUrl!,
    supabaseAnonKey!
  )
}

// Export a singleton instance
export const supabase = createClient()
