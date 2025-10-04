import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { SiGooglecalendar, SiGoogledocs } from "react-icons/si";

interface UpcomingShoot {
  id: string;
  title: string;
  date: Date;
  location: string;
  image?: string;
  hasCalendar?: boolean;
  hasDocs?: boolean;
  countdown: string;
}

interface UpcomingShootsSectionProps {
  shoots: UpcomingShoot[];
  onShootClick?: (id: string) => void;
}

export function UpcomingShootsSection({ shoots, onShootClick }: UpcomingShootsSectionProps) {
  if (shoots.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No upcoming shoots scheduled</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {shoots.map((shoot) => (
        <Card
          key={shoot.id}
          className="overflow-hidden hover-elevate cursor-pointer"
          onClick={() => onShootClick?.(shoot.id)}
          data-testid={`card-upcoming-${shoot.id}`}
        >
          <div className="flex flex-col md:flex-row">
            {shoot.image && (
              <div className="relative w-full md:w-48 h-48 md:h-auto bg-muted shrink-0">
                <Image
                  src={shoot.image}
                  alt={shoot.title}
                  fill
                  className="object-cover"
                />
                {(shoot.hasCalendar || shoot.hasDocs) && (
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    {shoot.hasCalendar && (
                      <div className="h-6 w-6 rounded-md bg-background/90 backdrop-blur-sm flex items-center justify-center">
                        <SiGooglecalendar className="h-3 w-3 text-foreground" />
                      </div>
                    )}
                    {shoot.hasDocs && (
                      <div className="h-6 w-6 rounded-md bg-background/90 backdrop-blur-sm flex items-center justify-center">
                        <SiGoogledocs className="h-3 w-3 text-foreground" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <CardContent className="flex-1 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{shoot.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(shoot.date, "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{shoot.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="default" className="text-sm whitespace-nowrap">
                    <Clock className="h-3 w-3 mr-1" />
                    {shoot.countdown}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(shoot.date, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
