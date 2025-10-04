import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { storage } from '@/lib/storage'

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    if (url.pathname.endsWith('/profile')) {
      const profile = await storage.getUserProfile(userId)
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }
      return NextResponse.json(profile)
    }

    return NextResponse.json({ 
      userId,
      message: 'User endpoint migrated to Next.js'
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    if (url.pathname.endsWith('/profile')) {
      // TODO: Handle avatar upload and profile update
      const body = await req.json()
      const updatedProfile = await storage.updateUserProfile(userId, body)
      return NextResponse.json(updatedProfile || { success: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}