"use client";

import QuickActionCard from "../QuickActionCard";

import { FileText, CalendarCheck } from "lucide-react";
import { useApplicantDashboardMap } from "@/components/UseApplicationDashboardMap";
import dynamic from "next/dynamic";
import Link from "next/link";

const ApplicantDashboardMap = dynamic(
  () => import("@/components/ApplicantDashboardMap"),
  {
    ssr: false,
  },
);

export default function ApplicantDashboard() {
  const { data, loading } = useApplicantDashboardMap();
  console.log("Permits is",data.permits)
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      { data.permits.length === 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          The interactive map below summarizes your submitted permit
          applications. If you don&apos;t see anything yet, you may not have
          started an application.
          <Link
            href="/new-application"
            className="underline font-medium text-blue-700 ml-1"
          >
            Start a new application.
          </Link>
          <br />
          You can also track the status of your permit applications with your
          respective Metropolitan, Municipal, or District Assembly (MMDA).
        </div>
      )}

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
          href="/schedule-inspection"
        />
      </div>
    </div>
  );
}
