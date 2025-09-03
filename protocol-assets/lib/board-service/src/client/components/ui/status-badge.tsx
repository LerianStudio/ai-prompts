import { Badge } from "./badge";
import { cn } from "../../lib/utils";
import { Task } from "../../types";

interface StatusBadgeProps {
  status: Task["status"];
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    pending: {
      className: "!bg-orange-500/10 dark:!bg-orange-500/20 !text-orange-500 !border-orange-500 shadow-none rounded-full",
      dotColor: "bg-orange-500",
      label: "Pending"
    },
    in_progress: {
      className: "!bg-blue-500/10 dark:!bg-blue-500/20 !text-blue-500 !border-blue-500 shadow-none rounded-full",
      dotColor: "bg-blue-500",
      label: "In Progress"
    },
    completed: {
      className: "!bg-green-500/10 dark:!bg-green-500/20 !text-green-500 !border-green-500 shadow-none rounded-full",
      dotColor: "bg-green-500",
      label: "Completed"
    }
  };

  const variant = variants[status];

  return (
    <Badge variant="outline" className={cn(variant.className, className)}>
      <div className={cn("h-1.5 w-1.5 rounded-full mr-2", variant.dotColor)} />
      {variant.label}
    </Badge>
  );
}