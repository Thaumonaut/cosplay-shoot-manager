import './globals.css'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-background text-foreground">
        <AuthProvider>
          <div className="container mx-auto px-4 py-8">{children}</div>
        </AuthProvider>
      </body>
    </html>
  )
}
