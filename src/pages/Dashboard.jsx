
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Building2,
  DoorOpen,
  DoorClosed,
  Users,
  UserCheck,
  ClipboardCheck,
  House,
  Zap,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  LayoutDashboard,
  Activity,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getDashboardStats } from "../api/dashboardApi";

import ErrorMessage from "../components/ErrorMessage";

// Existing Spring Boot dashboard response fields.
const STAT_CARDS = [
  {
    key: "totalProperties",
    label: "Total Properties",
    icon: Building2,
    color: "indigo",
    description: "Properties in your workspace",
  },
  {
    key: "totalRooms",
    label: "Total Rooms",
    icon: DoorOpen,
    color: "sky",
    description: "Rooms across properties",
  },
  {
    key: "availableRooms",
    label: "Available Rooms",
    icon: House,
    color: "emerald",
    description: "Ready for occupancy",
  },
  {
    key: "occupiedRooms",
    label: "Occupied Rooms",
    icon: DoorClosed,
    color: "amber",
    description: "Currently occupied",
  },
  {
    key: "totalTenants",
    label: "Total Tenants",
    icon: Users,
    color: "violet",
    description: "Registered tenant records",
  },
  {
    key: "activeTenants",
    label: "Active Tenants",
    icon: UserCheck,
    color: "teal",
    description: "Currently active tenants",
  },
  {
    key: "completedTenancies",
    label: "Completed Tenancies",
    icon: ClipboardCheck,
    color: "slate",
    description: "Completed assignments",
  },
];

const MODULES = [
  {
    title: "Properties",
    description:
      "Organize properties, addresses, and building details.",
    to: "/properties",
    action: "Manage properties",
    icon: Building2,
    color: "indigo",
  },
  {
    title: "Rooms",
    description:
      "Manage room information, rental details, and occupancy.",
    to: "/rooms",
    action: "Manage rooms",
    icon: DoorOpen,
    color: "sky",
  },
  {
    title: "Tenants",
    description:
      "Manage tenant profiles, records, and room assignments.",
    to: "/tenants",
    action: "Manage tenants",
    icon: Users,
    color: "violet",
  },
  {
    title: "Electricity",
    description:
      "Manage meters, monthly readings, and electricity bills.",
    to: "/electricity/meters",
    action: "Manage electricity",
    icon: Zap,
    color: "amber",
  },
];

const COLORS = {
  indigo: {
    icon: "bg-indigo-50 text-indigo-600",
    hover: "group-hover:bg-indigo-600",
  },
  sky: {
    icon: "bg-sky-50 text-sky-600",
    hover: "group-hover:bg-sky-600",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    hover: "group-hover:bg-emerald-600",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    hover: "group-hover:bg-amber-600",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600",
    hover: "group-hover:bg-violet-600",
  },
  teal: {
    icon: "bg-teal-50 text-teal-600",
    hover: "group-hover:bg-teal-600",
  },
  slate: {
    icon: "bg-slate-100 text-slate-600",
    hover: "group-hover:bg-slate-700",
  },
};

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("en-IN");
}

function getNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async (signal) => {
    try {
      const response = await getDashboardStats();

      if (signal?.aborted) return;

      // Assumes getDashboardStats returns the statistics object.
      setStats(response);
      setError(null);
    } catch (err) {
      if (!signal?.aborted) {
        setError(err);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadStats(controller.signal);

    return () => controller.abort();
  }, [loadStats]);

  async function handleRefresh() {
    if (refreshing || loading) return;

    setRefreshing(true);
    await loadStats();
  }

  const occupancy = useMemo(() => {
    const total = getNumber(stats?.totalRooms);
    const occupied = getNumber(stats?.occupiedRooms);
    const available = getNumber(stats?.availableRooms);

    return {
      total,
      occupied,
      available,
      percentage:
        total > 0
          ? Math.min(100, Math.round((occupied / total) * 100))
          : 0,
    };
  }, [stats]);

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "there";

  const currentDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc]">

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
              <LayoutDashboard className="h-4 w-4" />
              Workspace Overview
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Welcome back,{" "}
              <span className="font-semibold text-slate-800">
                {firstName}
              </span>
              . Here's your property management overview.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {currentDate}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            {refreshing ? "Refreshing..." : "Refresh data"}
          </button>
        </div>

        <ErrorMessage error={error} />

        {/* WELCOME BANNER */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-[#101d3d] p-6 shadow-lg shadow-slate-200 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute right-12 bottom-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-medium text-indigo-200">
                <Activity className="h-3.5 w-3.5" />
                Property Management
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Your workspace, all in one place.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                Stay organized with a clear view of your properties,
                rooms, tenants, and electricity operations.
              </p>
            </div>

            <Link
              to="/properties"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-indigo-50"
            >
              View properties
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* STATISTICS HEADER */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Overview Statistics
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Key metrics from your property management system.
            </p>
          </div>
          <ChartNoAxesColumnIncreasing className="hidden h-5 w-5 text-slate-400 sm:block" />
        </div>

        {/* STAT CARDS */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-2xl border border-slate-100 bg-white p-5"
              >
                <div className="h-11 w-11 rounded-xl bg-slate-100" />
                <div className="mt-5 h-7 w-20 rounded bg-slate-100" />
                <div className="mt-3 h-4 w-32 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STAT_CARDS.map((card) => (
              <StatCard
                key={card.key}
                card={card}
                value={stats[card.key]}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Dashboard statistics are currently unavailable.
            <button
              type="button"
              onClick={handleRefresh}
              className="ml-2 font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* OCCUPANCY */}
        {stats && !loading && (
          <section className="mt-8">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Room Occupancy
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Current distribution of occupied and available rooms.
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-indigo-600">
                    {occupancy.percentage}%
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    occupied
                  </span>
                </div>
              </div>

              <div
                className="mt-7 h-3 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Room occupancy"
                aria-valuenow={occupancy.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-500"
                  style={{
                    width: `${occupancy.percentage}%`,
                  }}
                />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <OccupancyDetail
                  label="Total Rooms"
                  value={occupancy.total}
                  dot="bg-slate-400"
                />
                <OccupancyDetail
                  label="Occupied"
                  value={occupancy.occupied}
                  dot="bg-indigo-500"
                />
                <OccupancyDetail
                  label="Available"
                  value={occupancy.available}
                  dot="bg-emerald-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* MANAGEMENT MODULES */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Management Center
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Quick access to your management tools.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {MODULES.map((module) => (
              <ModuleCard key={module.title} module={module} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

function StatCard({ card, value }) {
  const Icon = card.icon;
  const color = COLORS[card.color];

  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-100/40">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${color.icon}`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <Activity className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-400" />
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
        {formatNumber(value)}
      </p>

      <h3 className="mt-2 text-sm font-semibold text-slate-700">
        {card.label}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        {card.description}
      </p>
    </div>
  );
}

function OccupancyDetail({ label, value, dot }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <span className="text-xs font-medium text-slate-500">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function ModuleCard({ module }) {
  const Icon = module.icon;
  const color = COLORS[module.color];

  return (
    <Link
      to={module.to}
      className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/40"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${color.icon} ${color.hover} group-hover:text-white`}
      >
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-900">
        {module.title}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
        {module.description}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-semibold text-indigo-600">
          {module.action}
        </span>

        <ArrowRight className="h-4 w-4 text-indigo-600 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}










