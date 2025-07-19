"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Application, getMyApplications } from "@/app/data/queries";
import {
  CalendarDays,
  FolderOpen,
  MapPin,
  FileImage,
  FileWarning,
  FileText,
  Check,
  CheckCircle,
  Loader,
} from "lucide-react";
import Link from "next/link";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true); // new

  useEffect(() => {
    setLoading(true);
    getMyApplications()
      .then((data) => {
        console.log("🧾 Applications received:", data);
        setApplications(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false)); // 🔽 stop loading
  }, []);

  return (
    <div className="p-6 space-y-6 min-h-screen bg-white">
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
            You haven’t started any building permit applications yet. When you
            do, they’ll show up here for you to track and manage.
          </p>
          <Link
            href="/new-application"
            className="inline-block mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
          >
            Start New Application
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <Link
              key={app.id}
              href={`/my-applications/${app.id}`}
              className="block"
            >
              <Card
                key={app.id}
                className="shadow-lg hover:shadow-xl transition duration-300 rounded-2xl border border-muted"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Header: Project name & Status */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-primary">
                      {app.project_name}
                    </h2>
                    <Badge
                      variant={
                        app.status === "approved"
                          ? "default"
                          : app.status === "rejected"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {app.status.toUpperCase()}
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
                  {app.documents?.length > 0 ? (
                    <>
                      {/* Submission Status */}
                      <div className="flex items-center justify-between text-sm font-medium text-green-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>All documents submitted</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <FileImage className="w-4 h-4" />
                          <span>
                            {app.documents.length} Document
                            {app.documents.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Document Grid */}
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {app.documents.slice(0, 3).map((doc, i) => (
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

                        {/* +N More Indicator */}
                        {app.documents.length > 3 && (
                          <div className="rounded-xl bg-muted border flex items-center justify-center text-sm text-muted-foreground h-[96px]">
                            +{app.documents.length - 3}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center text-sm text-muted-foreground gap-2 mt-2">
                      <FileWarning className="w-4 h-4" />
                      <span>No documents uploaded.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
