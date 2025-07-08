"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader, PlusCircle } from "lucide-react";
import Link from "next/link";
import { fetchUserInspections, Inspection } from "@/app/data/queries";
import { formatDate } from "@/lib/utils";

export function InspectionStatusBadge({ status }: { status: string }) {
  const base = "px-2 py-0.5 rounded-full text-xs font-medium";
  const styles = {
    scheduled: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    canceled: "bg-red-100 text-red-700",
    pending: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`${base} ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInspections()
      .then(setInspections)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto min-h-screen bg-white p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Inspections</h1>
        <p className="text-sm text-muted-foreground">
          Track your upcoming and past site inspections. You can also request
          new inspections for your permit applications.
        </p>
        {inspections.length > 0 && (
          <Link href="/schedule-inspection/request">
            <Button className="mt-4">
              <PlusCircle className="w-4 h-4 mr-2" /> Request Inspection
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 min-h-screen bg-white">
          <Loader className="animate-spin w-6 h-6 mb-2" />
          <p>Loading inspections...</p>
        </div>
      ) : inspections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <ClipboardList className="w-15 h-15 mb-2 text-gray-400" />
          <p className="text-center">
            No inspections found.
            <br />
            Start by requesting one for your project.
          </p>
          <Link href="/schedule-inspection/request">
            <Button className="mt-4">
              <PlusCircle className="w-4 h-4 mr-2" /> Request Inspection
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b">
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Project</th>
                <th>Inspector</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((insp) => (
                <tr key={insp.id} className="border-b">
                  <td>{formatDate(insp.scheduled_date)}</td>
                  {/* ✅ updated field */}
                  <td>
                    <InspectionStatusBadge status={insp.status} />
                  </td>
                  <td>{insp.application?.project_name || "N/A"}</td>
                  {/* ✅ updated relationship */}
                  <td>
                    {insp.inspection_officer
                      ? `${insp.inspection_officer.first_name} ${insp.inspection_officer.last_name}`
                      : "Pending"}
                  </td>
                  {/* ✅ updated field */}
                  <td className="space-x-2">
                    <Link href={`/schedule-inspection/${insp.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    {insp.status === "scheduled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
