'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{children}</>
  }

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