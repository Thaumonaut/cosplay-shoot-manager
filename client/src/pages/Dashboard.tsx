import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import type { Shoot } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw, Camera, Sparkles } from "lucide-react";
import { Lightbulb, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { isSameDay, format } from "date-fns";
import { UpcomingShootsSection } from "@/components/UpcomingShootsSection";
import { ShootCalendar } from "@/components/ShootCalendar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { AccordionShoots } from "@/components/AccordionShoots";
import { ShootDialog } from "@/components/ShootDialog";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import heroImage from "@assets/generated_images/Cosplay_photo_shoot_hero_image_70beec03.png";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [location] = useLocation();
  const [, params] = useRoute("/status/:status");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedShootId, setSelectedShootId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  const {
    data: shoots = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Shoot[]>({
    queryKey: ["/api/shoots"],
    retry: 2,
    retryDelay: 1000,
  });


  const exportDocsMutation = useMutation({
    mutationFn: async (shootId: string) => {
      const res = await apiRequest("POST", `/api/shoots/${shootId}/export-doc`);
      return (await res.json()) as { docId: string; docUrl: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      toast({
        title: "Export Successful",
        description: "Your shoot has been exported to Google Docs.",
      });
      if (data?.docUrl) {
        window.open(data.docUrl, "_blank");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description:
          error.message || "Failed to export to Google Docs. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createCalendarMutation = useMutation({
    mutationFn: async (shootId: string) => {
      const res = await apiRequest(
        "POST",
        `/api/shoots/${shootId}/create-calendar-event`,
      );
      const data = await res.json();

      // Handle 409 (conflict - event already exists) as success
      if (res.status === 409) {
        return { ...data, alreadyExists: true };
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to create calendar event");
      }

      return data as { eventId: string; eventUrl: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });

      if (data.alreadyExists) {
        toast({
          title: "Calendar Event Exists",
          description: "This shoot is already on your Google Calendar.",
        });
      } else {
        toast({
          title: "Calendar Event Created",
          description: "Your shoot has been added to Google Calendar.",
        });
      }

      if (data?.eventUrl) {
        window.open(data.eventUrl, "_blank");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Calendar Creation Failed",
        description:
          error.message || "Failed to create calendar event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendRemindersMutation = useMutation({
    mutationFn: async (shootId: string) => {
      const res = await apiRequest(
        "POST",
        `/api/shoots/${shootId}/send-reminders`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reminders");
      }

      return data as { success: boolean; count: number; message: string };
    },
    onSuccess: (data) => {
      toast({
        title: "Reminders Sent",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Reminders",
        description:
          error.message || "Failed to send email reminders. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteShootMutation = useMutation({
    mutationFn: async (shootId: string) => {
      await apiRequest("DELETE", `/api/shoots/${shootId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      setSelectedShootId(null);
      toast({
        title: "Shoot deleted",
        description: "The shoot has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete shoot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusFromShoot = (
    shoot: Shoot,
  ): "idea" | "planning" | "scheduled" | "completed" => {
    return shoot.status as "idea" | "planning" | "scheduled" | "completed";
  };

  const upcomingShoots = shoots
    .filter(
      (shoot) =>
        (shoot.status === "scheduled" || shoot.status === "planning") &&
        shoot.date,
    )
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .slice(0, 3)
    .map((shoot) => {
      const daysUntil = Math.ceil(
        (new Date(shoot.date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      return {
        id: shoot.id,
        title: shoot.title,
        date: new Date(shoot.date!),
        location: shoot.locationNotes || "TBD",
        image: heroImage,
        hasCalendar: !!shoot.calendarEventUrl,
        hasDocs: !!shoot.docsUrl,
        countdown:
          daysUntil === 1
            ? "1 day"
            : daysUntil < 7
              ? `${daysUntil} days`
              : `${Math.ceil(daysUntil / 7)} week${Math.ceil(daysUntil / 7) === 1 ? "" : "s"}`,
      };
    });

  const calendarShoots = shoots
    .filter((shoot) => shoot.date)
    .map((shoot) => ({
      id: shoot.id,
      title: shoot.title,
      date: new Date(shoot.date!),
      status: getStatusFromShoot(shoot),
      color: shoot.color || undefined,
    }));

  // Filter shoots for the selected day
  const selectedDayShoots = shoots.filter(
    (shoot) => shoot.date && isSameDay(new Date(shoot.date), selectedDate)
  );

  const statusFilter = params?.status as string | undefined;
  const filteredShoots = statusFilter
    ? shoots.filter((shoot) => shoot.status === statusFilter)
    : shoots;

  const kanbanColumns = [
    {
      id: "idea",
      title: "Ideas",
      icon: Lightbulb,
      shoots: filteredShoots
        .filter((shoot) => shoot.status === "idea")
        .map((shoot) => ({
          id: shoot.id,
          title: shoot.title,
          image: heroImage,
          referenceCount: 0,
        })),
    },
    {
      id: "planning",
      title: "Planning",
      icon: Clock,
      shoots: filteredShoots
        .filter((shoot) => shoot.status === "planning")
        .map((shoot) => ({
          id: shoot.id,
          title: shoot.title,
          image: heroImage,
          location: shoot.locationNotes || undefined,
          participants: 0,
          hasDocs: !!shoot.docsUrl,
          referenceCount: 0,
        })),
    },
    {
      id: "scheduled",
      title: "Scheduled",
      icon: Calendar,
      shoots: filteredShoots
        .filter((shoot) => shoot.status === "scheduled")
        .map((shoot) => ({
          id: shoot.id,
          title: shoot.title,
          image: heroImage,
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
      shoots: filteredShoots
        .filter((shoot) => shoot.status === "completed")
        .map((shoot) => ({
          id: shoot.id,
          title: shoot.title,
          location: shoot.locationNotes || undefined,
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
                leave a note. Don't worry, we'll track it down!
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="gap-2"
              disabled={isFetching}
              data-testid="button-retry"
            >
              <RefreshCcw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              {isFetching
                ? "Searching for the database..."
                : "Try Finding It Again"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  const getPageTitle = () => {
    if (statusFilter) {
      return statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
    }
    if (location === "/calendar") {
      return "Calendar View";
    }
    if (location === "/shoots") {
      return "All Shoots";
    }
    return "Upcoming Shoots";
  };

  const getPageDescription = () => {
    if (statusFilter) {
      return `View all ${statusFilter} shoots`;
    }
    if (location === "/calendar") {
      return "View your shoots in calendar format";
    }
    if (location === "/shoots") {
      return "Browse and manage all your shoots";
    }
    return "Plan and track your cosplay photo sessions";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">{getPageTitle()}</h1>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>
        <Button
          size="lg"
          onClick={() => {
            setDialogMode('create');
            setSelectedShootId(null);
            setDialogOpen(true);
          }}
          data-testid="button-add-shoot"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Shoot
        </Button>
      </div>

      {location === "/calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ShootCalendar
              shoots={calendarShoots}
              onShootClick={(id) => {
                setSelectedShootId(id);
                setDialogMode('edit');
                setDialogOpen(true);
              }}
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
                    {selectedDayShoots.map((shoot) => (
                      <div
                        key={shoot.id}
                        onClick={() => {
                          setSelectedShootId(shoot.id);
                          setDialogMode('edit');
                          setDialogOpen(true);
                        }}
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
      ) : location === "/" && !statusFilter ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ShootCalendar
                shoots={calendarShoots}
                onShootClick={(id) => {
                setSelectedShootId(id);
                setDialogMode('edit');
                setDialogOpen(true);
              }}
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
                      {selectedDayShoots.map((shoot) => (
                        <div
                          key={shoot.id}
                          onClick={() => {
                          setSelectedShootId(shoot.id);
                          setDialogMode('edit');
                          setDialogOpen(true);
                        }}
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
              onShootClick={(id) => {
                setSelectedShootId(id);
                setDialogMode('edit');
                setDialogOpen(true);
              }}
            />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <KanbanBoard
            columns={kanbanColumns}
            onShootClick={(id) => {
              setSelectedShootId(id);
              setDialogMode('edit');
              setDialogOpen(true);
            }}
          />
        </div>
      )}

      <ShootDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedShootId(null);
          }
        }}
        mode={dialogMode}
        shootId={selectedShootId || undefined}
      />
    </div>
  );
}
