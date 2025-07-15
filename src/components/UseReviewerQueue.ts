// hooks/useReviewerQueue.ts
import { useEffect, useState } from "react";

interface ReviewQueueItem {
  permit_no: string;
  type: string;
  applicant: string;
  days_in_queue: number;
  priority: "high" | "medium" | "low";
  permit_id: number;
}

export function useReviewerQueue() {
  const [data, setData] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}mmdas/dashboard/reviewer-queue`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}