'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

interface DevOnlyProps {
  children: ReactNode
  pageName?: string
}

export function DevOnlyWrapper({ children, pageName = 'Development Page' }: DevOnlyProps) {
  // Only show content in development mode
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <Badge variant="destructive">PRODUCTION</Badge>
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              The <strong>{pageName}</strong> is only available in development mode for security and performance reasons.
            </p>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium">For developers:</p>
              <p className="text-muted-foreground">
                Set <code>NODE_ENV=development</code> to access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // In development, show the wrapped content
  return (
    <div className="min-w-0">
      {children}
    </div>
  )
}

export default DevOnlyWrapper