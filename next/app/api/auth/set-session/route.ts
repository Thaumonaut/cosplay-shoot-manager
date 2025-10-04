import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { signToken } from '@/lib/auth'
import { storage } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const { access_token, refresh_token, expires_at } = await req.json()
    
    if (!access_token || !refresh_token || !expires_at) {
      return NextResponse.json({ error: 'Missing session data' }, { status: 400 })
    }

    // Verify the session with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(access_token)
    
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Create our own JWT token for the user
    const token = signToken({ 
      userId: user.id, 
      email: user.email || '' 
    })

    // Make sure the user profile exists in our storage
    let profile = await storage.getUserProfile(user.id)
    if (!profile) {
      try {
        profile = await storage.createUserProfile({
          userId: user.id,
          email: user.email || '',
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          avatarUrl: user.user_metadata?.avatar_url || ''
        })
      } catch (error) {
        console.warn('Could not create user profile:', error)
      }
    }

    // Set the auth cookie
    const response = NextResponse.json({ user })
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Set to false for localhost development
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Set session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}