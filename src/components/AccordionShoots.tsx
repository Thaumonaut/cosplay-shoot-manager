import { useState } from "react";
import type { Shoot } from "@/lib/shared-schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Clock, Calendar, CheckCircle2, MapPin, Users, Image } from "lucide-react";
import { format } from "date-fns";

interface EnrichedShoot extends Shoot {
  participantCount?: number;
  firstReferenceUrl?: string | null;
}

interface AccordionShootsProps {
  shoots: EnrichedShoot[];
  onShootClick: (id: string) => void;
}

const statusConfig = {
  idea: {
    label: "Ideas",
    icon: Lightbulb,
    color: "text-yellow-600 dark:text-yellow-400",
  },
  planning: {
    label: "Planning",
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
  },
  "ready to shoot": {
    label: "Ready to Shoot",
    icon: Calendar,
    color: "text-purple-600 dark:text-purple-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
  },
};

export function AccordionShoots({ shoots, onShootClick }: AccordionShootsProps) {
  const [statusFilters, setStatusFilters] = useState<string[]>([
    "idea",
    "planning",
    "ready to shoot",
    "completed",
  ]);

  const toggleFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const groupedShoots = statusFilters.reduce(
    (acc, status) => {
      const statusShoots = shoots.filter((shoot) => shoot.status === status);
      if (statusShoots.length > 0) {
        acc[status] = statusShoots;
      }
      return acc;
    },
    {} as Record<string, EnrichedShoot[]>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          const isActive = statusFilters.includes(status);
          const count = shoots.filter((s) => s.status === status).length;
          
          return (
            <Button
              key={status}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(status)}
              className="gap-2"
              data-testid={`button-filter-${status}`}
            >
              <Icon className="h-4 w-4" />
              {config.label}
              <Badge variant="secondary" className="ml-1" data-testid={`badge-filter-count-${status}`}>
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {Object.keys(groupedShoots).length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground" data-testid="text-no-shoots">
            No shoots match the selected filters
          </div>
        </Card>
      ) : (
        <Accordion type="multiple" defaultValue={Object.keys(groupedShoots)} className="space-y-4">
          {Object.entries(groupedShoots).map(([status, statusShoots]) => {
            const config = statusConfig[status as keyof typeof statusConfig];
            const Icon = config.icon;

            return (
              <AccordionItem
                key={status}
                value={status}
                className="border rounded-lg px-4"
                data-testid={`accordion-item-${status}`}
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <span className="text-lg font-semibold">{config.label}</span>
                    <Badge variant="secondary" data-testid={`badge-accordion-count-${status}`}>
                      {statusShoots.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 pb-2">
                    {statusShoots.map((shoot) => (
                      <Card
                        key={shoot.id}
                        className="hover-elevate cursor-pointer overflow-hidden"
                        onClick={() => onShootClick(shoot.id)}
                        data-testid={`card-shoot-${shoot.id}`}
                      >
                        <div className="relative h-32 w-full overflow-hidden bg-muted">
                          {shoot.firstReferenceUrl ? (
                            <img
                              src={shoot.firstReferenceUrl}
                              alt={shoot.title}
                              className="w-full h-full object-cover"
                              data-testid={`image-shoot-thumbnail-${shoot.id}`}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-600/20 flex items-center justify-center">
                              <Image className="h-12 w-12 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 space-y-3">
                          <h3 className="font-semibold text-base line-clamp-2" data-testid={`text-shoot-title-${shoot.id}`}>
                            {shoot.title}
                          </h3>
                          
                          {shoot.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-shoot-description-${shoot.id}`}>
                              {shoot.description}
                            </p>
                          )}
                          
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {shoot.date && (
                              <div className="flex items-center gap-2" data-testid={`text-shoot-date-${shoot.id}`}>
                                <Calendar className="h-4 w-4" />
                                <div className="flex flex-col">
                                  <span>{format(new Date(shoot.date), "MMM d, yyyy")}</span>
                                  <span className="text-xs">
                                    {format(new Date(shoot.date), "h:mm a")}
                                    {shoot.durationMinutes && shoot.durationMinutes > 0 && (
                                      <>
                                        {" "}· {Math.floor(shoot.durationMinutes / 60) > 0 && `${Math.floor(shoot.durationMinutes / 60)}h `}
                                        {shoot.durationMinutes % 60 > 0 && `${shoot.durationMinutes % 60}m`}
                                      </>
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {shoot.locationNotes && (
                              <div className="flex items-center gap-2" data-testid={`text-shoot-location-${shoot.id}`}>
                                <MapPin className="h-4 w-4" />
                                <span className="line-clamp-1">{shoot.locationNotes}</span>
                              </div>
                            )}
                            
                            {shoot.participantCount !== undefined && shoot.participantCount > 0 && (
                              <div className="flex items-center gap-2" data-testid={`text-shoot-participants-${shoot.id}`}>
                                <Users className="h-4 w-4" />
                                <span>{shoot.participantCount} {shoot.participantCount === 1 ? 'participant' : 'participants'}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {shoot.calendarEventUrl && (
                              <Badge variant="outline" className="text-xs" data-testid={`badge-calendar-${shoot.id}`}>
                                <Calendar className="h-3 w-3 mr-1" />
                                Calendar
                              </Badge>
                            )}
                            {shoot.docsUrl && (
                              <Badge variant="outline" className="text-xs" data-testid={`badge-docs-${shoot.id}`}>
                                Docs
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
