// hooks/useReviewerStats.ts
import { useEffect, useState } from "react";

interface ReviewerStats {
  pending_review: number;
  overdue: number;
  completed_today: number;
  avg_review_time_days: number;
}

export function useReviewerStats() {
  const [data, setData] = useState<ReviewerStats>({
    pending_review: 0,
    overdue: 0,
    completed_today: 0,
    avg_review_time_days: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}mmdas/dashboard/reviewer-stats`, {
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
    
    console.log("stats data", data)

  return { data, loading };
}