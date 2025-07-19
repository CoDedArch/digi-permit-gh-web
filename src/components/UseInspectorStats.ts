// hooks/useInspectionStats.ts
import { useEffect, useState } from "react";

interface InspectionStats {
  scheduled_today: number;
  pending_reports: number;
  violations_found: number;
  in_progress: number;
  completed_week: number;
  avg_duration_hours: number;
  reinspection_rate: number;
  total_inspections: number;
}

export function useInspectionStats() {
  const [data, setData] = useState<InspectionStats>({
    scheduled_today: 0,
    pending_reports: 0,
    violations_found: 0,
    in_progress: 0,
    completed_week: 0,
    avg_duration_hours: 0,
    reinspection_rate: 0,
    total_inspections: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}mmdas/dashboard/inspection-stats`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch inspection stats");
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}