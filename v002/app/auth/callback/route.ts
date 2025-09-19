import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  if (error) {
    console.error('OAuth callback error:', error, error_description)
    return NextResponse.redirect(`${requestUrl.origin}?auth_error=${error}`)
  }

  if (code && supabase) {
    try {
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      if (sessionError) {
        console.error('Session exchange error:', sessionError)
        return NextResponse.redirect(`${requestUrl.origin}?auth_error=session_exchange_failed`)
      }
    } catch (err) {
      console.error('Callback processing error:', err)
      return NextResponse.redirect(`${requestUrl.origin}?auth_error=callback_failed`)
    }
  }

  // Redirect to home page after successful auth
  return NextResponse.redirect(requestUrl.origin)
}