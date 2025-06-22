"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { ReactNode } from "react";
import AppHeader from "./Header";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideSidebarRoutes = ["/onboarding","/login"];
  const hideHeaderRoutes = ["/onboarding", "/login", ];
  const shouldShowSidebar = !hideSidebarRoutes.includes(pathname);
  const shouldShowHeader = !hideHeaderRoutes.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {" "}
      {/* Changed to flex-col */}
      {shouldShowHeader && <AppHeader />}
      {/* Main content area */}
      <div className="flex">
        {shouldShowSidebar && <Sidebar />}
        <main className="flex-1 bg-gray-900 w-full">
          {" "}
          {/* Added w-full */}
          <section className="h-full">{children}</section>
        </main>
      </div>
    </div>
  );
}
