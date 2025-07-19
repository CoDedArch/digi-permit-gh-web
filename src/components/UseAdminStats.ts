// hooks/useAdminStats.ts
import { useEffect, useState } from "react";

interface DepartmentPerformance {
  name: string;
  completed_applications: number;
  avg_processing_time: number;
}

interface AdminStats {
  total_users: number;
  active_applications: number;
  avg_processing_time_days: number;
  system_health_percentage: number;
  pending_reviews: number;
  overdue_applications: number;
  active_staff: number;
  status_distribution: {
    submitted: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
  department_performance: DepartmentPerformance[];
  total_completed_applications: number;
}

export function useAdminStats() {
  const [data, setData] = useState<AdminStats>({
    total_users: 0,
    active_applications: 0,
    avg_processing_time_days: 0,
    system_health_percentage: 100,
    pending_reviews: 0,
    overdue_applications: 0,
    active_staff: 0,
    status_distribution: {
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
    },
    department_performance: [],
    total_completed_applications: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}mmdas/dashboard/admin-stats`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch admin stats");
        return res.json();
      })
      .then((json) => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}