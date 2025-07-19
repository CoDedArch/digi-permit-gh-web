// components/ReviewComments.tsx
"use client";

import { MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/app/review/permit/[permitId]/page";

interface ReviewComment {
  id: number;
  status: ApplicationStatus;
  comments: string;
  required_changes?: string;
  next_steps?: string;
  reviewed_by: {
    id: number;
    name: string;
  };
  reviewed_at: string;
}

interface ReviewCommentsProps {
  reviews: ReviewComment[];
}

const statusBadgeVariants = {
  [ApplicationStatus.DRAFT]: "outline",
  [ApplicationStatus.SUBMITTED]: "secondary",
  [ApplicationStatus.UNDER_REVIEW]: "default",
  [ApplicationStatus.ADDITIONAL_INFO_REQUESTED]: "warning",
  [ApplicationStatus.APPROVED]: "success",
  [ApplicationStatus.REJECTED]: "destructive",
  [ApplicationStatus.INSPECTION_PENDING]: "warning",
  [ApplicationStatus.INSPECTION_COMPLETED]: "success",
  [ApplicationStatus.FOR_APPROVAL_OR_REJECTION]: "default",
  [ApplicationStatus.ISSUED]: "success",
  [ApplicationStatus.COMPLETED]: "success",
  [ApplicationStatus.CANCELLED]: "destructive",
};

export function ReviewComments({ reviews }: ReviewCommentsProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <MessageSquare className="mx-auto h-8 w-8 mb-2" />
        <p>No review comments yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-muted p-2 rounded-full">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">{review.reviewed_by.name}</h4>
                <time className="text-sm text-muted-foreground">
                  {format(new Date(review.reviewed_at), "MMM d, yyyy 'at' h:mm a")}
                </time>
              </div>
            </div>
            <Badge variant={statusBadgeVariants[review.status]}>
              {review.status.replace(/_/g, " ")}
            </Badge>
          </div>

          <div className="mt-4 space-y-3 pl-11">
            <div>
              <h5 className="text-sm font-medium text-muted-foreground">Comments</h5>
              <p className="whitespace-pre-line">{review.comments}</p>
            </div>

            {review.required_changes && (
              <div>
                <h5 className="text-sm font-medium text-muted-foreground">
                  Required Changes
                </h5>
                <p className="whitespace-pre-line">{review.required_changes}</p>
              </div>
            )}

            {review.next_steps && (
              <div>
                <h5 className="text-sm font-medium text-muted-foreground">
                  Next Steps
                </h5>
                <p className="whitespace-pre-line">{review.next_steps}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}