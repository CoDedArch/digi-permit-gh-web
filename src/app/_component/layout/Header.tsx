"use client";

import { Bell, Mail, User, Search } from "lucide-react";
import DigiLogo from "../images/digi-logo";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

export default function AppHeader() {
  const { user, authenticated, loading } = useAuth();

  if (!authenticated || loading) return null;

  console.log("Role", user?.role);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 h-16 w-full">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left side - Logo and App Name */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-3">
            <DigiLogo />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Digi-Permit
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent uppercase tracking-wide">
                  🇬🇭 Republic of Ghana • Official Platform
                </span>
              </div>
            </div>
          </div>
          {/* Search bar - visible on larger screens */}
          <div className="hidden md:flex items-center ml-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search permits, applications..."
                className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right side - Navigation and User */}
        <div className="flex items-center space-x-4">
          {/* Notification and Messages */}
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              <Mail className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500"></span>
            </button>
          </div>

          {/* User Profile */}
          <Link
            href="/user-profile"
            className="flex items-center space-x-2 pl-2 border-l border-gray-200"
          >
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              {user?.role && (
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-600/80 text-white">
                  {user.role.split("_")[0]}
                </span>
              )}
            </div>
            {/* <div className="hidden md:block">
              <p className="text-sm font-medium">{user?.name || "Account"}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('_', ' ') || "User"}
              </p>
            </div> */}
          </Link>
        </div>
      </div>

      {/* Mobile search bar - hidden on larger screens */}
      <div className="md:hidden px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>
    </header>
  );
}
