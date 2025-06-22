import StatCard from "../StatCard";
import ReviewRow from "../ReviewRow";

import { ClipboardList, AlertCircle, Check, Clock } from "lucide-react";

export default function ReviewOfficerDashboard() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Pending Review" 
          value="24" 
          icon={<ClipboardList className="h-6 w-6 text-purple-600" />}
        />
        <StatCard 
          title="Overdue" 
          value="5" 
          icon={<AlertCircle className="h-6 w-6 text-red-600" />}
        />
        <StatCard 
          title="Completed Today" 
          value="8" 
          icon={<Check className="h-6 w-6 text-green-600" />}
        />
        <StatCard 
          title="Avg. Review Time" 
          value="2.3 days" 
          icon={<Clock className="h-6 w-6 text-blue-600" />}
        />
      </div>

      <h2 className="text-xl font-semibold mb-4">Priority Review Queue</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permit #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days in Queue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <ReviewRow 
              permitNo="DP-2023-0456" 
              type="High Rise" 
              applicant="Ama Mensah"
              daysInQueue={4}
              priority="high"
            />
            <ReviewRow 
              permitNo="DP-2023-0478" 
              type="Residential Compound" 
              applicant="Kwame Asante"
              daysInQueue={3}
              priority="medium"
            />
            <ReviewRow 
              permitNo="DP-2023-0462" 
              type="Commercial Office" 
              applicant="Esi Nyarko"
              daysInQueue={5}
              priority="high"
            />
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Review Metrics</h2>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="h-64">
            {/* Chart placeholder */}
            <div className="flex items-center justify-center h-full bg-gray-100 rounded">
              <p className="text-gray-500">Review performance chart</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}