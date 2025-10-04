'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShootCard } from '@/components/ShootCard'
import { AccordionShoots } from '@/components/AccordionShoots'
import { ShootCalendar } from '@/components/ShootCalendar'
import { KanbanBoard } from '@/components/KanbanBoard'
import { StatusBadge } from '@/components/StatusBadge'
import { ArrowLeft, Calendar, Users, MapPin, Camera } from 'lucide-react'

interface Shoot {
  id: string
  title: string
  description: string
  scheduledDate: string
  status: string
  location?: {
    name: string
    address: string
  }
  personnel?: Array<{
    id: string
    name: string
    role: string
  }>
  equipment?: Array<{
    id: string
    name: string
    type: string
  }>
  costumes?: Array<{
    id: string
    name: string
    character: string
  }>
}

export default function ShootDetailPage() {
  const params = useParams()
  const router = useRouter()
  const shootId = params.id as string

  const { data: shoot, isLoading } = useQuery<Shoot>({
    queryKey: ['/api/shoots', shootId],
    queryFn: async () => {
      const response = await fetch(`/api/shoots/${shootId}`)
      if (!response.ok) throw new Error('Failed to fetch shoot')
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!shoot) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Shoot not found</h1>
        <p className="text-muted-foreground mb-4">The shoot you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => router.push('/shoots')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shoots
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/shoots')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{shoot.title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <StatusBadge status={shoot.status as 'idea' | 'planning' | 'ready to shoot' | 'completed'} />
            {shoot.scheduledDate && (
              <span className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(shoot.scheduledDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {shoot.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>

          {shoot.location && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="font-medium">{shoot.location.name}</p>
                  <p className="text-sm text-muted-foreground">{shoot.location.address}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {shoot.personnel && shoot.personnel.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Personnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shoot.personnel.map((person) => (
                    <div key={person.id} className="flex items-center justify-between">
                      <span className="font-medium">{person.name}</span>
                      <span className="text-sm text-muted-foreground">{person.role}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {shoot.equipment && shoot.equipment.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  Equipment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shoot.equipment.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {shoot.costumes && shoot.costumes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Costumes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shoot.costumes.map((costume) => (
                    <div key={costume.id} className="p-3 border rounded-lg">
                      <p className="font-medium">{costume.name}</p>
                      <p className="text-sm text-muted-foreground">{costume.character}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  Edit Shoot
                </Button>
                <Button className="w-full" variant="outline">
                  Export Details
                </Button>
                <Button className="w-full" variant="outline">
                  Add to Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}