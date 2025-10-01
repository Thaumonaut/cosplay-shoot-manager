import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, MoreVertical, FileText, Image as ImageIcon } from "lucide-react";
import { SiGooglecalendar, SiGoogledocs } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";

type ShootStatus = "idea" | "planning" | "scheduled" | "completed";

interface ShootCardProps {
  id: string;
  title: string;
  image?: string;
  date?: Date;
  location?: string;
  participants?: number;
  status: ShootStatus;
  hasCalendar?: boolean;
  hasDocs?: boolean;
  referenceCount?: number;
  onClick?: () => void;
}

const statusConfig: Record<ShootStatus, { label: string; variant: "secondary" | "default" | "outline" }> = {
  idea: { label: "Idea", variant: "secondary" },
  planning: { label: "Planning", variant: "default" },
  scheduled: { label: "Scheduled", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
};

export function ShootCard({
  id,
  title,
  image,
  date,
  location,
  participants,
  status,
  hasCalendar,
  hasDocs,
  referenceCount = 0,
  onClick,
}: ShootCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <Card 
      className="overflow-hidden hover-elevate cursor-pointer group" 
      onClick={onClick}
      data-testid={`card-shoot-${id}`}
    >
      <div className="relative aspect-[3/2] bg-muted overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={statusInfo.variant} data-testid={`badge-status-${status}`}>
            {statusInfo.label}
          </Badge>
        </div>
        {(hasCalendar || hasDocs) && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            {hasCalendar && (
              <div className="h-6 w-6 rounded-md bg-background/90 backdrop-blur-sm flex items-center justify-center">
                <SiGooglecalendar className="h-3 w-3 text-foreground" />
              </div>
            )}
            {hasDocs && (
              <div className="h-6 w-6 rounded-md bg-background/90 backdrop-blur-sm flex items-center justify-center">
                <SiGoogledocs className="h-3 w-3 text-foreground" />
              </div>
            )}
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              console.log('More options clicked for:', id);
            }}
            data-testid={`button-more-${id}`}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          {date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{location}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            {participants && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{participants} {participants === 1 ? 'person' : 'people'}</span>
              </div>
            )}
            {referenceCount > 0 && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{referenceCount} refs</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
