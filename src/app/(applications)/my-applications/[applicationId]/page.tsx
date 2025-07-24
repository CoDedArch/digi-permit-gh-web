"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  ApplicationDetail,
  ApplicationFormDefaults,
  fetchApplicationDetail,
} from "@/app/data/queries";
import { AlertCircle, FileText } from "lucide-react";
import Link from "next/link";

const cleanNumericDict = (
  obj?: Record<string, any>,
): Record<string, number> | undefined => {
  if (!obj) return undefined;

  const cleaned: Record<string, number> = {};

  for (const [key, value] of Object.entries(obj)) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      cleaned[key] = num;
    }
  }

  return Object.keys(cleaned).length ? cleaned : undefined;
};

const cleanStringDict = (obj?: any): Record<string, string> | undefined => {
  if (!obj || typeof obj !== "object") return undefined;

  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string" && value.trim() !== "") {
      cleaned[key] = value.trim();
    }
  }

  return Object.keys(cleaned).length ? cleaned : undefined;
};

const SpatialPolygonInput = dynamic(
  () => import("@/components/SpatialInputPlot"),
  {
    ssr: false,
  },
);

const TimelineChart = dynamic(
  () => import("@/components/analytics/TimelineChart"),
  { ssr: false },
);
const CostAreaChart = dynamic(
  () => import("@/components/analytics/CostAreaChart"),
  { ssr: false },
);

