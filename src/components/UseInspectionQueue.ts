// hooks/useInspectionQueue.ts
import { useEffect, useState } from "react";

interface InspectionQueueItem {
  id: number;
  permit_no: string;
  address: string;
  type: string;
  scheduled_time: string;
  status: "pending" | "scheduled" | "in_progress" | "completed" | "cancelled";
  days_until_due: number;
  priority: "high" | "medium" | "low";
  applicant: string;
}

export function useInspectionQueue() {
  const [data, setData] = useState<InspectionQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}mmdas/inspections/dashboard/inspector-queue`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch inspection queue data");
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