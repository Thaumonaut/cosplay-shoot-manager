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
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800 no-default-hover-elevate",
  },
  planning: {
    label: "Planning",
    icon: Clipboard,
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 no-default-hover-elevate",
  },
  "ready to shoot": {
    label: "Ready to Shoot",
    icon: Camera,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800 no-default-hover-elevate",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800 no-default-hover-elevate",
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
