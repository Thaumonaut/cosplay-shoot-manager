import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Shoot } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Lightbulb, Clock, Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { UpcomingShootsSection } from "@/components/UpcomingShootsSection";
import { ShootCalendar } from "@/components/ShootCalendar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { AddShootDialog } from "@/components/AddShootDialog";
import { ShootDetailView } from "@/components/ShootDetailView";
import heroImage from '@assets/generated_images/Cosplay_photo_shoot_hero_image_70beec03.png';

export default function Dashboard() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedShootId, setSelectedShootId] = useState<string | null>(null);

  const { data: shoots = [], isLoading } = useQuery<Shoot[]>({
    queryKey: ["/api/shoots"],
  });

  const selectedShoot = shoots.find((shoot) => shoot.id === selectedShootId);

  const getStatusFromShoot = (shoot: Shoot): 'idea' | 'planning' | 'scheduled' | 'completed' => {
    return shoot.status as 'idea' | 'planning' | 'scheduled' | 'completed';
  };

  const upcomingShoots = shoots
    .filter((shoot) => shoot.status === 'scheduled' && shoot.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .slice(0, 3)
    .map((shoot) => {
      const daysUntil = Math.ceil((new Date(shoot.date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return {
        id: shoot.id,
        title: shoot.title,
        date: new Date(shoot.date!),
        location: shoot.location || 'TBD',
        image: heroImage,
        hasCalendar: !!shoot.calendarEventUrl,
        hasDocs: !!shoot.docsUrl,
        countdown: daysUntil === 1 ? '1 day' : daysUntil < 7 ? `${daysUntil} days` : `${Math.ceil(daysUntil / 7)} week${Math.ceil(daysUntil / 7) === 1 ? '' : 's'}`,
      };
    });

  const calendarShoots = shoots
    .filter((shoot) => shoot.date)
    .map((shoot) => ({
      id: shoot.id,
      title: shoot.title,
      date: new Date(shoot.date!),
      status: getStatusFromShoot(shoot),
    }));

  const kanbanColumns = [
    {
      id: 'idea',
      title: 'Ideas',
      icon: Lightbulb,
      shoots: shoots
        .filter((shoot) => shoot.status === 'idea')
        .map((shoot) => ({
          id: shoot.id,
          title: shoot.title,
          image: heroImage,
          referenceCount: 0,
        })),
    },
    {
      id: 'planning',
      title: 'Planning',
      icon: Clock,
      shoots: shoots
        .filter((shoot) => shoot.status === 'planning')
        .map((shoot) => ({
          id: shoot.id,
          title: shoot.title,
          image: heroImage,
          location: shoot.location || undefined,
          participants: 0,
          hasDocs: !!shoot.docsUrl,
          referenceCount: 0,
        })),
    },
    {
      id: 'scheduled',
      title: 'Scheduled',
      icon: Calendar,
      shoots: shoots
        .filter((shoot) => shoot.status === 'scheduled')
        .map((shoot) => ({
          id: shoot.id,
          title: shoot.title,
          image: heroImage,
          location: shoot.location || undefined,
          participants: 0,
          hasCalendar: !!shoot.calendarEventUrl,
          hasDocs: !!shoot.docsUrl,
          referenceCount: 0,
        })),
    },
    {
      id: 'completed',
      title: 'Completed',
      icon: CheckCircle2,
      shoots: shoots
        .filter((shoot) => shoot.status === 'completed')
        .map((shoot) => ({
          id: shoot.id,
          title: shoot.title,
          location: shoot.location || undefined,
          participants: 0,
          referenceCount: 0,
        })),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-shoots" />
      </div>
    );
  }

  if (selectedShootId && selectedShoot) {
    return (
      <ShootDetailView
        shoot={{
          id: selectedShoot.id,
          title: selectedShoot.title,
          status: getStatusFromShoot(selectedShoot),
          date: selectedShoot.date ? new Date(selectedShoot.date) : undefined,
          location: selectedShoot.location || undefined,
          description: selectedShoot.description || '',
          participants: [],
          references: [],
          instagramLinks: selectedShoot.instagramLinks || [],
          calendarEventUrl: selectedShoot.calendarEventUrl || undefined,
          docsUrl: selectedShoot.docsUrl || undefined,
        }}
        onBack={() => setSelectedShootId(null)}
        onEdit={() => console.log('Edit shoot')}
        onDelete={() => {
          console.log('Delete shoot');
          setSelectedShootId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Upcoming Shoots</h1>
          <p className="text-muted-foreground">
            Plan and track your cosplay photo sessions
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setAddDialogOpen(true)}
          data-testid="button-add-shoot"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Shoot
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <UpcomingShootsSection
            shoots={upcomingShoots}
            onShootClick={(id) => setSelectedShootId(id)}
          />
        </div>
        
        <div>
          <ShootCalendar
            shoots={calendarShoots}
            onShootClick={(id) => setSelectedShootId(id)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">All Shoots</h2>
        <KanbanBoard
          columns={kanbanColumns}
          onShootClick={(id) => setSelectedShootId(id)}
        />
      </div>

      <AddShootDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
