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
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import { InspectionPhoto } from "@/types";

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
  scheduled_time?: string;
  actual_date?: string;
  notes?: string;
  is_reinspection: boolean;
  findings?: string;
  recommendations?: string;
  violations_found?: string;
  special_instructions?: string;
  documents?: Document[];
  photos?: InspectionPhoto[];
  application: {
    id: number;
    project_name: string;
    application_number: string;
    project_description?: string;
    permit_type?: {
      id: number;
      name: string;
    };
    project_address?: string;
  };
  inspection_officer?: {
    id: number;
    first_name: string;
    last_name: string;
    phone?: string;
  };
  mmda: {
    id: number;
    name: string;
  };
  applicant: {
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
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [violations, setViolations] = useState<string[]>([]);
  const [newViolation, setNewViolation] = useState("");
  const [photos, setPhotos] = useState<InspectionPhoto[]>([]);
  const [inspectionResult, setInspectionResult] = useState<
    "passed" | "failed" | "partial" | ""
  >("");
  const { inspectId } = useParams();
  const [inspection, setInspection] = useState<InspectionDetail | null>(null);
  const { user } = useAuth();

  const isDuplicatePhoto = (
    photos: InspectionPhoto[],
    newPhoto: InspectionPhoto,
  ) => {
    return photos.some((photo) => photo.file_path === newPhoto.file_path);
  };

  const handleInspectionPhotoUpload = async (
    file: File,
    inspectionId: string,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("inspection_id", inspectionId);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}uploads/inspection-photos`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      },
    );

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    return await res.json();
  };

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

        if (user?.role === "inspection_officer") {
          // Fetch documents
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

          // Fetch photos
          const photosRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}inspections/${inspectId}/photos`,
            { credentials: "include" },
          );
          if (photosRes.ok) {
            const photosData = await photosRes.json();
            setPhotos(photosData);
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

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files || !inspection) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(event.target.files).map(
        async (file) => {
          const result = await handleInspectionPhotoUpload(
            file,
            inspection.id.toString(),
          );
          return {
            file_path: result.file_url,
            inspection_id: inspection.id,
            // Include other necessary photo fields
            id: result.id || Date.now(), // temporary ID for new photos
            caption: "",
            uploaded_at: new Date().toISOString(),
          };
        },
      );

      const uploadedPhotos = await Promise.all(uploadPromises);

      // Filter out duplicates before updating state
      const uniqueNewPhotos = uploadedPhotos.filter(
        (newPhoto) => !isDuplicatePhoto(photos, newPhoto),
      );

      setPhotos((prev) => [...prev, ...uniqueNewPhotos]);
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast.error("Error uploading some photos");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDeletePhoto = async (photoId: number, index: number) => {
    try {
      if (photoId) {
        // Only call API for photos that exist in backend
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}uploads/inspection-photos/${photoId}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
      }
      setPhotos((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Error deleting photo");
    }
  };

  const handleSubmitInspection = async () => {
    if (!inspectionResult || !inspection) {
      alert("Please select an inspection result");
      return;
    }

    setSubmitting(true);
    const inspectionData = {
      status: "completed",
      outcome: inspectionResult,
      notes: inspectionNotes,
      violations_found: violations.join("\n"),
      photos: photos.map((photo) => ({
        file_path: photo.file_path,
        caption: photo.caption,
      })),
      actual_date: new Date().toISOString(),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}inspections/${inspection.id}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inspectionData),
          credentials: "include",
        },
      );

      if (!res.ok) throw new Error("Submission failed");

      const result = await res.json();
      // Redirect to /schedule-inspection
      window.location.href = "/schedule-inspection";
    } catch (error) {
      console.error("Error submitting inspection:", error);
      // alert("Error submitting inspection");
      if (typeof window !== "undefined") {
        // Dynamically import toast if using a library like react-hot-toast or similar
        toast.error("Error submitting inspection");
      }
    } finally {
      setSubmitting(false);
    }
  };

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

  console.log("Inspection Data:", inspection);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
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
              {inspection.status.replace("_", " ")}
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
                    : tab.id === "conduct" && inspection?.status === "completed"
                    ? "border-transparent text-gray-400 cursor-not-allowed" // Disabled state
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                disabled={
                  tab.id === "conduct" && inspection?.status === "completed"
                }
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
                          ? formatDate(inspection.scheduled_date)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">
                        {inspection.scheduled_time || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">
                        {inspection.application.project_address || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Permit Type</p>
                      <p className="font-medium">
                        {inspection.application?.permit_type?.name || "N/A"}
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
                    <p className="text-gray-600">
                      {inspection.notes || "No description provided"}
                    </p>
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

              {/* Photos Preview */}
              {inspection.photos && inspection.photos.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Inspection Photos
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {inspection.photos
                      .filter(
                        (photo, index, self) =>
                          index ===
                          self.findIndex(
                            (p) =>
                              p.file_path === photo.file_path ||
                              (p.id && photo.id && p.id === photo.id),
                          ),
                      )
                      .map((photo, index) => (
                        <div key={photo.id || index} className="relative">
                          <img
                            src={photo.file_path}
                            alt={`Inspection photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder-image.jpg";
                            }}
                          />
                          {photo.caption && (
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {photo.caption}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
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

        {activeTab === "conduct" && inspection.status !== "completed" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Inspection Result */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Inspection Result</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: "passed", label: "Pass", color: "green" },
                  { value: "failed", label: "Fail", color: "red" },
                  {
                    value: "partial",
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
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Uploading...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload photos
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo.file_path}
                          alt={`Inspection photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() =>
                            photo.id
                              ? handleDeletePhoto(photo.id, index)
                              : setPhotos(photos.filter((_, i) => i !== index))
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <input
                          type="text"
                          placeholder="Add caption..."
                          value={photo.caption || ""}
                          onChange={(e) => {
                            const newPhotos = [...photos];
                            newPhotos[index].caption = e.target.value;
                            setPhotos(newPhotos);
                          }}
                          className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 w-full rounded-b-lg focus:outline-none"
                        />
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
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitInspection}
                className={`flex items-center px-6 py-2 rounded-lg 
                  ${
                    submitting || !inspectionResult || !inspectionNotes
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                disabled={submitting || !inspectionResult || !inspectionNotes}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Inspection
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === "conduct" && inspection.status === "completed" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Inspection Completed
              </h3>
              <p className="text-gray-600 mb-4">
                This inspection was marked as{" "}
                <span className="font-semibold capitalize">
                  {inspection.outcome}
                </span>{" "}
                on {formatDate(inspection.actual_date || "")}.
              </p>
              {inspection.findings && (
                <div className="text-left bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">Findings:</h4>
                  <p className="text-gray-600">{inspection.findings}</p>
                </div>
              )}
              {inspection.violations_found && (
                <div className="text-left bg-red-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">Violations Found:</h4>
                  <p className="text-gray-600 whitespace-pre-line">
                    {inspection.violations_found}
                  </p>
                </div>
              )}
              {inspection.recommendations && (
                <div className="text-left bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Recommendations:</h4>
                  <p className="text-gray-600">{inspection.recommendations}</p>
                </div>
              )}
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
                      <FileText
                        className={`h-8 w-8 ${
                          doc.status === "approved"
                            ? "text-green-800"
                            : doc.status === "pending"
                            ? "text-yellow-800"
                            : doc.status === "rejected"
                            ? "text-red-800"
                            : doc.status === "revision_requested"
                            ? "text-blue-800"
                            : "text-gray-600"
                        }`}
                      />
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
