import { createClient } from '@supabase/supabase-js'

// Polyfill AbortSignal.timeout for iOS < 16.4
if (typeof AbortSignal !== 'undefined' && typeof (AbortSignal as any).timeout === 'undefined') {
  ;(AbortSignal as any).timeout = (ms: number): AbortSignal => {
    const ctrl = new AbortController()
    setTimeout(() => ctrl.abort(new DOMException('TimeoutError', 'TimeoutError')), ms)
    return ctrl.signal
  }
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
