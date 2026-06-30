"use client";

import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
  ArrowRight,
  X,
  Clock,
  Activity,
  Shield,
  HelpCircle,
  CheckCheck,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { useNavigation } from "@/context/NavigationContext";
import HelpSupportModal from "@/components/ui/Model/HelpSupportModal";
import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavbarProps {
  isSidebarCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onOpenMobile: () => void;
  /** Current page title shown in the header. E.g. "Dashboard", "Exchange Rate". */
  pageTitle?: string;
}

type MenuKey = "notif" | "profile" | "search" | null;

interface Notification {
  id: number;
  title: string;
  detail: string;
  time: string;
  group: "today" | "yesterday" | "earlier";
  unread: boolean;
  icon: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "New application received",
    detail: "Khadiija A. submitted a new application.",
    time: "5 minutes ago",
    group: "today",
    unread: true,
    icon: "📋",
  },
  {
    id: 2,
    title: "Payment confirmed",
    detail: "Client #4021 transaction processed successfully.",
    time: "1 hour ago",
    group: "today",
    unread: true,
    icon: "💳",
  },
  {
    id: 3,
    title: "System update",
    detail: "The system has been updated to v2.3.0.",
    time: "Yesterday at 4:30 PM",
    group: "yesterday",
    unread: false,
    icon: "🔧",
  },
  {
    id: 4,
    title: "New user registered",
    detail: "Ahmed M. created an account and awaits verification.",
    time: "2 days ago",
    group: "earlier",
    unread: false,
    icon: "👤",
  },
];

const RECENT_SEARCHES = [
  "Exchange Rate",
  "Transaction #4021",
  "Khadiija Ahmed",
  "Finance Report",
];

// ─── Utility hook ─────────────────────────────────────────────────────────────

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

// ─── IconBtn ──────────────────────────────────────────────────────────────────

