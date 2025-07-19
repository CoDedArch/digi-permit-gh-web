"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ExceptionItem {
  application_id: number;
  applicant_name: string;
  flag_reason?: string | null;
  flagged_at?: string | null;
  violations?: string | null;
  inspection_status: string;
  inspection_date?: string | null;
}

export default function ExceptionsTable() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchExceptions = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}exceptions/reviewer/exceptions`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        setExceptions(data);
        setError(null);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Request canceled", err.message);
        } else {
          console.error(err);
          setError("Failed to load exceptions.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExceptions();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground mt-4">
        Loading exceptions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen border border-red-300 bg-red-50 p-4 text-3xl text-red-700 flex justify-center items-center gap-2 shadow-sm">
        <AlertTriangle className="h-10 w-10 mt-0.5 text-red-500" />
        <div>
          <p className="font-medium">Error loading exceptions</p>
          <p className="text-2xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4 rounded-none min-h-screen">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">Exceptions</h2>

        {exceptions.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">
            No flagged applications or inspection violations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">App ID</th>
                  <th className="px-4 py-2 border">Applicant</th>
                  <th className="px-4 py-2 border">Flag Reason</th>
                  <th className="px-4 py-2 border">Flagged At</th>
                  <th className="px-4 py-2 border">Violations</th>
                  <th className="px-4 py-2 border">Inspection Status</th>
                  <th className="px-4 py-2 border">Inspection Date</th>
                </tr>
              </thead>
              <tbody>
                {exceptions.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2 border">{item.application_id}</td>
                    <td className="px-4 py-2 border">{item.applicant_name}</td>
                    <td className="px-4 py-2 border">
                      {item.flag_reason || (
                        <span className="text-gray-400 italic">No flag</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border">
                      {item.flagged_at
                        ? new Date(item.flagged_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border">
                      {item.violations || (
                        <span className="text-green-600">No violations</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border">
                      {item.inspection_status}
                    </td>
                    <td className="px-4 py-2 border">
                      {item.inspection_date
                        ? new Date(item.inspection_date).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
