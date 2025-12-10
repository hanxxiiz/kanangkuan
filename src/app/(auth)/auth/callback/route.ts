import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Google OAuth returns a "code"
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const origin = request.nextUrl.origin
  const redirectTo = new URL(next, origin)

  if (code) {
    const supabase = await createClient()

    // 🔥 FIX: Exchange OAuth code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(redirectTo.toString())
    }
  }

  // fallback: must be absolute URL
  return NextResponse.redirect(new URL('/error', origin))
}
