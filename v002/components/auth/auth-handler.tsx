'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function AuthHandler() {
  const router = useRouter()

  useEffect(() => {
    // Handle hash-based auth callback
    const handleHashAuth = async () => {
      if (typeof window === 'undefined') return

      const hash = window.location.hash
      console.log('Auth handler - hash detected:', hash ? 'Yes' : 'No')

      if (hash && hash.includes('access_token')) {
        console.log('Auth handler - processing token from hash')
        // Parse the hash parameters
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        console.log('Auth handler - tokens found:', {
          hasAccess: !!accessToken,
          hasRefresh: !!refreshToken,
          hasSupabase: !!supabase
        })

        if (accessToken && refreshToken && supabase) {
          try {
            // Set the session manually
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })

            console.log('Auth handler - session set result:', {
              success: !!data,
              error: error?.message
            })

            // Clean up the URL
            window.history.replaceState(null, '', window.location.pathname)

            // Refresh the page to update auth state
            router.refresh()

            // Force a reload to ensure auth state is updated
            setTimeout(() => window.location.reload(), 100)
          } catch (err) {
            console.error('Auth handler - error setting session:', err)
          }
        }
      }
    }

    handleHashAuth()

    // Also listen for auth state changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
          router.refresh()
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [router])

  return null
}