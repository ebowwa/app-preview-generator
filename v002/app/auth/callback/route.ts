import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code && supabase) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to home page after successful auth
  return NextResponse.redirect(requestUrl.origin)
}