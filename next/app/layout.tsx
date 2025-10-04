import './globals.css'
import type { ReactNode } from 'react'
import { Space_Grotesk } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/components/QueryProvider'
// import { ThemeProvider } from '@/components/ThemeProvider'
import AppLayout from '@/components/AppLayout'
import { Toaster } from '@/components/ui/toaster'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen antialiased ${spaceGrotesk.variable} font-sans`}>
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
