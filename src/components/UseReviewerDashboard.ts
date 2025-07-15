// hooks/useReviewerDashboardMap.ts
import { useEffect, useState } from "react";
import { Geometry } from "geojson";

export interface PermitType {
  id: string;
  name: string;
}

export interface Permit {
  id: number;
  project_name: string;
  status: string;
  permit_type: PermitType | null;
  mmda_id: number;
  parcel_geometry: any;
  latitude: number | null;
  longitude: number | null;
  is_personal: boolean;
}

export interface MMDAStatusCounts {
  [status: string]: number;
}

export interface MMDA {
  id: number;
  name: string;
  region: string;
  type: string;
  jurisdiction_boundaries: Geometry;
  status_counts: {
    submitted: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
}

export function useReviewerDashboardMap() {
  const [data, setData] = useState<{ permits: Permit[]; mmdas: MMDA[] }>({
    permits: [],
    mmdas: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}permits/dashboard/reviewer-map`, {
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
