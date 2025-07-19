// hooks/useRecentActivities.ts
import { useEffect, useState } from "react";

interface ActivityItem {
  id: number;
  user_name: string;
  action: string;
  time_ago: string;
  activity_type: "user_action" | "system_action" | "application_action";
}

export function useRecentActivities() {
  const [data, setData] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}mmdas/dashboard/recent-activities`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch recent activities");
        return res.json();
      })
      .then((json) => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}