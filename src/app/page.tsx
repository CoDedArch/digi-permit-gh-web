"use client";
import ApplicantDashboard from "./_component/ui/ApplicantDashboard";
import ReviewOfficerDashboard from "./_component/ui/ReviewOfficerDashboard";
import InspectionOfficerDashboard from "./_component/ui/InspectionOfficerDashboard";
import AdminDashboard from "./_component/ui/AdminDashboard";
import PublicHomepage from "./_component/ui/PublicHomePage";
import LoadingScreen from "./_component/LoadingScreen";
import { useAuth } from "./context/AuthContext";

type UserRole = "applicant" | "review_officer" | "inspection_officer" | "admin";

export default function HomePage() {
  const { user, authenticated, loading} = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!authenticated || !user) {
    return <PublicHomepage />;
  }

  // Determine user role - get the role from your user object
  const userRole = user.role; // Ensure user.role matches UserRole

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardLayout role={userRole}>
        {userRole === "applicant" && <ApplicantDashboard />}
        {userRole === "review_officer" && <ReviewOfficerDashboard />}
        {userRole === "inspection_officer" && <InspectionOfficerDashboard />}
        {userRole === "admin" && <AdminDashboard />}
      </DashboardLayout>
    </div>
  );
}

// Updated DashboardLayout to use custom logout
function DashboardLayout({ role, children }: { role: UserRole, children: React.ReactNode}) {
  const roleTitles = {
    applicant: "Your Dashboard",
    review_officer: "Review Officer Portal",
    inspection_officer: "Inspection Dashboard",
    admin: "Administrator Console"
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">{roleTitles[role]}</h1>
        </header>

        {/* Dashboard Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {children}
        </div>
      </main>
    </div>
  );
}