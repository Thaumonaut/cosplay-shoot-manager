import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth } from "date-fns";

interface ShootEvent {
  id: string;
  title: string;
  date: Date;
  status: "idea" | "planning" | "scheduled" | "completed";
}

interface ShootCalendarProps {
  shoots: ShootEvent[];
  onShootClick?: (id: string) => void;
  currentMonth?: Date;
}

const statusColors = {
  idea: "bg-muted",
  planning: "bg-primary",
  scheduled: "bg-chart-2",
  completed: "bg-chart-3",
};

export function ShootCalendar({ shoots, onShootClick, currentMonth = new Date() }: ShootCalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getShootsForDay = (day: Date) => {
    return shoots.filter(shoot => isSameDay(shoot.date, day));
  };

  return (
    <Card data-testid="calendar-view">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {format(currentMonth, "MMMM yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
          
          {days.map((day, index) => {
            const daysShoots = getShootsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={index}
                className={`min-h-20 p-2 rounded-lg border ${
                  isCurrentMonth ? 'bg-card' : 'bg-muted/30'
                } ${isToday ? 'border-primary' : 'border-border'}`}
                data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                } ${isToday ? 'text-primary font-bold' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {daysShoots.map(shoot => (
                    <div
                      key={shoot.id}
                      className={`text-xs p-1 rounded cursor-pointer hover-elevate ${statusColors[shoot.status]} text-white line-clamp-1`}
                      onClick={() => onShootClick?.(shoot.id)}
                      data-testid={`calendar-event-${shoot.id}`}
                    >
                      {shoot.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
