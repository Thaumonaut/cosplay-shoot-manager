'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Define public/marketing pages that should not show sidebar
  const publicPages = [
    '/',
    '/landing',
    '/auth',
    '/auth/callback',
    '/privacy',
    '/terms',
    '/contact'
  ]

  const isPublicPage = publicPages.includes(pathname) || pathname.startsWith('/(marketing)')

  // Show loading spinner during auth initialization (only on non-public pages)
  if (loading && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Show children without sidebar for public pages or unauthenticated users
  if (isPublicPage || !user) {
    return <>{children}</>
  }

  // Show full layout with sidebar for authenticated users on functional pages
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 overflow-auto p-6 bg-background min-h-screen">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}