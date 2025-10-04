import './globals.css'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/components/QueryProvider'
// import { ThemeProvider } from '@/components/ThemeProvider'
import AppLayout from '@/components/AppLayout'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen antialiased ${inter.variable} font-sans`}>
        {/* <ThemeProvider defaultTheme="dark"> */}
          <QueryProvider>
            <AuthProvider>
              <AppLayout>
                {children}
              </AppLayout>
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}
