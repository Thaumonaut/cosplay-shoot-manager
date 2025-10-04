'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { ShootCard } from '@/components/ShootCard'
import { AccordionShoots } from '@/components/AccordionShoots'
import { ShootCalendar } from '@/components/ShootCalendar'
import { KanbanBoard } from '@/components/KanbanBoard'
import { DashboardSkeleton } from '@/components/DashboardSkeleton'
import { UpcomingShootsSection } from '@/components/UpcomingShootsSection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, RefreshCcw, Camera, Sparkles } from 'lucide-react'
import { Lightbulb, Clock, Calendar, CheckCircle2 } from 'lucide-react'
import { isSameDay, format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { data: shoots = [], isLoading: loading, error } = useQuery({
    queryKey: ['/api/shoots'],
    queryFn: async () => {
      const response = await fetch('/api/shoots', { credentials: 'include' })
      if (!response.ok) throw new Error('Failed to fetch shoots')
      return response.json()
    }
  })
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const getStatusFromShoot = (shoot: any): "idea" | "planning" | "ready to shoot" | "completed" => {
    return shoot.status as "idea" | "planning" | "ready to shoot" | "completed"
  }

  const upcomingShoots = shoots
    .filter(
      (shoot: any) =>
        (shoot.status === "ready to shoot" || shoot.status === "planning") &&
        shoot.date,
    )
    .sort((a: any, b: any) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .slice(0, 3)
    .map((shoot: any) => {
      const daysUntil = Math.ceil(
        (new Date(shoot.date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
      return {
        id: shoot.id,
        title: shoot.title,
        date: new Date(shoot.date!),
        location: shoot.locationNotes || "TBD",
        hasCalendar: !!shoot.calendarEventUrl,
        hasDocs: !!shoot.docsUrl,
        countdown:
          daysUntil === 1
            ? "1 day"
            : daysUntil < 7
              ? `${daysUntil} days`
              : `${Math.ceil(daysUntil / 7)} week${Math.ceil(daysUntil / 7) === 1 ? "" : "s"}`,
      }
    })

  const calendarShoots = shoots
    .filter((shoot: any) => shoot.date)
    .map((shoot: any) => ({
      id: shoot.id,
      title: shoot.title,
      date: new Date(shoot.date!),
      status: getStatusFromShoot(shoot),
      color: shoot.color || undefined,
    }))

  // Filter shoots for the selected day
  const selectedDayShoots = shoots.filter(
    (shoot: any) => shoot.date && isSameDay(new Date(shoot.date), selectedDate)
  )

  const kanbanColumns = [
    {
      id: "idea",
      title: "Ideas",
      icon: Lightbulb,
      shoots: shoots
        .filter((shoot: any) => shoot.status === "idea")
        .map((shoot: any) => ({
          id: shoot.id,
          title: shoot.title,
          referenceCount: 0,
        })),
    },
    {
      id: "planning",
      title: "Planning",
      icon: Clock,
      shoots: shoots
        .filter((shoot: any) => shoot.status === "planning")
        .map((shoot: any) => ({
          id: shoot.id,
          title: shoot.title,
          location: shoot.locationNotes || undefined,
          participants: 0,
          hasDocs: !!shoot.docsUrl,
          referenceCount: 0,
        })),
    },
    {
      id: "ready to shoot",
      title: "Ready to Shoot",
      icon: Calendar,
      shoots: shoots
        .filter((shoot: any) => shoot.status === "ready to shoot")
        .map((shoot: any) => ({
          id: shoot.id,
          title: shoot.title,
          location: shoot.locationNotes || undefined,
          participants: 0,
          hasCalendar: !!shoot.calendarEventUrl,
          hasDocs: !!shoot.docsUrl,
          referenceCount: 0,
        })),
    },
    {
      id: "completed",
      title: "Completed",
      icon: CheckCircle2,
      shoots: shoots
        .filter((shoot: any) => shoot.status === "completed")
        .map((shoot: any) => ({
          id: shoot.id,
          title: shoot.title,
          location: shoot.locationNotes || undefined,
          participants: 0,
          referenceCount: 0,
        })),
    },
  ]

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full" data-testid="card-error">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Camera className="h-12 w-12 text-primary" />
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Oops! Our Database is Taking a Cosplay Break
              </h3>
              <p
                className="text-sm text-muted-foreground"
                data-testid="text-error-message"
              >
                It seems our database wandered off to a photoshoot and forgot to
                leave a note. Don&apos;t worry, we&apos;ll track it down!
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="gap-2"
              data-testid="button-retry"
            >
              <RefreshCcw className="h-4 w-4" />
              Try Finding It Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Upcoming Shoots</h1>
          <p className="text-muted-foreground">Plan and track your cosplay photo sessions</p>
        </div>
        <Button
          size="lg"
          onClick={() => router.push("/shoots/new")}
          data-testid="button-add-shoot"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Shoot
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ShootCalendar
            shoots={calendarShoots}
            onShootClick={(id) => router.push(`/shoots/${id}`)}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Events on {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayShoots.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayShoots.map((shoot: any) => (
                    <div
                      key={shoot.id}
                      onClick={() => router.push(`/shoots/${shoot.id}`)}
                      className="p-3 rounded-lg border cursor-pointer hover-elevate flex items-center gap-3"
                      data-testid={`selected-day-shoot-${shoot.id}`}
                    >
                      {shoot.color && (
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: shoot.color }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{shoot.title}</h3>
                        {shoot.locationNotes && (
                          <p className="text-sm text-muted-foreground truncate">{shoot.locationNotes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No events scheduled for this day</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">All Shoots</h2>
        <AccordionShoots
          shoots={shoots}
          onShootClick={(id) => router.push(`/shoots/${id}`)}
        />
      </div>
    </div>
  )
}
