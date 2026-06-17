"use client";

import {
  Search,
  Bell,
  Globe,
  ChevronDown,
  Menu,
  LogOut,
  User,
  Settings,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";

interface NavbarProps {
  isSidebarCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onOpenMobile: () => void;
}

type MenuKey = "lang" | "notif" | "profile" | null;

const LANGUAGES = [
  { code: "en", name: "English", label: "English", flag: "🇬🇧" },
  { code: "ar", name: "Arabic", label: "العربية", flag: "🇸🇦" },
  { code: "so", name: "Somali", label: "Soomaali", flag: "🇸🇴" },
];

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Codsi cusub oo la helay",
    detail: "Khadiija A. ayaa soo gudbisay codsi cusub.",
    time: "5 daqiiqo kahor",
    unread: true,
  },
  {
    id: 2,
    title: "Lacag-bixin la xaqiijiyay",
    detail: "Macaamil #4021 si guul leh ayaa loo socodsiiyay.",
    time: "1 saac kahor",
    unread: true,
  },
  {
    id: 3,
    title: "Update nidaamka",
    detail: "Nidaamku waa la cusboonaysiiyay v2.3.0.",
    time: "Shalay",
    unread: false,
  },
];

export default function Navbar({ isSidebarCollapsed, onCollapse, onOpenMobile }: NavbarProps) {
  const { user, logout } = useAuth();
  const [currentLang, setCurrentLang] = useState(LANGUAGES[0]);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  // Subtle elevation as the page scrolls, so the bar reads as "above" content
  // rather than a flat strip pinned to the top.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMenu = (key: MenuKey) => setOpenMenu((prev) => (prev === key ? null : key));

  return (
    <header
      className={`h-16 bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 border-b border-slate-200/80 transition-shadow duration-300 ${
        isScrolled ? "shadow-[0_4px_16px_-4px_rgba(15,23,42,0.10)]" : "shadow-none"
      }`}
    >
      {/* LEFT: TOGGLE & SEARCH */}
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
        <button
          onClick={onOpenMobile}
          aria-label="Furanta Menu-ga"
          className="lg:hidden p-2 -ml-1 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-600 transition-colors"
        >
          <Menu size={22} />
        </button>

        <button
          onClick={() => onCollapse(!isSidebarCollapsed)}
          aria-label="Toggle Sidebar"
          className="hidden lg:flex p-2 -ml-1 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-600 transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full max-w-md group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#1D4ED8] transition-colors" />
          <input
            type="text"
            placeholder="Raadi..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-14 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#1D4ED8]/15 focus:border-[#1D4ED8]/40 focus:bg-white outline-none transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* RIGHT: ACTIONS */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Language */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("lang")}
            className={`flex items-center gap-1.5 text-slate-600 text-sm hover:bg-slate-100 transition-colors font-medium px-2.5 py-2 rounded-lg ${
              openMenu === "lang" ? "bg-slate-100" : ""
            }`}
          >
            <Globe size={18} />
            <span className="hidden lg:inline">{currentLang.label}</span>
            <ChevronDown size={14} className={`opacity-50 transition-transform ${openMenu === "lang" ? "rotate-180" : ""}`} />
          </button>

          {openMenu === "lang" && (
            <DropdownPanel onClose={() => setOpenMenu(null)} align="right" width="w-44">
              <div className="px-3.5 py-2.5 border-b border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Luqadda</p>
              </div>
              <div className="py-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang);
                      setOpenMenu(null);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <span className="text-slate-700 font-medium">{lang.label}</span>
                    </span>
                    {currentLang.code === lang.code && <Check size={15} className="text-[#1D4ED8]" />}
                  </button>
                ))}
              </div>
            </DropdownPanel>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("notif")}
            aria-label="Ogeysiisyada"
            className={`p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative ${
              openMenu === "notif" ? "bg-slate-100" : ""
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-[#F59E0B] rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {openMenu === "notif" && (
            <DropdownPanel onClose={() => setOpenMenu(null)} align="right" width="w-80">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Ogeysiisyada</p>
                <span className="text-[11px] font-semibold text-[#1D4ED8] bg-[#1D4ED8]/10 px-2 py-0.5 rounded-full">
                  {unreadCount} cusub
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {NOTIFICATIONS.map((n) => (
                  <button
                    key={n.id}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                        n.unread ? "bg-[#1D4ED8]" : "bg-slate-200"
                      }`}
                    />
                    <span className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.detail}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                    </span>
                  </button>
                ))}
              </div>
              <button className="w-full text-center text-sm font-semibold text-[#1D4ED8] py-2.5 hover:bg-slate-50 transition-colors border-t border-slate-100">
                Arag dhammaan
              </button>
            </DropdownPanel>
          )}
        </div>

        {/* Profile */}
        <div className="relative ml-1">
          <button
            onClick={() => toggleMenu("profile")}
            className={`flex items-center gap-2 md:gap-3 pl-2 md:pl-3 ml-1 border-l border-slate-200 py-1.5 rounded-r-lg transition-colors hover:bg-slate-50 ${
              openMenu === "profile" ? "bg-slate-50" : ""
            }`}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                {user?.email?.split("@")[0] || "Admin"}
              </p>
              <span className="inline-block text-[10px] text-[#1D4ED8] font-extrabold uppercase tracking-wider bg-[#1D4ED8]/10 px-1.5 py-0.5 rounded">
                {user?.role || "Super Admin"}
              </span>
            </div>

            <div className="relative h-9 w-9 md:h-10 md:w-10 shrink-0">
              <div className="h-full w-full rounded-lg bg-gradient-to-br from-[#1D4ED8] to-[#1E3A8A] flex items-center justify-center text-white font-bold shadow-sm">
                {user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#10B981] border-2 border-white" />
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 hidden sm:block transition-transform duration-300 ${
                openMenu === "profile" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openMenu === "profile" && (
            <DropdownPanel onClose={() => setOpenMenu(null)} align="right" width="w-60">
              <div className="px-4 py-3.5 border-b border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium">Waxaad ku gashan tahay</p>
                <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">{user?.email}</p>
              </div>
              <div className="py-1.5">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <User size={16} />
                  <span>Profile-kayga</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Settings size={16} />
                  <span>Dejinta</span>
                </button>
              </div>
              <div className="h-px bg-slate-100" />
              <button
                onClick={() => logout?.()}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
              >
                <LogOut size={16} />
                <span>Ka bax</span>
              </button>
            </DropdownPanel>
          )}
        </div>
      </div>
    </header>
  );
}

/** Shared dropdown shell: consistent rounded panel, overlay-to-close, fade/zoom entrance. */
function DropdownPanel({
  children,
  onClose,
  align = "right",
  width = "w-56",
}: {
  children: React.ReactNode;
  onClose: () => void;
  align?: "left" | "right";
  width?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={ref}
        className={`absolute top-full mt-2 ${width} ${align === "right" ? "right-0" : "left-0"} bg-white border border-slate-200/70 rounded-xl shadow-xl shadow-slate-900/[0.08] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
      >
        {children}
      </div>
    </>
  );
}
