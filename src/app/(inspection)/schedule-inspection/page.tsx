"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader, PlusCircle } from "lucide-react";
import Link from "next/link";
import { fetchUserInspections, Inspection } from "@/app/data/queries";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";

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
  const [requestedInspections, setRequested] = useState<Inspection[]>([]);
  const [assignedInspections, setAssigned] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserInspections()
      .then(({ requested, assigned }) => {
        setRequested(requested);
        setAssigned(assigned);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSetInProgress = async (inspectionId: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}inspections/${inspectionId}/start`, {
        method: "POST",
        credentials: "include",
      });
      // Refetch to update UI
      const data = await fetchUserInspections();
      setRequested(data.requested);
      setAssigned(data.assigned);
    } catch {
      alert("Failed to start inspection.");
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Inspections</h1>
        <p className="text-sm text-muted-foreground">
          Track your inspections or begin inspections assigned to you.
        </p>

        {/* {user?.role === "applicant" && ( */}
          <Link href="/schedule-inspection/request">
            <Button className="mt-4">
              <PlusCircle className="w-4 h-4 mr-2" /> Request Inspection
            </Button>
          </Link>
        {/* )} */}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 min-h-screen bg-white">
          <Loader className="animate-spin w-6 h-6 mb-2" />
          <p>Loading inspections...</p>
        </div>
      ) : (
        <>
          {/* Requested Inspections (their own) */}
          {requestedInspections.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">Requested Inspections</h2>
              <InspectionTable inspections={requestedInspections} showSetInProgress={false} />
            </section>
          )}

          {/* Assigned Inspections */}
          {user?.role === "inspection_officer" && assignedInspections.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mt-6 mb-2">Assigned to You</h2>
              <InspectionTable
                inspections={assignedInspections}
                showSetInProgress={true}
                onSetInProgress={handleSetInProgress}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
}

function InspectionTable({
  inspections,
  showSetInProgress = false,
  onSetInProgress,
}: {
  inspections: Inspection[];
  showSetInProgress?: boolean;
  onSetInProgress?: (id: number) => void;
}) {
  return (
    <div className="overflow-x-auto mt-2">
      <table className="w-full text-sm border rounded-md">
        <thead className="text-left text-muted-foreground border-b bg-gray-50">
          <tr>
            <th className="p-2">Date</th>
            <th>Status</th>
            <th>Project</th>
            <th>Inspector</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {inspections.map((insp) => (
            <tr key={insp.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{formatDate(insp.scheduled_date)}</td>
              <td>
                <InspectionStatusBadge status={insp.status} />
              </td>
              <td>{insp.application?.project_name || "N/A"}</td>
              <td>
                {insp.inspection_officer
                  ? `${insp.inspection_officer.first_name} ${insp.inspection_officer.last_name}`
                  : "Pending"}
              </td>
              <td className="space-x-2 text-right">
                <Link href={`/schedule-inspection/${insp.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
                {showSetInProgress &&
                  insp.status === "scheduled" &&
                  onSetInProgress && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSetInProgress(insp.id)}
                      className="text-yellow-700"
                    >
                      Set In Progress
                    </Button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
