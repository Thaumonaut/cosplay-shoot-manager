import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Clock, Calendar, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { SiGooglecalendar, SiGoogledocs } from "react-icons/si";

interface KanbanShoot {
  id: string;
  title: string;
  image?: string;
  location?: string;
  participants?: number;
  hasCalendar?: boolean;
  hasDocs?: boolean;
  referenceCount?: number;
}

interface KanbanColumn {
  id: string;
  title: string;
  icon: typeof Lightbulb;
  shoots: KanbanShoot[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onShootClick?: (id: string) => void;
}

export function KanbanBoard({ columns, onShootClick }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="kanban-board">
      {columns.map((column) => (
        <Card key={column.id} className="flex flex-col" data-testid={`kanban-column-${column.id}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <column.icon className="h-5 w-5 text-primary" />
                <span>{column.title}</span>
              </div>
              <Badge variant="secondary">{column.shoots.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-1">
            {column.shoots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No shoots in {column.title.toLowerCase()}
              </div>
            ) : (
              column.shoots.map((shoot) => (
                <Card
                  key={shoot.id}
                  className="overflow-hidden hover-elevate cursor-pointer"
                  onClick={() => onShootClick?.(shoot.id)}
                  data-testid={`kanban-card-${shoot.id}`}
                >
                  {shoot.image && (
                    <div className="relative aspect-[3/2] bg-muted overflow-hidden">
                      <img
                        src={shoot.image}
                        alt={shoot.title}
                        className="w-full h-full object-cover"
                      />
                      {(shoot.hasCalendar || shoot.hasDocs) && (
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          {shoot.hasCalendar && (
                            <div className="h-5 w-5 rounded-md bg-background/90 backdrop-blur-sm flex items-center justify-center">
                              <SiGooglecalendar className="h-3 w-3 text-foreground" />
                            </div>
                          )}
                          {shoot.hasDocs && (
                            <div className="h-5 w-5 rounded-md bg-background/90 backdrop-blur-sm flex items-center justify-center">
                              <SiGoogledocs className="h-3 w-3 text-foreground" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <CardContent className="p-3 space-y-2">
                    <h4 className="font-medium text-sm line-clamp-2">{shoot.title}</h4>
                    {(shoot.location || shoot.participants || shoot.referenceCount) && (
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {shoot.location && (
                          <span className="line-clamp-1">{shoot.location}</span>
                        )}
                        {shoot.participants && (
                          <span>{shoot.participants} people</span>
                        )}
                        {shoot.referenceCount && (
                          <span>{shoot.referenceCount} refs</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
