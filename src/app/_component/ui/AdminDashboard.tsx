import StatCard from "../StatCard";
import QuickActionCard from "../QuickActionCard";
import ActivityItem from "../ActivityItem";
import { Users, FileText, Clock, Check, ClipboardList, AlertCircle, UserCheck, Settings } from "lucide-react";
import dynamic from "next/dynamic";
import { useRecentActivities } from "@/components/UseRecentActivities";
import { useAdminDashboardMap } from "@/components/UseAdminDashboardMap";
import { useAdminStats } from "@/components/UseAdminStats";

const AdminDashboardMap = dynamic(
  () => import("@/components/AdminDashboardMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[75vh] flex items-center justify-center bg-gray-100 rounded-lg">
        <p>Loading map...</p>
      </div>
    ),
  },
);

export default function AdminDashboard() {
  const { data: mapData, loading: mapLoading } = useAdminDashboardMap();
  const { data: stats, loading: statsLoading } = useAdminStats();
  const { data: activities, loading: activitiesLoading } = useRecentActivities();

  return (
    <div className="space-y-8">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={statsLoading ? "..." : stats?.total_users?.toString() || "0"}
          icon={<Users className="h-6 w-6 text-purple-600" />}
          loading={statsLoading}
        />

        <StatCard 
          title="Active Applications" 
          value={statsLoading ? "..." : stats?.active_applications?.toString() || "0"}
          icon={<FileText className="h-6 w-6 text-blue-600" />}
          loading={statsLoading}
        />

        <StatCard 
          title="Avg. Processing Time" 
          value={
            statsLoading
              ? "..."
              : `${stats?.avg_processing_time_days?.toFixed(1) ?? "0"} days`
          }
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          loading={statsLoading}
        />

        <StatCard 
          title="MMDA Health" 
          value={statsLoading ? "..." : `${stats?.system_health_percentage ?? 100}%`}
          icon={<Check className="h-6 w-6 text-green-600" />}
          loading={statsLoading}
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Pending Reviews"
          value={statsLoading ? "..." : stats?.pending_reviews?.toString() || "0"}
          icon={<ClipboardList className="h-6 w-6 text-indigo-600" />}
          loading={statsLoading}
        />

        <StatCard
          title="Overdue Applications"
          value={statsLoading ? "..." : stats?.overdue_applications?.toString() || "0"}
          icon={<AlertCircle className="h-6 w-6 text-red-600" />}
          loading={statsLoading}
        />

        <StatCard
          title="Active Staff"
          value={statsLoading ? "..." : stats?.active_staff?.toString() || "0"}
          icon={<UserCheck className="h-6 w-6 text-teal-600" />}
          loading={statsLoading}
        />
      </div>

      {/* MMDA Permit Map Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">MMDA Administration Map</h2>
        {mapLoading ? (
          <div className="h-[75vh] flex items-center justify-center bg-gray-100 rounded-lg">
            <p>Loading map data...</p>
          </div>
        ) : (
          <AdminDashboardMap
            permits={mapData?.permits || []}
            mmdas={mapData?.mmdas || []}
            departments={mapData?.departments || []}
          />
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-2">Application Status Distribution</h3>
          <div className="h-64">
            {statsLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {stats?.status_distribution && Object.entries(stats.status_distribution).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'submitted' ? 'bg-indigo-500' :
                        status === 'under_review' ? 'bg-yellow-500' :
                        status === 'approved' ? 'bg-green-500' :
                        status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                    </div>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-2">Department Performance</h3>
          <div className="h-64">
            {statsLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading performance data...</p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {stats?.department_performance && stats.department_performance.map((dept, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{dept.name}</span>
                      <span className="text-sm">{dept.completed_applications} completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (dept.completed_applications / (stats.total_completed_applications || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent System Activities</h2>
        <div className="space-y-4">
          {activitiesLoading ? (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-center">Loading recent activities...</p>
            </div>
          ) : activities && activities.length > 0 ? (
            activities.map((activity, index) => (
              <ActivityItem 
                key={index}
                user={activity.user_name} 
                action={activity.action} 
                time={activity.time_ago}
              />
            ))
          ) : (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-center text-gray-500">No recent activities</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard 
          title="User Management"
          description="Manage system users and permissions"
          icon={<Users className="h-6 w-6" />}
          buttonText="Manage Users"
          href="/users"
        />

        <QuickActionCard 
          title="System Settings"
          description="Configure MMDA settings and preferences"
          icon={<Settings className="h-6 w-6" />}
          buttonText="System Settings"
          href="/settings"
        />
      </div>
    </div>
  );
}