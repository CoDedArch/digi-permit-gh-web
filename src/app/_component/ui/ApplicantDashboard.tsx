import StatCard from "../StatCard";
import TableRow from "../TableRow";
import QuickActionCard from "../QuickActionCard";

import { FileText, AlertCircle, CalendarCheck } from "lucide-react";

export default function ApplicantDashboard() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Active Applications" 
          value="3" 
          icon={<FileText className="h-6 w-6 text-green-600" />}
          trend="up"
        />
        <StatCard 
          title="Pending Actions" 
          value="2" 
          icon={<AlertCircle className="h-6 w-6 text-yellow-600" />}
          trend="down"
        />
        <StatCard 
          title="Upcoming Inspections" 
          value="1" 
          icon={<CalendarCheck className="h-6 w-6 text-blue-600" />}
        />
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permit #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <TableRow 
              permitNo="DP-2023-0456" 
              type="Residential Single" 
              status="Under Review" 
              date="2 days ago"
              actionNeeded={true}
            />
            <TableRow 
              permitNo="DP-2023-0389" 
              type="Commercial Retail" 
              status="Approved" 
              date="1 week ago"
            />
            <TableRow 
              permitNo="DP-2023-0412" 
              type="Temporary Structure" 
              status="Documents Requested" 
              date="3 days ago"
              actionNeeded={true}
            />
          </tbody>
        </table>
      </div>

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