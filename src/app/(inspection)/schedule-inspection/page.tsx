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
    in_progress: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`${base} ${styles[status as keyof typeof styles] || styles.pending}`}>
      {status.replace("_", " ")}
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
      const data = await fetchUserInspections();
      setRequested(data.requested);
      setAssigned(data.assigned);
    } catch {
      alert("Failed to start inspection.");
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Inspections</h1>
          <p className="text-sm text-muted-foreground">
            Track your inspections or begin inspections assigned to you
          </p>
        </div>
        
        {user?.role && (
          <Link href="/schedule-inspection/request">
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Request Inspection
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Loader className="animate-spin w-6 h-6 mb-2" />
          <p>Loading inspections...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Requested Inspections */}
          {requestedInspections.length > 0 && (
            <section className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Your Inspection Requests</h2>
                <span className="text-sm text-muted-foreground">
                  {requestedInspections.length} request{requestedInspections.length !== 1 ? 's' : ''}
                </span>
              </div>
              <InspectionTable 
                inspections={requestedInspections} 
                showSetInProgress={false} 
              />
            </section>
          )}

          {/* Assigned Inspections */}
          {user?.role === "inspection_officer" && assignedInspections.length > 0 && (
            <section className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Assigned to You</h2>
                <span className="text-sm text-muted-foreground">
                  {assignedInspections.length} assignment{assignedInspections.length !== 1 ? 's' : ''}
                </span>
              </div>
              <InspectionTable
                inspections={assignedInspections}
                showSetInProgress={true}
                onSetInProgress={handleSetInProgress}
              />
            </section>
          )}

          {!loading && requestedInspections.length === 0 && assignedInspections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
              <ClipboardList className="w-10 h-10 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium">No inspections found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.role === "applicant" 
                  ? "Request your first inspection to get started"
                  : "No inspections have been assigned to you yet"}
              </p>
              {user?.role === "applicant" && (
                <Link href="/schedule-inspection/request" className="mt-4">
                  <Button className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Request Inspection
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground border-b">
          <tr>
            <th className="p-3 font-medium">Date</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 font-medium">Project</th>
            <th className="p-3 font-medium">Inspector</th>
            <th className="p-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inspections.map((insp) => (
            <tr key={insp.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{formatDate(insp.scheduled_date)}</td>
              <td className="p-3">
                <InspectionStatusBadge status={insp.status} />
              </td>
              <td className="p-3">{insp.application?.project_name || "N/A"}</td>
              <td className="p-3">
                {insp.inspection_officer
                  ? `${insp.inspection_officer.first_name} ${insp.inspection_officer.last_name}`
                  : "Pending"}
              </td>
              <td className="p-3">
                <div className="flex justify-end gap-2">
                  <Link href={`/schedule-inspection/${insp.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  {showSetInProgress &&
                    insp.status === "scheduled" &&
                    onSetInProgress && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onSetInProgress(insp.id)}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Start Inspection
                      </Button>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}