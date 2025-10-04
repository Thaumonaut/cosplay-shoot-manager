'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateCostumesDialog } from '@/components/CreateCostumesDialog'
import { Plus } from 'lucide-react'

interface Costume {
  id: string
  name: string
  character: string
  series: string
  status: string
  notes?: string
}

export default function CostumesPage() {
  const router = useRouter()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { data: costumes = [], isLoading } = useQuery<Costume[]>({
    queryKey: ['/api/costumes'],
    queryFn: async () => {
      const response = await fetch('/api/costumes')
      if (!response.ok) throw new Error('Failed to fetch costumes')
      return response.json()
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Costumes</h1>
          <p className="text-muted-foreground">
            Manage your cosplay costume collection
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Costume
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : costumes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No costumes yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your costume collection
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Costume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {costumes.map((costume) => (
            <Card key={costume.id} className="hover-elevate cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">{costume.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {costume.character} • {costume.series}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      costume.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : costume.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {costume.status}
                    </span>
                  </div>
                  {costume.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {costume.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateCostumesDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false)
          // Refetch costumes
        }}
      />
    </div>
  )
}