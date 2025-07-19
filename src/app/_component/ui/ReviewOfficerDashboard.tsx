import StatCard from "../StatCard";
import ReviewRow from "../ReviewRow";
import { ClipboardList, AlertCircle, Check, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import { useReviewerDashboardMap } from "@/components/UseReviewerDashboard";
import { useReviewerStats } from "@/components/UseReviewerStats";
import { useReviewerQueue } from "@/components/UseReviewerQueue";

const ReviewerDashboardMap = dynamic(
  () => import("@/components/ReviewDashboardMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[75vh] flex items-center justify-center bg-gray-100 rounded-lg">
        <p>Loading map...</p>
      </div>
    ),
  },
);

export default function ReviewOfficerDashboard() {
  const { data: mapData, loading: mapLoading } = useReviewerDashboardMap();
  const { data: stats, loading: statsLoading } = useReviewerStats();
  const { data: queueData, loading: queueLoading } = useReviewerQueue();

  console.log("Stats is", stats);
  return (
    <div className="space-y-8">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Pending Review"
          value={
            statsLoading ? "..." : stats?.pending_review?.toString() || "0"
          }
          icon={<ClipboardList className="h-6 w-6 text-purple-600" />}
          loading={statsLoading}
        />

        <StatCard
          title="Overdue"
          value={statsLoading ? "..." : stats?.overdue?.toString() || "0"}
          icon={<AlertCircle className="h-6 w-6 text-red-600" />}
          loading={statsLoading}
        />

        <StatCard
          title="Completed Today"
          icon={<Check className="h-6 w-6 text-green-600" />}
          loading={statsLoading}
          customContent={
            statsLoading ? (
              <div className="text-xl font-bold">...</div>
            ) : (
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {stats?.completed_today_reviewer ?? 0}{" "}
                  <span className="text-muted-foreground text-sm">
                    / {stats?.completed_today_mmda ?? 0}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{
                      width: `${
                        stats?.completed_today_mmda
                          ? Math.min(
                              100,
                              (stats.completed_today_reviewer /
                                stats.completed_today_mmda) *
                                100,
                            ).toFixed(1)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            )
          }
        />

        <StatCard
          title="Avg. Review Time"
          value={
            statsLoading
              ? "..."
              : `${
                  stats?.avg_review_time_days_reviewer?.toFixed(1) ?? "0"
                } days`
          }
          subValue={
            statsLoading
              ? ""
              : `vs ${
                  stats?.avg_review_time_days_mmda?.toFixed(1) ?? "0"
                } days (MMDA avg)`
          }
          icon={<Clock className="h-6 w-6 text-blue-600" />}
          loading={statsLoading}
        />
      </div>

      {/* MMDA Permit Map Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">MMDA Permit Map</h2>
        {mapLoading ? (
          <div className="h-[75vh] flex items-center justify-center bg-gray-100 rounded-lg">
            <p>Loading map data...</p>
          </div>
        ) : (
          <ReviewerDashboardMap
            permits={mapData?.permits || []}
            mmdas={mapData?.mmdas || []}
          />
        )}
      </div>

      {/* Priority Review Queue Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Priority Review Queue</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permit #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days in Queue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queueLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Loading queue data...
                  </td>
                </tr>
              ) : queueData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    No applications in queue
                  </td>
                </tr>
              ) : (
                queueData.map((item) => (
                  <ReviewRow
                    key={item.permit_no}
                    permitNo={item.permit_no}
                    type={item.type}
                    applicant={item.applicant}
                    daysInQueue={item.days_in_queue}
                    priority={item.priority}
                    permitId={item.permit_id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
