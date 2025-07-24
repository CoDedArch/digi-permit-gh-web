"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  FileText,
  Loader,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";

type Document = {
  document_type: {
    id: number;
    name: string;
  };
  file_path: string;
  status: string;
};

export interface InspectionDetail {
  id: number;
  inspection_type: string;
  status: string;
  outcome?: string;
  scheduled_date?: string;
  scheduled_time?: string; // Added
  actual_date?: string;
  notes?: string;
  is_reinspection: boolean;
  findings?: string; // Added
  recommendations?: string; // Added
  violations_found?: string; // Added
  special_instructions?: string; // Added
  documents?: Document[];
  application: {
    id: number;
    project_name: string;
    application_number: string;
    // location?: string;
    project_description?: string; // Added
    permit_type?: {
      id: number;
      name: string;
    };
    project_address?: string; // Added (project address)
  };
  inspection_officer?: {
    id: number;
    first_name: string;
    last_name: string;
    phone?: string; // Added
  };
  mmda: {
    id: number;
    name: string;
  };
  applicant: {
    // Added new section
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
  };
}
export default function InspectionDetailPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [violations, setViolations] = useState<string[]>([]);
  const [newViolation, setNewViolation] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [inspectionResult, setInspectionResult] = useState<
    "pass" | "fail" | "conditional" | ""
  >("");
  const { inspectId } = useParams();
  const [inspection, setInspection] = useState<InspectionDetail | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchInspection = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}inspections/${inspectId}`,
          { credentials: "include" },
        );
        if (!res.ok) throw new Error("Failed to load inspection");
        const data = await res.json();
        setInspection(data);

        // Only fetch documents if user is inspector
        if (user?.role === "inspection_officer") {
          const docsRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}inspections/${inspectId}/documents`,
            { credentials: "include" },
          );
          if (docsRes.ok) {
            const docsData = await docsRes.json();
            setInspection((prev) =>
              prev ? { ...prev, documents: docsData } : prev,
            );
          }
        }
      } catch (error) {
        console.error("Error fetching inspection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspection();
  }, [inspectId, user?.role]);

  const handleAddViolation = () => {
    if (newViolation.trim()) {
      setViolations([...violations, newViolation.trim()]);
      setNewViolation("");
    }
  };

  const handleRemoveViolation = (index: number) => {
    setViolations(violations.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos([...photos, ...files]);
  };

  const handleSubmitInspection = async () => {
    if (!inspectionResult) {
      alert("Please select an inspection result");
      return;
    }

    const inspectionData = {
      inspectId,
      result: inspectionResult,
      notes: inspectionNotes,
      violations,
      photos: photos.map((photo) => photo.name), // In real app, upload photos first
    };

    try {
      // Submit inspection - replace with actual API call
      console.log("Submitting inspection:", inspectionData);
      alert("Inspection submitted successfully!");
      // onBack();
    } catch (error) {
      console.error("Error submitting inspection:", error);
      alert("Error submitting inspection");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading inspection details...</p>
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Inspection not found</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 text-purple-600 hover:text-purple-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              {/* <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button> */}
              <div className="h-6 border-l border-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {inspection.application.application_number}
                </h1>
                <p className="text-sm text-gray-500">
                  {inspection.inspection_type}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                inspection.status,
              )}`}
            >
              {inspection.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", label: "Overview" },
              { id: "conduct", label: "Conduct Inspection" },
              { id: "history", label: "History" },
              { id: "documents", label: "Documents" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Inspection Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Scheduled Date</p>
                      <p className="font-medium">
                        {inspection.scheduled_date
                          ? new Date(
                              inspection.scheduled_date,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{inspection.scheduled_time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">
                        {inspection.application.project_address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Permit Type</p>
                      <p className="font-medium">
                        {inspection.application?.permit_type?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Description & Instructions
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600">{inspection.notes}</p>
                  </div>
                  {inspection.special_instructions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Special Instructions
                      </h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800">
                          {inspection.special_instructions}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Applicant Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">
                Applicant Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {inspection.applicant.first_name}{" "}
                      {inspection.applicant.last_name}
                    </p>
                    <p className="text-sm text-gray-500">Applicant</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{inspection.applicant.phone}</p>
                    <p className="text-sm text-gray-500">Phone</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{inspection.applicant.email}</p>
                    <p className="text-sm text-gray-500">Email</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700">
                    Call Applicant
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "conduct" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Inspection Result */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Inspection Result</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: "pass", label: "Pass", color: "green" },
                  { value: "fail", label: "Fail", color: "red" },
                  {
                    value: "conditional",
                    label: "Conditional Pass",
                    color: "yellow",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setInspectionResult(option.value as any)}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      inspectionResult === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CheckCircle
                      className={`h-6 w-6 mx-auto mb-2 ${
                        inspectionResult === option.value
                          ? `text-${option.color}-500`
                          : "text-gray-400"
                      }`}
                    />
                    <p className="font-medium">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Violations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Violations Found</h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newViolation}
                    onChange={(e) => setNewViolation(e.target.value)}
                    placeholder="Describe violation..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddViolation()
                    }
                  />
                  <button
                    onClick={handleAddViolation}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
                {violations.length > 0 && (
                  <div className="space-y-2">
                    {violations.map((violation, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3"
                      >
                        <p className="text-red-800">{violation}</p>
                        <button
                          onClick={() => handleRemoveViolation(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Inspection Photos</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                  <div className="text-center">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload photos
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Inspection photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() =>
                            setPhotos(photos.filter((_, i) => i !== index))
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Inspection Notes</h3>
              <textarea
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                placeholder="Add detailed notes about the inspection..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                // onClick={onBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitInspection}
                className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Submit Inspection
              </button>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Previous Inspections</h3>
            <div className="text-center py-8 text-gray-500">
              This section is currently under development and will be available
              shortly.
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Project Documents</h3>
            {user?.role !== "inspection_officer" ? (
              <p className="text-gray-500 text-center py-8">
                Only inspection officers can view documents
              </p>
            ) : inspection?.documents && inspection.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inspection.documents.map((doc, index) => (
                  <div
                    key={
                      doc.document_type.id ||
                      `${doc.document_type.name}-${index}`
                    }
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className={`h-8 w-8 ${
                          doc.status === "approved"
                            ? "text-green-800"
                            : doc.status === "pending"
                            ? "text-yellow-800"
                            : doc.status === "rejected"
                            ? "text-red-800"
                            : doc.status === "revision_requested"
                            ? "text-blue-800"
                            : "text-gray-600"
                        }`} />
                      <div className="flex-1">
                        <p className="font-medium truncate">
                          {doc.document_type.name}
                        </p>
                        <p className="text-sm text-gray-500 uppercase">
                          Type: {doc.document_type.name}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          doc.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : doc.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : doc.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : doc.status === "revision_requested"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {doc.status
                          .replace("_", " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>

                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium text-center"
                    >
                      View Document
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                {user?.role === "inspection_officer"
                  ? "No documents available"
                  : "Only inspection officers can view documents"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
