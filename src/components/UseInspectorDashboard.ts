// hooks/useInspectorDashboardMap.ts
import { useEffect, useState } from "react";
import { Geometry } from "geojson";

export interface InspectionType {
  id: string;
  name: string;
}

export interface PermitType {
  id: string;
  name: string;
}

export interface Inspection {
  id: number;
  status: string;
  scheduled_date: string | null;
  actual_date: string | null;
  inspection_type?: string;
}

export interface PermitApplication {
  id: number;
  project_name: string;
  status: string;
  permit_type?: PermitType;
  mmda_id: number;
  parcel_geometry: any;
  latitude: number | null;
  longitude: number | null;
  is_personal: boolean;
  inspections: Inspection[];
  needs_inspection: boolean;
}

export interface MMDAStatusCounts {
  pending: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  awaiting_inspection: number;
}

export interface MMDA {
  id: number;
  name: string;
  region: string;
  type: string;
  jurisdiction_boundaries: Geometry;
  status_counts: MMDAStatusCounts;
}

export interface InspectorDashboardData {
  permits: PermitApplication[];
  mmdas: MMDA[];
}

export function useInspectorDashboardMap() {
  const [data, setData] = useState<InspectorDashboardData>({
    permits: [],
    mmdas: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}permits/dashboard/inspector-map`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch inspector dashboard data");
        }

        const json = await res.json();

        console.log("Map Data: ", json);

        // Transform the data if needed to match the frontend types
        const transformedData: InspectorDashboardData = {
          permits: json.permits.map((permit: any) => ({
            ...permit,
            // Add any necessary transformations here
          })),
          mmdas: json.mmdas.map((mmda: any) => ({
            ...mmda,
            // Add any necessary transformations here
          })),
        };

        setData(transformedData);
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
