'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  useEffect(() => {
    // Redirect to landing page for public access
    redirect('/landing')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
}
