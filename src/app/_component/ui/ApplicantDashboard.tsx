"use client"

import QuickActionCard from "../QuickActionCard";

import { FileText, CalendarCheck } from "lucide-react";
import { useApplicantDashboardMap } from "@/components/UseApplicationDashboardMap";
import dynamic from "next/dynamic";


const ApplicantDashboardMap = dynamic(
  () => import("@/components/ApplicantDashboardMap"),
  {
    ssr: false,
  },
);

export default function ApplicantDashboard() {
  const { data, loading } = useApplicantDashboardMap();
  if (loading) return <p>Loading...</p>

  return (
    <div>
      <ApplicantDashboardMap permits={data.permits} mmdas={data.mmdas} />


      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          title="Start New Application"
          description="Begin a new building permit application"
          icon={<FileText className="h-6 w-6" />}
          buttonText="Apply Now"
          href="/new-application"
        />
        <QuickActionCard
          title="Schedule Inspection"
          description="Request a site inspection for your project"
          icon={<CalendarCheck className="h-6 w-6" />}
          buttonText="Schedule"
          href="/inspections"
        />
      </div>
    </div>
  );
}
