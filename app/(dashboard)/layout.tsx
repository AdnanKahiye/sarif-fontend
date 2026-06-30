"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

import { useAuth } from "@/context/AuthContext";
import { PermissionProvider } from "@/context/PermissionContext";
import { NavigationProvider } from "@/context/NavigationContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950" />
    );
  }

  const permissionUser = {
    id: user.userId || "",
    fullName: (user as any).fullName || "User",
    email: user.email,
    role: user.role,
    permissions: (user as any).permissions || [],
  };

  return (
    <PermissionProvider user={permissionUser}>
      <NavigationProvider>
        <DashboardInnerContent>
          {children}
        </DashboardInnerContent>
      </NavigationProvider>
    </PermissionProvider>
  );
}

function DashboardInnerContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");

    if (saved !== null) {
      setIsSidebarCollapsed(saved === "true");
    }
  }, []);

  const handleCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem(
      "sidebarCollapsed",
      String(collapsed)
    );
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Navbar
          isSidebarCollapsed={isSidebarCollapsed}
          onCollapse={handleCollapse}
          onOpenMobile={() => setIsMobileOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
