'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShootCard } from '@/components/ShootCard'
import { AccordionShoots } from '@/components/AccordionShoots'
import { ShootCalendar } from '@/components/ShootCalendar'
import { KanbanBoard } from '@/components/KanbanBoard'
import { Plus, Grid, List, Calendar, Kanban, MapPin } from 'lucide-react'

interface Shoot {
  id: string
  title: string
  description: string
  scheduledDate: string
  status: string
  coverImage?: string
  location?: {
    name: string
  }
}

export default function ShootsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar' | 'kanban'>('grid')

  const { data: shoots = [], isLoading } = useQuery<Shoot[]>({
    queryKey: ['/api/shoots'],
    queryFn: async () => {
      const response = await fetch('/api/shoots')
      if (!response.ok) throw new Error('Failed to fetch shoots')
      return response.json()
    }
  })

  const handleShootClick = (shoot: Shoot) => {
    router.push(`/shoots/${shoot.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Photo Shoots</h1>
          <p className="text-muted-foreground">
            Plan and manage your cosplay photo shoots
          </p>
        </div>
        <Button onClick={() => router.push('/shoots/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Shoot
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          <Grid className="h-4 w-4 mr-2" />
          Grid
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
        >
          <List className="h-4 w-4 mr-2" />
          List
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('calendar')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Calendar
        </Button>
        <Button
          variant={viewMode === 'kanban' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('kanban')}
        >
          <Kanban className="h-4 w-4 mr-2" />
          Kanban
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted"></div>
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : shoots.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No shoots yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first photo shoot to get started
            </p>
            <Button onClick={() => router.push('/shoots/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Shoot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shoots.map((shoot) => (
                <Card key={shoot.id} className="hover-elevate cursor-pointer" onClick={() => handleShootClick(shoot)}>
                  {shoot.coverImage && (
                    <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                      <img
                        src={shoot.coverImage}
                        alt={shoot.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{shoot.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {shoot.description}
                    </p>
                    <div className="space-y-2">
                      {shoot.scheduledDate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-2" />
                          {new Date(shoot.scheduledDate).toLocaleDateString()}
                        </div>
                      )}
                      {shoot.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-2" />
                          {shoot.location.name}
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          shoot.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : shoot.status === 'ready to shoot'
                            ? 'bg-blue-100 text-blue-800'
                            : shoot.status === 'planning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {shoot.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-4">
              {shoots.map((shoot) => (
                <Card key={shoot.id} className="hover-elevate cursor-pointer" onClick={() => handleShootClick(shoot)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{shoot.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {shoot.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {shoot.scheduledDate && (
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(shoot.scheduledDate).toLocaleDateString()}
                            </span>
                          )}
                          {shoot.location && (
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {shoot.location.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        shoot.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : shoot.status === 'ready to shoot'
                          ? 'bg-blue-100 text-blue-800'
                          : shoot.status === 'planning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {shoot.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'calendar' && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Calendar view coming soon</p>
              </CardContent>
            </Card>
          )}

          {viewMode === 'kanban' && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Kanban view coming soon</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}