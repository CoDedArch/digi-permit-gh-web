// components/StatusHistory.tsx
"use client";

import { Clock, User } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/app/review/permit/[permitId]/page";

interface StatusChange {
  id: number;
  from_status: ApplicationStatus;
  to_status: ApplicationStatus;
  changed_by: {
    id: number;
    name: string;
  };
  changed_at: string;
  notes?: string;
}

interface StatusHistoryProps {
  history: StatusChange[];
}

// Define the exact variant types that the Badge component accepts
type BadgeVariant = "outline" | "secondary" | "default" | "destructive";

// Create a type-safe mapping with proper variant types
const statusBadgeVariants: Record<ApplicationStatus, BadgeVariant> = {
  [ApplicationStatus.DRAFT]: "outline",
  [ApplicationStatus.SUBMITTED]: "secondary",
  [ApplicationStatus.UNDER_REVIEW]: "default",
  [ApplicationStatus.ADDITIONAL_INFO_REQUESTED]: "destructive", // Using destructive for warning states
  [ApplicationStatus.APPROVED]: "default", // Using default for success states
  [ApplicationStatus.REJECTED]: "destructive",
  [ApplicationStatus.INSPECTION_PENDING]: "destructive", // Using destructive for warning states
  [ApplicationStatus.INSPECTION_COMPLETED]: "default", // Using default for success states
  [ApplicationStatus.FOR_APPROVAL_OR_REJECTION]: "default",
  [ApplicationStatus.ISSUED]: "default", // Using default for success states
  [ApplicationStatus.COMPLETED]: "default", // Using default for success states
  [ApplicationStatus.CANCELLED]: "destructive",
};

// Helper function to format status text
const formatStatusText = (status: ApplicationStatus): string => {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export function StatusHistory({ history }: StatusHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Clock className="mx-auto h-8 w-8 mb-2" />
        <p>No status history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((change, index) => (
        <div key={change.id} className="relative pb-6">
          {/* Timeline connector */}
          {index !== history.length - 1 && (
            <div className="absolute left-4 top-4 h-full w-0.5 bg-border" />
          )}

          <div className="relative flex gap-4">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Clock className="h-4 w-4" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{change.changed_by.name}</span>
                </div>
                <time className="text-sm text-muted-foreground">
                  {format(new Date(change.changed_at), "MMM d, yyyy 'at' h:mm a")}
                </time>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={statusBadgeVariants[change.from_status]}>
                  {formatStatusText(change.from_status)}
                </Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant={statusBadgeVariants[change.to_status]}>
                  {formatStatusText(change.to_status)}
                </Badge>
              </div>

              {change.notes && (
                <div className="rounded-md bg-muted/50 p-3 text-sm">
                  <p className="whitespace-pre-line">{change.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}