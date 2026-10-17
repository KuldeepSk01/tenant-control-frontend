
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const pageTitles = [
  { path: "/dashboard", title: "Dashboard" },
  { path: "/subscriptions", title: "Subscriptions" },
  { path: "/properties", title: "Properties" },
  { path: "/rooms", title: "Rooms" },
  { path: "/tenants", title: "Tenants" },
  { path: "/assignments", title: "Assignments" },
  { path: "/electricity/meters", title: "Electricity Meters" },
  { path: "/electricity/readings", title: "Meter Readings" },
  { path: "/electricity/bills", title: "Electricity Bills" },
  { path: "/profile", title: "My Profile" },
];

export default function Header({
  collapsed,
  onToggleSidebar,
  onOpenMobile,
}) {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const pageTitle =
    pageTitles
      .filter(
        (page) =>
          location.pathname === page.path ||
          location.pathname.startsWith(page.path + "/")
      )
      .sort((a, b) => b.path.length - a.path.length)[0]
      ?.title || "TenantControl";

  const initials = (user?.name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 sm:px-6">

      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open navigation"
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          className="hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <div>
          <p className="text-xs font-medium text-slate-400">
            Workspace
          </p>
          <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          title="Toggle theme"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <Link
          to="/profile"
          className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
            {initials}
          </div>

          <div className="hidden text-left sm:block">
            <p className="max-w-36 truncate text-sm font-semibold text-slate-900 dark:text-white">
              {user?.name || "User"}
            </p>
            <p className="max-w-36 truncate text-xs text-slate-500 dark:text-slate-400">
              {user?.role || "Account"}
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={logoutUser}
          title="Logout"
          aria-label="Logout"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
