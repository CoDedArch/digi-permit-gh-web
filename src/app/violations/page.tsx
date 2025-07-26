"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { InspectionPhoto } from "@/types";

type ViolationItem = {
  application_id: number;
  application_number: string;
  project_name: string;
  inspection_date: string;
  inspection_type: string;
  violations: string;
  photos: InspectionPhoto[];
  status: string;
  recommendations?: string;
};

export default function InspectorViolationsPage() {
  const [violations, setViolations] = useState<ViolationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}violations/inspector-violations`,
        { credentials: "include" }
      );
      const data = await res.json();
      setViolations(data);
    } catch (error) {
      console.error("Error fetching violations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "inspection_officer") {
      fetchViolations();
    }
  }, [user]);

  if (loading) {
    return <div>Loading violations...</div>;
  }

  return (
    <div className="container mx-auto p-6 min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-6">My Inspection Violations</h1>
      
      {violations.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          No violations found
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspection Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Violations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {violations.map((violation) => (
                <tr
                  key={`${violation.application_id}-${violation.inspection_date}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {violation.application_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {violation.project_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(violation.inspection_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="line-clamp-2">{violation.violations || "No violations recorded"}</div>
                    {/* {violation.photos?.length > 0 && (
                      <div className="mt-2 flex space-x-2">
                        {violation.photos.slice(0, 3).map((photo) => (
                          <img
                            key={photo.id}
                            src={photo.file_path}
                            className="h-10 w-10 object-cover rounded"
                            alt="Violation photo"
                          />
                        ))}
                      </div>
                    )} */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        violation.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : violation.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {violation.status}
                    </span>
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