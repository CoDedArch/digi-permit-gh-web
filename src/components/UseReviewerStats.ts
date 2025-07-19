// hooks/useReviewerStats.ts
import { useEffect, useState } from "react";

interface ReviewerStats {
  pending_review: number;
  overdue: number;
  completed_today_mmda: number;
  completed_today_reviewer: number;
  avg_review_time_days_mmda: number;
  avg_review_time_days_reviewer: number;
}

export function useReviewerStats() {
  const [data, setData] = useState<ReviewerStats>({
    pending_review: 0,
    overdue: 0,
    completed_today_mmda: 0,
    completed_today_reviewer: 0,
    avg_review_time_days_mmda: 0,
    avg_review_time_days_reviewer: 0,
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
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reviewer stats");
        return res.json();
      })
      .then((json) => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
