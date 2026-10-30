
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  CreditCard,
  DoorOpen,
  Users,
  ClipboardList,
  Zap,
  Gauge,
  BookOpen,
  Receipt,
  ChevronDown,
  ChevronRight,
  X,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
  },
  // {
  //   label: "Subscriptions",
  //   icon: CreditCard,
  //   to: "/subscriptions",
  // },
  {
    label: "Properties",
    icon: Building2,
    children: [
      { label: "All Properties", to: "/properties" },
      { label: "Add Property", to: "/properties/add" },
    ],
  },
  {
    label: "Rooms",
    icon: DoorOpen,
    children: [
      { label: "All Rooms", to: "/rooms" },
      { label: "Add Room", to: "/rooms/add" },
    ],
  },
  {
    label: "Tenants",
    icon: Users,
    children: [
      { label: "All Tenants", to: "/tenants" },
      { label: "Add Tenant", to: "/tenants/add" },
    ],
  },
  {
    label: "Assignments",
    icon: ClipboardList,
    to: "/assignments",
  },
  {
    label: "Electricity",
    icon: Zap,
    children: [
      { label: "Meters", to: "/electricity/meters" },
      { label: "Readings", to: "/electricity/readings" },
      { label: "Bills", to: "/electricity/bills" },
    ],
  },
];

export default function Sidebar({
  collapsed,
  mobileOpen,
  onClose,
  onExpand,
}) {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const [expandedMenus, setExpandedMenus] = useState({});

  const isActivePath = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  function isGroupActive(item) {
    return item.children?.some((child) =>
      isActivePath(child.to)
    );
  }

  function isExpanded(item) {
    return expandedMenus[item.label] ?? isGroupActive(item);
  }

  function toggleGroup(label) {
    if (collapsed) {
      onExpand?.();
    }

    setExpandedMenus((previous) => ({
      ...previous,
      [label]: !(previous[label] ?? isGroupActive(
        menuItems.find((item) => item.label === label)
      )),
    }));
  }

  function handleNavigate() {
    onClose?.();
  }

  const initials = (user?.name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label={t("Close navigation")}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-[#101d3d] text-white
          transition-all duration-300
          ${collapsed ? "lg:w-[84px]" : "lg:w-[260px]"}
          w-[260px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <NavLink
            to="/dashboard"
            onClick={handleNavigate}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-950/30">
              <Building2 className="h-6 w-6" />
            </div>

            {!collapsed && (
              <div className="hidden min-w-0 lg:block">
                <h1 className="truncate text-base font-bold">
                  TenantControl
                </h1>
                <p className="text-xs text-slate-400">
                  {t("Management Platform")}
                </p>
              </div>
            )}

            <div className="min-w-0 lg:hidden">
              <h1 className="text-base font-bold">
                TenantControl
              </h1>
              <p className="text-xs text-slate-400">
                {t("Management Platform")}
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("Close sidebar")}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label={t("Main navigation")}
          className="flex-1 space-y-1 overflow-y-auto px-3 py-6"
        >
          {(!collapsed || mobileOpen) && (
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {t("Workspace")}
            </p>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon;
            const groupActive = item.children
              ? isGroupActive(item)
              : isActivePath(item.to);

            if (item.children) {
              const expanded = isExpanded(item);

              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    title={collapsed ? t(item.label) : undefined}
                    aria-expanded={expanded}
                    className={`
                      flex w-full items-center gap-3
                      rounded-xl px-3 py-3 text-sm font-medium
                      transition-colors
                      ${
                        groupActive
                          ? "bg-indigo-500/20 text-white"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 shrink-0" />

                    {(!collapsed || mobileOpen) && (
                      <>
                        <span className="flex-1 text-left">
                          {t(item.label)}
                        </span>
                        {expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>

                  {expanded && (!collapsed || mobileOpen) && (
                    <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-4">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end
                          onClick={handleNavigate}
                          className={({ isActive }) =>
                            `block rounded-lg px-3 py-2.5 text-sm transition ${
                              isActive
                                ? "bg-indigo-500/20 font-semibold text-indigo-200"
                                : "text-slate-400 hover:bg-white/10 hover:text-white"
                            }`
                          }
                        >
                          {t(child.label)}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                title={collapsed ? t(item.label) : undefined}
                onClick={handleNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />

                {(!collapsed || mobileOpen) && (
                  <span>{t(item.label)}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User information */}
        <div className="border-t border-white/10 p-3">
          <NavLink
            to="/profile"
            onClick={handleNavigate}
            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/10"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-sm font-bold text-indigo-200">
              {initials}
            </div>

            {(!collapsed || mobileOpen) && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || t("User")}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {user?.email || t("Account")}
                </p>
              </div>
            )}
          </NavLink>
        </div>
      </aside>
    </>
  );
}