const FieldBlock = ({
  label,
  value,
  children,
  full = false,
}: {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
  full?: boolean;
}) => {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="mb-1 text-sm text-gray-600 font-medium">{label}</div>
      {children ? (
        children
      ) : (
        <div className="rounded-lg border px-3 py-2 text-sm bg-gray-50 text-gray-800 shadow-sm hover:shadow-md transition">
          {value || <span className="italic text-gray-400">Not provided</span>}
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-lg font-semibold text-gray-700 border-b pb-1">{title}</h3>
);

export default function ApplicationPage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ApplicationFormDefaults>({
    project_name: "",
    project_description: "",
    expected_start_date: "",
    expected_end_date: "",
    parcel_number: "",
    project_address: "",
    parking_spaces: undefined,
    setbacks: {},
    floor_areas: {},
    site_conditions: {},
    estimated_cost: undefined,
    construction_area: undefined,
    fire_safety_plan: "",
    waste_management_plan: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const { application, formDefaults } = await fetchApplicationDetail(
          applicationId as string,
        );
        setApp(application);
        setForm(formDefaults);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [applicationId]);

  const saveChanges = async () => {
    try {
      const {
        project_name,
        project_description,
        fire_safety_plan,
        waste_management_plan,
        expected_start_date,
        expected_end_date,
        parcel_number,
        estimated_cost,
        construction_area,
      } = form;

      const sanitizedBody = {
        project_name: project_name?.trim() || undefined,
        project_description: project_description?.trim() || undefined,
        fire_safety_plan: fire_safety_plan?.trim() || undefined,
        waste_management_plan: waste_management_plan?.trim() || undefined,
        expected_start_date: expected_start_date || undefined,
        expected_end_date: expected_end_date || undefined,
        parcel_number: parcel_number?.trim() || undefined,
        estimated_cost: estimated_cost ?? undefined,
        construction_area: construction_area ?? undefined,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}permits/my-applications/${applicationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sanitizedBody),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to update application.");
      }

      const updatedApp = await res.json();
      setApp(updatedApp);
      setForm({
        ...form,
        ...updatedApp,
        expected_start_date: updatedApp.expected_start_date?.slice(0, 10) || "",
        expected_end_date: updatedApp.expected_end_date?.slice(0, 10) || "",
      });
      setEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Update failed:", err.message);
      } else {
        console.error("Update failed:", err);
        alert("An unknown error occurred.");
      }
    }
  };

  if (loading) return <Skeleton className="w-full mx-auto min-h-screen" />;
  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6 bg-white px-6">
        <div className="flex flex-col items-center space-y-2">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-3xl font-bold text-gray-900">
            Application Not Found
          </h2>
          <p className="text-gray-500 max-w-md">
            We couldn’t retrieve information for this application. It may have
            been deleted, expired, or the link is invalid.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="default" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/my-applications">My Applications</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isEditable = [
    "draft",
    "submitted",
    "additional_info_requested",
  ].includes(app.status?.toLowerCase());

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">
              Application #{app.application_number}
            </CardTitle>
            <p className="text-muted-foreground">
              {app.permit_type?.name} - {app.mmda?.name}
            </p>
          </div>
          <Badge variant="outline">{app.status}</Badge>
        </CardHeader>
        <div className="p-4">
          {/* Map Display */}
          {app.latitude && app.longitude && app.parcel_geometry && (
            <div className="space-y-2">
              <SectionHeader title="Location Map" />
              <SpatialPolygonInput
                value={JSON.stringify(app.parcel_geometry)}
                onChange={() => {}}
                center={[app.latitude, app.longitude]}
                referencePolygon={
                  app.spatial_data
                    ? JSON.stringify(app.spatial_data)
                    : undefined
                }
              />
            </div>
          )}
        </div>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field block */}
            <FieldBlock label="Project Name" value={app.project_name}>
              {isEditable && editing && (
                <Input
                  value={form.project_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, project_name: e.target.value }))
                  }
                />
              )}
            </FieldBlock>

            <FieldBlock label="Parcel Number" value={app.parcel_number}>
              {isEditable && editing && (
                <Input
                  value={form.parcel_number || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, parcel_number: e.target.value }))
                  }
                />
              )}
            </FieldBlock>

            <FieldBlock
              label="Project Description"
              value={app.project_description}
              full
            >
              {isEditable && editing && (
                <Textarea
                  value={form.project_description || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      project_description: e.target.value,
                    }))
                  }
                />
              )}
            </FieldBlock>

            <FieldBlock
              label="Fire Safety Plan"
              value={app.fire_safety_plan || "-"}
            >
              {isEditable && editing && (
                <Input
                  value={form.fire_safety_plan || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fire_safety_plan: e.target.value }))
                  }
                />
              )}
            </FieldBlock>

            <FieldBlock
              label="Waste Management Plan"
              value={app.waste_management_plan || "-"}
            >
              {isEditable && editing && (
                <Input
                  value={form.waste_management_plan || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      waste_management_plan: e.target.value,
                    }))
                  }
                />
              )}
            </FieldBlock>

            <FieldBlock
              label="Expected Start Date"
              value={
                app.expected_start_date
                  ? format(new Date(app.expected_start_date), "PPP")
                  : "-"
              }
            >
              {isEditable && editing && (
                <Input
                  type="date"
                  value={form.expected_start_date || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      expected_start_date: e.target.value,
                    }))
                  }
                />
              )}
            </FieldBlock>

            <FieldBlock
              label="Expected End Date"
              value={
                app.expected_end_date
                  ? format(new Date(app.expected_end_date), "PPP")
                  : "-"
              }
            >
              {isEditable && editing && (
                <Input
                  type="date"
                  value={form.expected_end_date || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      expected_end_date: e.target.value,
                    }))
                  }
                />
              )}
            </FieldBlock>

            <FieldBlock
              label="Estimated Cost (GHS)"
              value={
                app.estimated_cost
                  ? `GHS ${app.estimated_cost.toLocaleString()}`
                  : "-"
              }
            >
              {isEditable && editing && (
                <Input
                  type="number"
                  value={form.estimated_cost?.toString() || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      estimated_cost: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              )}
            </FieldBlock>

            <FieldBlock
              label="Construction Area (m²)"
              value={
                app.construction_area ? `${app.construction_area} m²` : "-"
              }
            >
              {isEditable && editing && (
                <Input
                  type="number"
                  value={form.construction_area?.toString() || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      construction_area: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              )}
            </FieldBlock>
          </div>

          {/* Action buttons */}
          {isEditable && (
            <div className="pt-4 flex justify-end gap-3">
              {editing ? (
                <>
                  <Button onClick={saveChanges}>Save</Button>
                  <Button variant="ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>Edit</Button>
              )}
            </div>
          )}
        </CardContent>
        <CardContent className="space-y-6">
          {/* Zoning & Land Use */}
          <div className="space-y-4">
            <SectionHeader title="Zoning & Land Use" />
            <div className="grid md:grid-cols-2 gap-4">
              <FieldBlock
                label="Zoning District"
                value={app.zoning_district?.name || "-"}
              />
              <FieldBlock
                label="Zoning Use"
                value={app.zoning_use?.use || "-"}
              />
              <FieldBlock
                label="Previous Land Use"
                value={app.previous_land_use?.name || "-"}
              />
              <FieldBlock
                label="Drainage Type"
                value={app.drainage_type?.name || "-"}
              />
            </div>
          </div>

          {/* Architect & Applicant Info */}
          <div className="space-y-4">
            <SectionHeader title="Professional In Charge" />
            <div className="grid md:grid-cols-2 gap-4">
              <FieldBlock
                label="Architect"
                value={app.architect?.full_name || "-"}
              />
              <FieldBlock
                label="Firm"
                value={app.architect?.firm_name || "-"}
              />
              <FieldBlock
                label="Architect Email"
                value={app.architect?.email || "-"}
              />
              <FieldBlock
                label="License Number"
                value={app.architect?.license_number || "-"}
              />
              <FieldBlock
                label="Applicant"
                value={app.applicant?.full_name || "-"}
              />
              <FieldBlock
                label="Applicant Email"
                value={app.applicant?.email || "-"}
              />
            </div>
          </div>

          {/* Site Info */}
          <div className="space-y-4">
            <SectionHeader title="Site Information" />
            <div className="grid md:grid-cols-2 gap-4">
              <FieldBlock
                label="Project Address"
                value={app.project_address || "-"}
              />
              <FieldBlock
                label="Parking Spaces"
                value={app.parking_spaces?.toString() || "-"}
              />
              <FieldBlock
                label="Setbacks"
                value={
                  app.setbacks
                    ? Object.entries(app.setbacks)
                        .map(([side, value]) => `${side}: ${value}m`)
                        .join(", ")
                    : "-"
                }
              />
              <FieldBlock
                label="Floor Areas"
                value={
                  app.floor_areas
                    ? Object.entries(app.floor_areas)
                        .map(([floor, value]) => `${floor}: ${value}m²`)
                        .join(", ")
                    : "-"
                }
              />
              <FieldBlock
                label="Site Conditions"
                value={
                  app.site_conditions?.length
                    ? app.site_conditions.map((c) => c.name).join(", ")
                    : "-"
                }
              />
            </div>
          </div>

          {/* Payments */}
          {(app.payments?.length ?? 0) > 0 && (
            <div className="space-y-4">
              <SectionHeader title="Payments" />
              <div className="space-y-2">
                {app.payments?.map((p, i) => (
                  <div
                    key={i}
                    className="border rounded-md p-3 bg-white shadow-sm text-sm space-y-1"
                  >
                    <div className="flex justify-between font-medium">
                      <span>{p.purpose}</span>
                      <span>{`GHS ${p.amount.toLocaleString()}`}</span>
                    </div>
                    <div className="text-gray-500">
                      {p.status} • {format(new Date(p.payment_date), "PPP")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {(app.documents?.length ?? 0) > 0 && (
            <div className="space-y-4">
              <SectionHeader title="Uploaded Documents" />
              <ul className="space-y-2">
                {app.documents?.map((doc, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center border rounded px-3 py-2 bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {doc.document_type?.name || `Doc ${idx + 1}`}
                      </span>
                    </div>
                    <a
                      href={doc.file_path || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 underline"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineChart app={app} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cost vs Area</CardTitle>
          </CardHeader>
          <CardContent>
            <CostAreaChart
              cost={app.estimated_cost}
              area={app.construction_area}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
