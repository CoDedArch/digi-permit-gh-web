"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Application, getMyApplications } from "@/app/data/queries";
import {
  CalendarDays,
  FolderOpen,
  MapPin,
  FileText,
  Check,
  Loader,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileCheck,
  Award,
  Archive,
} from "lucide-react";
import Link from "next/link";

// Status configuration with colors, labels, and icons
const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    color: "bg-gray-100 text-gray-600",
    icon: FileText,
    order: 1
  },
  SUBMITTED: {
    label: "Submitted",
    color: "bg-blue-100 text-blue-600",
    icon: Clock,
    order: 2
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "bg-yellow-100 text-yellow-600",
    icon: Eye,
    order: 3
  },
  ADDITIONAL_INFO_REQUESTED: {
    label: "Additional Info Requested",
    color: "bg-orange-100 text-orange-600",
    icon: AlertCircle,
    order: 4
  },
  APPROVED: {
    label: "Approved",
    color: "bg-green-100 text-green-600",
    icon: CheckCircle,
    order: 5
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-100 text-red-600",
    icon: XCircle,
    order: 6
  },
  INSPECTION_PENDING: {
    label: "Inspection Pending",
    color: "bg-purple-100 text-purple-600",
    icon: Clock,
    order: 7
  },
  INSPECTION_COMPLETED: {
    label: "Inspection Completed",
    color: "bg-indigo-100 text-indigo-600",
    icon: FileCheck,
    order: 8
  },
  FOR_APPROVAL_OR_REJECTION: {
    label: "For Approval/Rejection",
    color: "bg-amber-100 text-amber-600",
    icon: AlertCircle,
    order: 9
  },
  ISSUED: {
    label: "Issued",
    color: "bg-emerald-100 text-emerald-600",
    icon: Award,
    order: 10
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-teal-100 text-teal-600",
    icon: CheckCircle,
    order: 11
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-slate-100 text-slate-600",
    icon: Archive,
    order: 12
  }
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyApplications()
      .then((data) => {
        console.log("🧾 Applications received:", data);
        setApplications(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Group applications by status
  const groupedApplications = applications.reduce((groups, app) => {
    const status = app.status.toUpperCase();
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(app);
    return groups;
  }, {} as Record<string, Application[]>);

  // Sort status groups by order
  const sortedStatusKeys = Object.keys(groupedApplications).sort((a, b) => {
    const orderA = STATUS_CONFIG[a as keyof typeof STATUS_CONFIG]?.order || 999;
    const orderB = STATUS_CONFIG[b as keyof typeof STATUS_CONFIG]?.order || 999;
    return orderA - orderB;
  });

  const renderApplicationCard = (app: Application) => {
    const status = app.status.toUpperCase();
    const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    const StatusIcon = statusConfig?.icon || FileText;

    return (
      <Link
        key={app.id}
        href={`/my-applications/${app.id}`}
        className="block"
      >
        <Card className="shadow-lg hover:shadow-xl transition duration-300 rounded-2xl border border-muted">
          <CardContent className="p-5 space-y-4">
            {/* Header: Project name & Status */}
            <div className="flex justify-between items-start gap-2">
              <h3 className="text-lg font-bold text-primary line-clamp-2">
                {app.project_name}
              </h3>
              <Badge className={`${statusConfig?.color || "bg-gray-100 text-gray-600"} px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig?.label || status}
              </Badge>
            </div>

            {/* Meta Info */}
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                <span>
                  {app.permit_type?.name || "Unknown Permit Type"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{app.mmda?.name || "MMDA not assigned"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {app.documents.slice(0, 2).map((doc, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-muted border flex flex-col items-center justify-center p-3 text-center relative h-[96px]"
                >
                  {/* Checkmark Overlay */}
                  <div className="absolute top-1 right-1 bg-green-600 text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>

                  {/* Placeholder icon & label */}
                  <FileText className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                    {doc.document_type?.name || `Doc ${i + 1}`}
                  </span>
                </div>
              ))}

              {/* "+N More" Cell or Third Document */}
              {app.documents.length > 3 ? (
                <div className="rounded-xl bg-muted border flex items-center justify-center text-sm text-muted-foreground relative h-[96px]">
                  +{app.documents.length - 2}
                  <div className="absolute top-1 right-1 bg-green-600 text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                </div>
              ) : app.documents.length === 3 ? (
                <div className="rounded-xl bg-muted border flex flex-col items-center justify-center p-3 text-center relative h-[96px]">
                  <div className="absolute top-1 right-1 bg-green-600 text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>

                  <FileText className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                    {app.documents[2].document_type?.name || `Doc 3`}
                  </span>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="p-6 space-y-8 min-h-screen bg-white">
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-gray-600" />
        </div>
      )}
      
      <h1 className="text-2xl font-semibold">My Applications</h1>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center text-muted-foreground">
          <FolderOpen className="w-12 h-12 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-600">
            No applications found
          </h2>
          <p className="max-w-md text-sm">
            You haven&apos;t started any building permit applications yet. When you
            do, they&apos;ll show up here for you to track and manage.
          </p>
          <Link
            href="/new-application"
            className="inline-block mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
          >
            Start New Application
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedStatusKeys.map((status) => {
            const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
            const StatusIcon = statusConfig?.icon || FileText;
            const apps = groupedApplications[status];
            
            return (
              <div key={status} className="space-y-4">
                {/* Status Section Header */}
                <div className="flex items-center gap-3 border-b pb-2">
                  <div className={`p-2 rounded-lg ${statusConfig?.color || "bg-gray-100 text-gray-600"}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {statusConfig?.label || status.replace(/_/g, " ")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {apps.length} application{apps.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Applications Grid for this status */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {apps.map(renderApplicationCard)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}