import StatCard from "../StatCard";
import InspectionCard from "../InspectionCard";
import QuickActionCard from "../QuickActionCard";
import { CalendarCheck, FileText, AlertCircle, Clock} from "lucide-react";
import dynamic from "next/dynamic";
import { useInspectionStats } from "@/components/UseInspectorStats";
import { useInspectorDashboardMap } from "@/components/UseInspectorDashboard";
import { useInspectionQueue } from "@/components/UseInspectionQueue";

const InspectorDashboardMap = dynamic(
  () => import("@/components/InspectionDashboardMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[75vh] flex items-center justify-center bg-gray-100 rounded-lg">
        <p>Loading map...</p>
      </div>
    ),
  },
);

export default function InspectionOfficerDashboard() {
  const { data: mapData, loading: mapLoading } = useInspectorDashboardMap();
  const { data: stats, loading: statsLoading } = useInspectionStats();
  const { data: queueData, loading: queueLoading } = useInspectionQueue();

  return (
    <div className="space-y-8">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Scheduled Today"
          value={statsLoading ? "..." : stats?.scheduled_today?.toString() || "0"}
          icon={<CalendarCheck className="h-6 w-6 text-purple-600" />}
          loading={statsLoading}
        />

        <StatCard
          title="Pending Reports"
          value={statsLoading ? "..." : stats?.pending_reports?.toString() || "0"}
          icon={<FileText className="h-6 w-6 text-yellow-600" />}
          loading={statsLoading}
        />

        <StatCard
          title="Violations Found"
          icon={<AlertCircle className="h-6 w-6 text-red-600" />}
          loading={statsLoading}
          customContent={
            statsLoading ? (
              <div className="text-xl font-bold">...</div>
            ) : (
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {stats?.violations_found ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Last 30 days
                </div>
              </div>
            )
          }
        />

        <StatCard
          title="Avg. Inspection Time"
          value={
            statsLoading
              ? "..."
              : `${stats?.avg_duration_hours?.toFixed(1) ?? "0"} hours`
          }
          subValue={
            statsLoading
              ? ""
              : `${stats?.reinspection_rate ?? 0}% reinspection rate`
          }
          icon={<Clock className="h-6 w-6 text-blue-600" />}
          loading={statsLoading}
        />
      </div>

      {/* Today's Inspection Schedule Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Today&apos;s Inspection Schedule</h2>
        <div className="space-y-4">
          {queueLoading ? (
            <div className="flex items-center justify-center py-8">
              <p>Loading schedule...</p>
            </div>
          ) : queueData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p>No inspections scheduled today</p>
            </div>
          ) : (
            queueData.map((item) => (
              <InspectionCard
                key={item.id}
                time={item.scheduled_time}
                permitNo={item.permit_no}
                address={item.address}
                type={item.type}
                status={item.status}
                inspectionId={item.id}
              />
            ))
          )}
        </div>
      </div>

      {/* MMDA Inspection Map Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">MMDA Inspection Map</h2>
        {mapLoading ? (
          <div className="h-[75vh] flex items-center justify-center bg-gray-100 rounded-lg">
            <p>Loading map data...</p>
          </div>
        ) : (
          <InspectorDashboardMap
            items={mapData?.permits || []}
            mmdas={mapData?.mmdas || []}
          />
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard 
          title="Submit Inspection Report"
          description="Complete and submit a site inspection report"
          icon={<FileText className="h-6 w-6" />}
          buttonText="Start Report"
          href="/reports"
        />
        <QuickActionCard 
          title="Report Violation"
          description="Document a building code violation"
          icon={<AlertCircle className="h-6 w-6" />}
          buttonText="Report Now"
          href="/violations"
        />
      </div>
    </div>
  );
}