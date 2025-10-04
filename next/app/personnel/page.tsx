'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CreatePersonnelDialog } from '@/components/CreatePersonnelDialog'
import { Plus, Users } from 'lucide-react'

interface Personnel {
  id: string
  name: string
  role: string
  email?: string
  phone?: string
  notes?: string
  avatar?: string
}

export default function PersonnelPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { data: personnel = [], isLoading } = useQuery<Personnel[]>({
    queryKey: ['/api/personnel'],
    queryFn: async () => {
      const response = await fetch('/api/personnel')
      if (!response.ok) throw new Error('Failed to fetch personnel')
      return response.json()
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personnel</h1>
          <p className="text-muted-foreground">
            Manage your team members and collaborators
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
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
      ) : personnel.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No personnel yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your team directory
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Team Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personnel.map((person) => (
            <Card key={person.id} className="hover-elevate cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={person.avatar} />
                    <AvatarFallback>
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{person.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{person.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {person.email && (
                    <p className="text-sm text-muted-foreground">
                      {person.email}
                    </p>
                  )}
                  {person.phone && (
                    <p className="text-sm text-muted-foreground">
                      {person.phone}
                    </p>
                  )}
                  {person.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {person.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreatePersonnelDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false)
          // Refetch personnel
        }}
      />
    </div>
  )
}