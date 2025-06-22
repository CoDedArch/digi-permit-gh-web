import StatCard from "../StatCard";
import QuickActionCard from "../QuickActionCard";
import ActivityItem from "../ActivityItem";
import { Users, FileText, Clock, Check } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value="142" 
          icon={<Users className="h-6 w-6 text-purple-600" />}
        />
        <StatCard 
          title="Active Applications" 
          value="86" 
          icon={<FileText className="h-6 w-6 text-blue-600" />}
        />
        <StatCard 
          title="Avg. Processing Time" 
          value="3.2 days" 
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
        />
        <StatCard 
          title="System Health" 
          value="100%" 
          icon={<Check className="h-6 w-6 text-green-600" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-2">Application Status Distribution</h3>
          <div className="h-64">
            {/* Chart placeholder */}
            <div className="flex items-center justify-center h-full bg-gray-100 rounded">
              <p className="text-gray-500">Applications by status chart</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-2">User Activity</h3>
          <div className="h-64">
            {/* Chart placeholder */}
            <div className="flex items-center justify-center h-full bg-gray-100 rounded">
              <p className="text-gray-500">User activity timeline</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent System Activities</h2>
      <div className="space-y-4">
        <ActivityItem 
          user="Admin User" 
          action="Updated system settings" 
          time="10 minutes ago"
        />
        <ActivityItem 
          user="Kwame Asante" 
          action="Created new user account" 
          time="25 minutes ago"
        />
        <ActivityItem 
          user="System" 
          action="Performed nightly backup" 
          time="2 hours ago"
        />
        <ActivityItem 
          user="Ama Mensah" 
          action="Assigned 5 applications for review" 
          time="4 hours ago"
        />
      </div>

      <div className="mt-8">
        <QuickActionCard 
          title="User Management"
          description="Manage system users and permissions"
          icon={<Users className="h-6 w-6" />}
          buttonText="Manage Users"
          href="/users"
          fullWidth
        />
      </div>
    </div>
  );
}
