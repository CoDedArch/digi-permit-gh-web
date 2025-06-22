import StatCard from "../StatCard";
import QuickActionCard from "../QuickActionCard";
import InspectionCard from "../InspectionCard";
import { CalendarCheck, FileText, AlertCircle } from "lucide-react";

export default function InspectionOfficerDashboard() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Scheduled Today" 
          value="6" 
          icon={<CalendarCheck className="h-6 w-6 text-purple-600" />}
        />
        <StatCard 
          title="Pending Reports" 
          value="3" 
          icon={<FileText className="h-6 w-6 text-yellow-600" />}
        />
        <StatCard 
          title="Violations Found" 
          value="2" 
          icon={<AlertCircle className="h-6 w-6 text-red-600" />}
        />
      </div>

      <h2 className="text-xl font-semibold mb-4">Today&apos;s Inspection Schedule</h2>
      <div className="space-y-4">
        <InspectionCard 
          time="9:00 AM"
          permitNo="DP-2023-0456"
          address="123 Independence Ave, Accra"
          type="Residential Single"
          status="Scheduled"
        />
        <InspectionCard 
          time="11:30 AM"
          permitNo="DP-2023-0478"
          address="45 Kwame Nkrumah Circle, Kumasi"
          type="Commercial Retail"
          status="Scheduled"
        />
        <InspectionCard 
          time="2:00 PM"
          permitNo="DP-2023-0462"
          address="78 Osu Oxford St, Accra"
          type="High Rise"
          status="Confirmed"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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
