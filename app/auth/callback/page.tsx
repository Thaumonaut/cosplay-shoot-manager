'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth?error=callback_error')
          return
        }

        if (data.session) {
          // Send session to backend to set cookies
          const res = await fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at,
            }),
            credentials: 'include',
          })

          if (res.ok) {
            await refreshUser()
            router.push('/dashboard')
          } else {
            console.error('Failed to set session')
            router.push('/auth?error=session_error')
          }
        } else {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Auth callback exception:', error)
        router.push('/auth?error=unknown_error')
      } finally {
        setIsProcessing(false)
      }
    }

    handleAuthCallback()
  }, [router, refreshUser])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">
          {isProcessing ? 'Processing authentication...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  )
}