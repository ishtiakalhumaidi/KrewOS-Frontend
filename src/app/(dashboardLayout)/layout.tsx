// src/app/(dashboardLayout)/layout.tsx
import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get the token directly on the server
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/login");
  }

  // 2. Decode the token to extract the role
  let userRole = "";
  try {
    const decoded = jwtDecode(token) as { role: string };
    userRole = decoded.role;
  } catch (error) {
    redirect("/login");
  }

return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <DashboardSidebar role={userRole} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <DashboardNavbar role={userRole} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}