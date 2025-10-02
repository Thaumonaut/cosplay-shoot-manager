import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth } from "date-fns";

interface ShootEvent {
  id: string;
  title: string;
  date: Date;
  status: "idea" | "planning" | "scheduled" | "completed";
  color?: string;
}

interface ShootCalendarProps {
  shoots: ShootEvent[];
  onShootClick?: (id: string) => void;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  currentMonth?: Date;
}

const statusColors = {
  idea: "hsl(var(--muted))",
  planning: "hsl(var(--primary))",
  scheduled: "hsl(var(--chart-2))",
  completed: "hsl(var(--chart-3))",
};

export function ShootCalendar({ shoots, onShootClick, onDateSelect, selectedDate, currentMonth = new Date() }: ShootCalendarProps) {
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
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div
                key={index}
                onClick={() => onDateSelect?.(day)}
                className={`min-h-16 p-2 rounded-lg border cursor-pointer hover-elevate transition-colors ${
                  isCurrentMonth ? 'bg-card' : 'bg-muted/30'
                } ${isToday ? 'border-primary' : 'border-border'} ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                } ${isToday ? 'text-primary font-bold' : ''}`}>
                  {format(day, 'd')}
                </div>
                {daysShoots.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {daysShoots.slice(0, 4).map(shoot => (
                      <div
                        key={shoot.id}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: shoot.color || statusColors[shoot.status] }}
                        title={shoot.title}
                        data-testid={`calendar-dot-${shoot.id}`}
                      />
                    ))}
                    {daysShoots.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{daysShoots.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