/** Uniform icon button used throughout the navbar. */
function IconBtn({
  onClick,
  label,
  active = false,
  badge,
  className = "",
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  badge?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={active}
      className={[
        "relative flex items-center justify-center h-9 w-9 rounded-lg",
        "text-slate-500 dark:text-slate-400",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        "active:scale-95 transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        active ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
      {badge != null && badge > 0 && (
        <span
          aria-label={`${badge} unread notifications`}
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
            flex items-center justify-center select-none
            text-[10px] font-bold text-white bg-amber-500 rounded-full
            border-2 border-white dark:border-slate-900"
        >
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

// ─── DropdownPanel ────────────────────────────────────────────────────────────

/** Shared dropdown shell: consistent rounded panel, escape-key + click-outside support. */
function DropdownPanel({
  children,
  onClose,
  align = "right",
  width = "w-56",
  className = "",
}: {
  children: React.ReactNode;
  onClose: () => void;
  align?: "left" | "right";
  width?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useClickOutside(ref as React.RefObject<HTMLElement>, onClose);

  return (
    <>
      <div className="fixed inset-0 z-40" aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={[
          "absolute top-full mt-2 z-50 overflow-hidden",
          width,
          align === "right" ? "right-0" : "left-0",
          "bg-white dark:bg-slate-900",
          "border border-slate-200/80 dark:border-slate-700/60",
          "rounded-xl shadow-xl shadow-slate-900/10 dark:shadow-slate-950/40",
          "animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </>
  );
}

// ─── SearchBox ────────────────────────────────────────────────────────────────

function SearchBox({
  isOpen,
  onOpen,
  onClose,
  menus,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  menus: any[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : onOpen();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onOpen, onClose]);

  // Auto-focus input when opened; clear query when closed
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    setQuery("");
  }, [isOpen]);

  const pages = menus.flatMap((module) =>
    module.menus.flatMap((menu: any) => [
      {
        label: menu.title,
        href: menu.href,
      },
      ...(menu.children || []).map((child: any) => ({
        label: child.title,
        href: child.href,
      })),
    ])
  );

  const filteredNav = pages.filter((page) =>
    page.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Trigger button — ≥sm breakpoint */}
      <button
        type="button"
        onClick={onOpen}
        aria-label="Global search (⌘K)"
        className={[
          "hidden sm:flex items-center gap-2.5 h-9 rounded-lg px-3",
          "bg-slate-50 dark:bg-slate-800/60",
          "border border-slate-200 dark:border-slate-700",
          "text-sm text-slate-400 dark:text-slate-500",
          "hover:border-slate-300 dark:hover:border-slate-600",
          "hover:bg-white dark:hover:bg-slate-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
          "transition-all duration-150",
          isOpen ? "hidden" : "w-56 xl:w-64",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Search size={15} className="shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left truncate">Search…</span>
        <kbd
          className="hidden md:inline-flex items-center text-[10px] font-semibold font-mono
            text-slate-400 bg-slate-100 dark:bg-slate-700
            border border-slate-200 dark:border-slate-600
            rounded px-1.5 py-0.5"
        >
          ⌘K
        </kbd>
      </button>

      {/* Full-screen search overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/20 dark:bg-slate-950/50
              backdrop-blur-sm animate-in fade-in duration-150"
            aria-hidden="true"
            onClick={onClose}
          />
          <div
            className="fixed top-4 left-1/2 -translate-x-1/2
              w-full max-w-lg px-4 z-50
              animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden
                border border-slate-200/80 dark:border-slate-700/60
                shadow-2xl shadow-slate-900/20"
            >
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <Search
                  size={16}
                  className="text-blue-600 dark:text-blue-400 shrink-0"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages, users, transactions…"
                  aria-label="Search"
                  className="flex-1 text-sm text-slate-800 dark:text-slate-100 bg-transparent
                    placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600
                    dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800
                    transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto overscroll-contain">
                {query.length === 0 ? (
                  <>
                    <SectionLabel>Recent searches</SectionLabel>
                    {RECENT_SEARCHES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                          text-slate-600 dark:text-slate-300
                          hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Clock size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
                        {s}
                        <ArrowRight size={13} className="ml-auto text-slate-300" aria-hidden="true" />
                      </button>
                    ))}
                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1">
                      <SectionLabel>Jump to</SectionLabel>
                    </div>
                    {pages.map((n) => (
                      <a
                        key={n.href}
                        href={n.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm
                          text-slate-600 dark:text-slate-300
                          hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Zap size={14} className="text-blue-400 shrink-0" aria-hidden="true" />
                        {n.label}
                        <ArrowRight size={13} className="ml-auto text-slate-300" aria-hidden="true" />
                      </a>
                    ))}
                  </>
                ) : filteredNav.length > 0 ? (
                  <>
                    <SectionLabel>Results</SectionLabel>
                    {filteredNav.map((n) => (
                      <a
                        key={n.href}
                        href={n.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm
                          text-slate-600 dark:text-slate-300
                          hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Search size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
                        {n.label}
                        <ArrowRight size={13} className="ml-auto text-slate-300" aria-hidden="true" />
                      </a>
                    ))}
                  </>
                ) : (
                  <div className="py-10 text-center px-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No results for{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        "{query}"
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Try a different term.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
                <KbdHint keys={["↵"]} label="select" />
                <KbdHint keys={["Esc"]} label="close" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── NotificationBell ─────────────────────────────────────────────────────────

function NotificationBell({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const markOneRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );

  const groups: Array<{ key: Notification["group"]; label: string }> = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "earlier", label: "Earlier" },
  ];

  return (
    <div className="relative">
      <IconBtn
        onClick={onToggle}
        label="Notifications"
        active={isOpen}
        badge={unreadCount}
      >
        <Bell size={18} />
      </IconBtn>

      {isOpen && (
        <DropdownPanel onClose={onToggle} align="right" width="w-[340px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Notifications
              </p>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400
                  bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1 text-[12px] font-medium text-blue-600
                  dark:text-blue-400 hover:text-blue-700 transition-colors"
              >
                <CheckCheck size={13} aria-hidden="true" />
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="py-12 text-center px-4">
                <Bell
                  size={28}
                  className="mx-auto text-slate-200 dark:text-slate-700 mb-3"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  You're all caught up
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  No new notifications.
                </p>
              </div>
            ) : (
              groups.map(({ key, label }) => {
                const items = notifications.filter((n) => n.group === key);
                if (!items.length) return null;
                return (
                  <div key={key}>
                    <SectionLabel>{label}</SectionLabel>
                    {items.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => markOneRead(n.id)}
                        className={[
                          "w-full flex items-start gap-3 px-4 py-3 text-left",
                          "hover:bg-slate-50 dark:hover:bg-slate-800/60",
                          "active:bg-slate-100 dark:active:bg-slate-800",
                          "transition-colors duration-100",
                          n.unread ? "bg-blue-50/40 dark:bg-blue-900/10" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {/* Icon badge */}
                        <span className="mt-0.5 h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800
                          flex items-center justify-center text-base shrink-0 leading-none">
                          {n.icon}
                        </span>

                        {/* Content */}
                        <span className="flex-1 min-w-0">
                          <span className="flex items-start justify-between gap-2">
                            <p
                              className={[
                                "text-sm leading-snug truncate",
                                n.unread
                                  ? "font-semibold text-slate-900 dark:text-slate-100"
                                  : "font-medium text-slate-700 dark:text-slate-300",
                              ].join(" ")}
                            >
                              {n.title}
                            </p>
                            {n.unread && (
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                            )}
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {n.detail}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                            {n.time}
                          </p>
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 dark:border-slate-800">
            <a
              href="/notifications"
              className="flex items-center justify-center gap-1.5 py-3
                text-sm font-medium text-blue-600 dark:text-blue-400
                hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              View all notifications
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </DropdownPanel>
      )}
    </div>
  );
}

// ─── ProfileMenu ──────────────────────────────────────────────────────────────

function ProfileMenu({
  user,
  logout,
  isOpen,
  onToggle,
  onOpenHelp,
}: {
  user: { email?: string; role?: string } | null;
  logout: (() => void) | undefined;
  isOpen: boolean;
  onToggle: () => void;
  onOpenHelp: () => void;
}) {
  const displayName = user?.email?.split("@")[0] || "Admin";
  const initial = user?.email?.[0]?.toUpperCase() || "A";

  const menuItems = [
    { icon: User, label: "My Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: Shield, label: "Security", href: "/security" },
  ];

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={onToggle}
        aria-label="Open profile menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={[
          "flex items-center gap-2.5 h-9 pl-3 pr-2 ml-1",
          "border-l border-slate-200 dark:border-slate-700",
          "rounded-r-lg transition-all duration-150 active:scale-[0.98]",
          "hover:bg-slate-50 dark:hover:bg-slate-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
          isOpen ? "bg-slate-50 dark:bg-slate-800" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Name + role — desktop only */}
        <div className="hidden md:flex flex-col items-end leading-none gap-1">
          <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[128px]">
            {displayName}
          </p>
          <span className="text-[10px] font-bold uppercase tracking-wider
            text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30
            px-1.5 py-0.5 rounded-md">
            {user?.role || "Super Admin"}
          </span>
        </div>

        {/* Avatar */}
        <div className="relative h-8 w-8 shrink-0">
          <div className="h-full w-full rounded-lg bg-gradient-to-br from-blue-600 to-blue-800
            flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {initial}
          </div>
          {/* Online dot */}
          <span
            aria-label="Online"
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full
              bg-emerald-500 border-2 border-white dark:border-slate-900"
          />
        </div>

        <ChevronDown
          size={13}
          className={`hidden sm:block text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <DropdownPanel onClose={onToggle} align="right" width="w-60">
          {/* Identity */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800
              flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Menu items */}
          <nav aria-label="Profile menu" className="py-1.5">
            {menuItems.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-3 px-4 py-2.5 text-sm
                  text-slate-600 dark:text-slate-300
                  hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Icon size={15} className="text-slate-400 dark:text-slate-500 shrink-0" aria-hidden="true" />
                {label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => {
              onToggle();
              onOpenHelp();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
    text-slate-600 dark:text-slate-300
    hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <HelpCircle
              size={15}
              className="text-slate-400 dark:text-slate-500"
            />
            Help & Support
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Sign out */}
          <button
            type="button"
            onClick={() => { logout?.(); onToggle(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium
              text-red-600 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </button>
        </DropdownPanel>
      )}
    </div>
  );
}

// ─── DarkModeToggle ───────────────────────────────────────────────────────────

function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // SSR/client mismatch ka hortag: theme-ka la xaqiijin karo kaliya client-ka
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <IconBtn
      onClick={() => setTheme(isDark ? "light" : "dark")}
      label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Hydration mismatch ka hortag: mounted ka hor placeholder icon */}
      {mounted ? (
        isDark ? <Sun size={17} /> : <Moon size={17} />
      ) : (
        <Moon size={17} />
      )}
    </IconBtn>
  );
}

// ─── Small primitives ─────────────────────────────────────────────────────────

/** Subtle section label used inside dropdown panels. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider
      text-slate-400 dark:text-slate-500">
      {children}
    </p>
  );
}

/** Small keyboard hint row at the bottom of the search panel. */
function KbdHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
      {keys.map((k) => (
        <kbd
          key={k}
          className="font-mono text-[10px] bg-slate-50 dark:bg-slate-800
            border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5"
        >
          {k}
        </kbd>
      ))}
      {label}
    </span>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar({
  isSidebarCollapsed,
  onCollapse,
  onOpenMobile,
}: NavbarProps) {
  const { currentPage, menus } = useNavigation();
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [openHelpModal, setOpenHelpModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMenu = useCallback(
    (key: MenuKey) => setOpenMenu((prev) => (prev === key ? null : key)),
    []
  );

  const closeMenu = useCallback(() => setOpenMenu(null), []);

  return (
    <header
      role="banner"
      className={[
        "h-16 sticky top-0 z-30",
        "flex items-center justify-between px-4 md:px-6",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md",
        "border-b border-slate-200/80 dark:border-slate-700/60",
        "transition-shadow duration-300",
        isScrolled
          ? "shadow-[0_1px_16px_-2px_rgba(15,23,42,0.10)] dark:shadow-[0_1px_16px_-2px_rgba(0,0,0,0.40)]"
          : "shadow-none",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ── LEFT ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Mobile sidebar trigger */}
        <IconBtn
          onClick={onOpenMobile}
          label="Open sidebar"
          className="lg:hidden"
        >
          <Menu size={20} />
        </IconBtn>

        {/* Desktop sidebar collapse */}
        <IconBtn
          onClick={() => onCollapse(!isSidebarCollapsed)}
          label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex"
        >
          <Menu size={18} />
        </IconBtn>

        {/* Divider */}
        <span
          className="hidden lg:block h-5 w-px bg-slate-200 dark:bg-slate-700"
          aria-hidden="true"
        />

        {/* Page title */}
        <h1 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 truncate">
          {currentPage?.title ?? "Dashboard"}
        </h1>

        {/* Search trigger — left-aligned on desktop */}
        <div className="hidden sm:block ml-2">
          <SearchBox
            isOpen={openMenu === "search"}
            onOpen={() => setOpenMenu("search")}
            onClose={closeMenu}
            menus={menus}
          />
        </div>
      </div>

      {/* ── RIGHT ────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5">
        {/* Mobile search icon */}
        <IconBtn
          onClick={() => toggleMenu("search")}
          label="Search"
          active={openMenu === "search"}
          className="sm:hidden"
        >
          <Search size={18} />
        </IconBtn>

        {/* Dark mode */}
        <DarkModeToggle />

        {/* Notifications */}
        <NotificationBell
          isOpen={openMenu === "notif"}
          onToggle={() => toggleMenu("notif")}
        />

        {/* Profile */}
        <ProfileMenu
          user={user}
          logout={logout}
          isOpen={openMenu === "profile"}
          onToggle={() => toggleMenu("profile")}
          onOpenHelp={() => setOpenHelpModal(true)}
        />
      </div>

      <HelpSupportModal
        isOpen={openHelpModal}
        onClose={() => setOpenHelpModal(false)}
      />
    </header>
  );
}
