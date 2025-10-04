import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const pathname = url.pathname

    if (pathname.endsWith('/set-session')) {
      const { access_token, refresh_token, expires_at } = await req.json()
      if (!access_token || !refresh_token || !expires_at) {
        return NextResponse.json({ error: 'Missing session data' }, { status: 400 })
      }
      const { data: { user }, error } = await supabase.auth.getUser(access_token)
      if (error || !user) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
      // TODO: Set cookies for session (Vercel may require custom logic)
      return NextResponse.json({ user })
    }

    if (pathname.endsWith('/signout')) {
      // TODO: Clear cookies for session
      return NextResponse.json({ success: true })
    }

    // Default login with email/password
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, 
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    })

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      )
    }

    const token = signToken({ 
      userId: data.user.id, 
      email: data.user.email 
    })

    return NextResponse.json({
      user: data.user,
      token
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    if (url.pathname.endsWith('/delete-account')) {
      // TODO: Authenticate user and delete account
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}