import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Shoot } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw, AlertCircle } from "lucide-react";
import { Lightbulb, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { UpcomingShootsSection } from "@/components/UpcomingShootsSection";
import { ShootCalendar } from "@/components/ShootCalendar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { AddShootDialog } from "@/components/AddShootDialog";
import { ShootDetailView } from "@/components/ShootDetailView";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import heroImage from '@assets/generated_images/Cosplay_photo_shoot_hero_image_70beec03.png';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedShootId, setSelectedShootId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: shoots = [], isLoading, isError, error, refetch, isFetching } = useQuery<Shoot[]>({
    queryKey: ["/api/shoots"],
    retry: 2,
    retryDelay: 1000,
  });

  const exportDocsMutation = useMutation({
    mutationFn: async (shootId: string) => {
      const res = await apiRequest("POST", `/api/shoots/${shootId}/export-doc`);
      return await res.json() as { docId: string; docUrl: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      toast({
        title: "Export Successful",
        description: "Your shoot has been exported to Google Docs.",
      });
      if (data?.docUrl) {
        window.open(data.docUrl, '_blank');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export to Google Docs. Please try again.",
        variant: "destructive",
      });
    },
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
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full" data-testid="card-error">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-6xl">📸✨</div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Oops! Our Database is Taking a Cosplay Break</h3>
              <p className="text-sm text-muted-foreground" data-testid="text-error-message">
                It seems our database wandered off to a photoshoot and forgot to leave a note. Don't worry, we'll track it down!
              </p>
            </div>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              className="gap-2"
              disabled={isFetching}
              data-testid="button-retry"
            >
              <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Searching for the database...' : 'Try Finding It Again'}
            </Button>
          </CardContent>
        </Card>
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
        onExportDocs={() => exportDocsMutation.mutate(selectedShootId)}
        isExporting={exportDocsMutation.isPending}
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
