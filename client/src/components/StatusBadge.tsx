import { Lightbulb, Clipboard, Camera, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ShootStatus = "idea" | "planning" | "ready to shoot" | "completed";

interface StatusBadgeProps {
  status: ShootStatus;
  className?: string;
}

const statusConfig = {
  idea: {
    label: "Idea",
    icon: Lightbulb,
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300",
  },
  planning: {
    label: "Planning",
    icon: Clipboard,
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  "ready to shoot": {
    label: "Ready to Shoot",
    icon: Camera,
    className: "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 font-medium",
        config.className,
        className
      )}
      data-testid={`status-badge-${status}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}
