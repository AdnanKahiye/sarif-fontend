"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronDown, LayoutDashboard, X } from "lucide-react";
import { SetupService } from "@/lib/setup"; 
import { getIcon } from "@/utils/icon-mapper"; 
import { usePermission } from "@/context/PermissionContext";

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = usePermission();
  const [menuData, setMenuData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await SetupService.getMenus();
        if (response.data.success) {
          setMenuData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch menus:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  const toggleSection = (key: string | number) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed left-0 top-0 z-[60] h-screen bg-[#109489] text-white transition-all duration-300
        flex flex-col /* 1. ENSURE SIDEBAR IS A FLEX COLUMN */
        ${isCollapsed ? "lg:w-20" : "lg:w-64"} 
        ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* BRANDING LOGO AREA - FIXED (SHRINK-0) */}
        <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-6 justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed && !isMobileOpen ? "lg:mx-auto" : ""}`}>
            <div className="h-9 w-9 shrink-0 rounded-xl bg-white/20 flex items-center justify-center font-bold">T</div>
            {(!isCollapsed || isMobileOpen) && <span className="font-bold text-lg tracking-tight uppercase truncate">Sarif Panel</span>}
          </div>
          <button onClick={onCloseMobile} className="lg:hidden p-2 text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* 2. SCROLLABLE NAVIGATION AREA */}
        {/* flex-1 makes this section grow, overflow-y-auto enables the vertical scroll */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2 mt-4 custom-scrollbar">
          {/* STATIC DASHBOARD */}
          {hasPermission("CREATE.USER") && (
            <div className="space-y-1">
              <Link 
                href="/dashboard"
                onClick={onCloseMobile}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-white/10 ${
                  pathname === "/dashboard" ? "bg-white/20 text-white shadow-sm" : "text-blue-100/80"
                } ${isCollapsed && !isMobileOpen ? "lg:justify-center" : ""}`}
              >
                <LayoutDashboard size={20} className="shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span className="font-semibold text-sm">Dashboard</span>}
              </Link>
            </div>
          )}

          {/* DYNAMIC CONTENT AREA */}
          {loading ? (
             <SidebarSkeleton isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} />
          ) : (
            menuData.map((module) => (
              <div key={module.moduleId} className="space-y-1">
                {module.menus.map((menu: any) => {
                  if (menu.permission && !hasPermission(menu.permission)) return null;

                  const Icon = getIcon(menu.icon);
                  const hasChildren = menu.children && menu.children.length > 0;
                  const allowedChildren = menu.children?.filter((child: any) => 
                    !child.permission || hasPermission(child.permission)
                  ) || [];

                  const isOpen = openSections[menu.id];

                  return (
                    <div key={menu.id} className="space-y-1">
                      <button 
                        onClick={() => toggleSection(menu.id)} 
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 hover:bg-white/10 transition-all ${isCollapsed && !isMobileOpen ? "lg:justify-center" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} className="shrink-0" />
                          {(!isCollapsed || isMobileOpen) && <span className="font-semibold text-sm">{menu.title}</span>}
                        </div>
                        {(!isCollapsed || isMobileOpen) && hasChildren && allowedChildren.length > 0 && (
                          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`} />
                        )}
                      </button>

                      {(!isCollapsed || isMobileOpen) && isOpen && allowedChildren.length > 0 && (
                        <div className="ml-4 border-l border-white/10 pl-4 space-y-1 mt-1 animate-in slide-in-from-top-1 duration-200">
                          {allowedChildren.map((child: any) => (
                            <Link 
                              key={child.id} 
                              href={child.href} 
                              onClick={onCloseMobile}
                              className={`block py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                                pathname === child.href ? "bg-white text-blue-700 shadow-md" : "text-blue-100/60 hover:text-white"
                              }`}
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}

function SidebarSkeleton({ isCollapsed, isMobileOpen }: { isCollapsed: boolean, isMobileOpen?: boolean }) {
  return (
    <div className="space-y-4 px-3 mt-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="h-9 w-9 bg-white/10 rounded-xl" />
          {(!isCollapsed || isMobileOpen) && <div className="h-4 w-28 bg-white/10 rounded-md" />}
        </div>
      ))}
    </div>
  );
}