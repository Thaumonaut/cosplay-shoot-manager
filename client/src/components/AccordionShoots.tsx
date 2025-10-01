import { useState } from "react";
import type { Shoot } from "@shared/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Clock, Calendar, CheckCircle2, MapPin } from "lucide-react";

interface AccordionShootsProps {
  shoots: Shoot[];
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
  scheduled: {
    label: "Scheduled",
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
    "scheduled",
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
    {} as Record<string, Shoot[]>
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
                        className="hover-elevate cursor-pointer p-4"
                        onClick={() => onShootClick(shoot.id)}
                        data-testid={`card-shoot-${shoot.id}`}
                      >
                        <div className="space-y-3">
                          <h3 className="font-semibold text-base line-clamp-2" data-testid={`text-shoot-title-${shoot.id}`}>
                            {shoot.title}
                          </h3>
                          
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {shoot.date && (
                              <div className="flex items-center gap-2" data-testid={`text-shoot-date-${shoot.id}`}>
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(shoot.date).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {shoot.locationNotes && (
                              <div className="flex items-center gap-2" data-testid={`text-shoot-location-${shoot.id}`}>
                                <MapPin className="h-4 w-4" />
                                <span className="line-clamp-1">{shoot.locationNotes}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
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
