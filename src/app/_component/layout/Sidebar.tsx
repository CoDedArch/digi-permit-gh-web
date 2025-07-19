// app/_component/layout/Sidebar.tsx
"use client";

import MyApplicationsIcon from "../images/my-application-icon";
import NewApplicationIcon from "../images/new-application";
import ReviewQueueIcon from "../images/review-queue-icon";
import InspectionsIcon from "../images/inspection-schedule-icon";
import ExceptionsIcon from "../images/exceptions-icon";
import DashboardIcon from "../images/dashboard-icon";
import SettingsIcon from "../images/settings-icon";
import UserManagementIcon from "../images/user-management-icon";
import AnalyticsIcon from "../images/analytic-icon";
import SiteVisitsIcon from "../images/site-visit-icon";
import MetricsIcon from "../images/metric-icon";
import ViolationsIcon from "../images/violations-icon";
import InfoIcon from "../images/info-icon";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const { user, authenticated, loading, logout } = useAuth();

  if (!authenticated || loading) return null;

  return (
    <aside
      className={`
  md:w-64 
  bg-white 
  text-gray-800 
  border-r 
  border-gray-100 
  flex 
  flex-col 
  justify-between 
  py-6 
  pl-4
  shadow-sm
  backdrop-blur-sm
  bg-opacity-95
`}
    >
      <nav className="flex flex-col gap-4 flex-1 w-full mt-10 pl-10">
        <Link href={"/"}>
          <DashboardIcon />
        </Link>

        {authenticated && (
          <>
            {user?.is_active ? (
              <>
                <Link href={"/my-applications"}>
                  <MyApplicationsIcon />
                </Link>
                <Link
                  href={"/new-application"}
                  className="flex items-center space-x-2"
                >
                  <NewApplicationIcon />
                </Link>
                <Link href={"/schedule-inspection"}>
                  <InspectionsIcon />
                </Link>

                {user?.role === "review_officer" && (
                  <>
                    <Link href={"/review/review-queue"}>
                      <ReviewQueueIcon />
                    </Link>
                    <Link href={"/exceptions"}>
                      <ExceptionsIcon />
                    </Link>
                    <Link href={"/metrics"}>
                      <MetricsIcon />
                    </Link>
                  </>
                )}

                {user?.role === "inspection_officer" && (
                  <>
                    <SiteVisitsIcon />
                    <ViolationsIcon />
                  </>
                )}

                {user?.role === "admin" && (
                  <>
                    <UserManagementIcon />
                    <AnalyticsIcon />
                  </>
                )}

                <SettingsIcon />
              </>
            ) : (
              <>
                <div className="opacity-40 cursor-not-allowed">
                  <MyApplicationsIcon />
                </div>
                <div className="opacity-40 cursor-not-allowed">
                  <NewApplicationIcon />
                </div>
                <div className="opacity-40 cursor-not-allowed">
                  <InspectionsIcon />
                </div>

                {user?.role === "review_officer" && (
                  <>
                    <div className="opacity-40 cursor-not-allowed">
                      <ReviewQueueIcon />
                    </div>
                    <div className="opacity-40 cursor-not-allowed">
                      <ExceptionsIcon />
                    </div>
                    <div className="opacity-40 cursor-not-allowed">
                      <MetricsIcon />
                    </div>
                  </>
                )}

                {user?.role === "inspection_officer" && (
                  <>
                    <div className="opacity-40 cursor-not-allowed">
                      <SiteVisitsIcon />
                    </div>
                    <div className="opacity-40 cursor-not-allowed">
                      <ViolationsIcon />
                    </div>
                  </>
                )}

                {user?.role === "admin" && (
                  <>
                    <div className="opacity-40 cursor-not-allowed">
                      <UserManagementIcon />
                    </div>
                    <div className="opacity-40 cursor-not-allowed">
                      <AnalyticsIcon />
                    </div>
                  </>
                )}

                <div className="opacity-40 cursor-not-allowed">
                  <SettingsIcon />
                </div>
              </>
            )}
          </>
        )}
      </nav>

      <div className="flex flex-col gap-8 mb-8 ">
        <InfoIcon />
        {authenticated && (
          <div className="mt-auto pt-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="flex items-center space-x-2 w-full p-2 rounded hover:bg-slate-300/10 transition-all text-red-400"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
