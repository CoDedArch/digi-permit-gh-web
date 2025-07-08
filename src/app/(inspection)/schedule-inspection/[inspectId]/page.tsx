"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";


export interface InspectionDetail {
  id: number;
  inspection_type: string;
  status: string;
  outcome?: string;
  scheduled_date?: string;
  actual_date?: string;
  notes?: string;
  is_reinspection: boolean;
  application: {
    id: number;
    project_name: string;
    location?: string;
  };
  inspection_officer?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  mmda: {
    id: number;
    name: string;
  };
}



export default function InspectionDetailPage() {
  const { inspectId } = useParams();
  const [inspection, setInspection] = useState<InspectionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspection = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}inspections/${inspectId}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to load inspection");
        const data = await res.json();
        setInspection(data);
      } catch (error) {
        console.error("Error fetching inspection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspection();
  }, [inspectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 text-gray-500 bg-white min-h-screen">
        <Loader className="w-6 h-6 animate-spin mr-2" />
        Loading inspection...
      </div>
    );
  }

  if (!inspection) {
    return <p className="text-center text-red-600 container mx-auto px-6 bg-white min-h-screen">Inspection not found.</p>;
  }

  const {
    inspection_type,
    status,
    outcome,
    scheduled_date,
    actual_date,
    notes,
    is_reinspection,
    application,
    inspection_officer,
    mmda,
  } = inspection;

  return (
    <div className="flex justify-center bg-gray-50 min-h-screen py-10">
  <div className="w-full max-w-3xl px-4 space-y-8">
    <h1 className="text-3xl font-bold text-center text-gray-800">Inspection Detail</h1>

    {/* Inspection Info Card */}
    <div className="bg-white p-6 rounded-2xl shadow-md space-y-6">
      <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Inspection Info</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-gray-500">Type</p>
          <p className="font-medium capitalize">{inspection_type}</p>
        </div>

        <div>
          <p className="text-gray-500">Status</p>
          <p className="font-medium capitalize">{status}</p>
        </div>

        <div>
          <p className="text-gray-500">Outcome</p>
          <p className="font-medium capitalize">{outcome || "Not available"}</p>
        </div>

        <div>
          <p className="text-gray-500">Scheduled Date</p>
          <p className="font-medium">
            {scheduled_date ? formatDate(scheduled_date) : "Not scheduled"}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Actual Date</p>
          <p className="font-medium">
            {actual_date ? formatDate(actual_date) : "Pending"}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Is Reinspection</p>
          <p className="font-medium">{is_reinspection ? "Yes" : "No"}</p>
        </div>
      </div>

      <div>
        <p className="text-gray-500">Notes</p>
        <p className="font-medium whitespace-pre-line">{notes || "No notes added"}</p>
      </div>
    </div>

    {/* Application Info Card */}
    <div className="bg-white p-6 rounded-2xl shadow-md space-y-2">
      <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Application Info</h2>
      <p><span className="font-medium text-gray-600">Project:</span> {application.project_name}</p>
      {application.location && (
        <p><span className="font-medium text-gray-600">Location:</span> {application.location}</p>
      )}
      <p><span className="font-medium text-gray-600">MMDA:</span> {mmda.name}</p>
    </div>

    {/* Officer Info Card */}
    <div className="bg-white p-6 rounded-2xl shadow-md space-y-2">
      <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Inspection Officer</h2>
      {inspection_officer ? (
        <p>
          <span className="font-medium text-gray-600">Name:</span>{" "}
          {inspection_officer.first_name + " " + inspection_officer.last_name}
        </p>
      ) : (
        <p className="italic text-gray-400">Not yet assigned</p>
      )}
    </div>

    {/* Go Back Button */}
    <div className="flex justify-center">
      <Button variant="outline" onClick={() => history.back()}>
        Go Back
      </Button>
    </div>
  </div>
</div>

  );
}
