'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateEquipmentDialog } from '@/components/CreateEquipmentDialog'
import { Plus } from 'lucide-react'

interface Equipment {
  id: string
  name: string
  type: string
  status: string
  notes?: string
}

export default function EquipmentPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { data: equipment = [], isLoading } = useQuery<Equipment[]>({
    queryKey: ['/api/equipment'],
    queryFn: async () => {
      const response = await fetch('/api/equipment')
      if (!response.ok) throw new Error('Failed to fetch equipment')
      return response.json()
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipment</h1>
          <p className="text-muted-foreground">
            Manage your photography and cosplay equipment
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
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
      ) : equipment.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No equipment yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your photography and cosplay gear
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Equipment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((item) => (
            <Card key={item.id} className="hover-elevate cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.type}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : item.status === 'in-use'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateEquipmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false)
          // Refetch equipment
        }}
      />
    </div>
  )
}