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
      className: "!bg-amber-100 !text-amber-800 !border-amber-300 shadow-none rounded-full",
      dotColor: "bg-amber-600",
      label: "Pending"
    },
    in_progress: {
      className: "!bg-blue-100 !text-blue-800 !border-blue-300 shadow-none rounded-full",
      dotColor: "bg-blue-600",
      label: "In Progress"
    },
    code_review: {
      className: "!bg-purple-100 !text-purple-800 !border-purple-300 shadow-none rounded-full",
      dotColor: "bg-purple-600",
      label: "Code Review"
    },
    completed: {
      className: "!bg-emerald-100 !text-emerald-800 !border-emerald-300 shadow-none rounded-full",
      dotColor: "bg-emerald-600",
      label: "Completed"
    },
    failed: {
      className: "!bg-red-100 !text-red-800 !border-red-300 shadow-none rounded-full",
      dotColor: "bg-red-600",
      label: "Failed"
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