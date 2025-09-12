import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// Safe environment variable access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Demo mode flag
export const isDemoMode = !supabaseUrl || !supabaseAnonKey

export async function createServerSupabaseClient() {
  if (isDemoMode) {
    console.warn('⚠️ Supabase environment variables not found. Running in demo mode.')
    return null
  }

  const cookieStore = cookies()

  return createServerClient<Database>(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie errors in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie errors in Server Components
          }
        },
      },
    }
  )
}

export async function createServiceSupabaseClient() {
  if (isDemoMode || !supabaseServiceKey) {
    console.warn('⚠️ Service role key not found. Some features may not work.')
    return null
  }

  const cookieStore = cookies()

  return createServerClient<Database>(
    supabaseUrl!,
    supabaseServiceKey!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie errors
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Helper function to get current user
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  if (!supabase) return null

  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  return user
}

// Helper function to get user profile
export async function getUserProfile(userId?: string) {
  const supabase = await createServerSupabaseClient()
  if (!supabase) return null

  const currentUserId = userId || (await getCurrentUser())?.id
  if (!currentUserId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', currentUserId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}
