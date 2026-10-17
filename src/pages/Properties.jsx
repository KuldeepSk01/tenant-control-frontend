
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  Filter,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { getProperties } from "../api/propertyApi";
import ErrorMessage from "../components/ErrorMessage";

const PAGE_SIZE = 8;

const STATUS_STYLES = {
  ACTIVE:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 " +
    "dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",

  INACTIVE:
    "bg-red-50 text-red-700 ring-red-200 " +
    "dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PropertyStatus({ status }) {
  const normalizedStatus = String(status || "UNKNOWN").toUpperCase();

  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 " +
        "text-xs font-semibold ring-1 ring-inset " +
        (STATUS_STYLES[normalizedStatus] ||
          "bg-slate-100 text-slate-600 ring-slate-200 " +
          "dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700")
      }
    >
      <span
        className={
          "h-1.5 w-1.5 rounded-full " +
          (normalizedStatus === "ACTIVE"
            ? "bg-emerald-500"
            : normalizedStatus === "INACTIVE"
              ? "bg-red-500"
              : "bg-slate-400")
        }
      />

      {normalizedStatus}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",

    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",

    red:
      "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function Properties() {
  const location = useLocation();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  const [success, setSuccess] = useState(
    location.state?.message || ""
  );

  const loadProperties = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const response = await getProperties();

      const data = response?.data;

      // Existing API returns an array.
      // Also support a Spring pagination response.
      const propertyList = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : [];

      setProperties(propertyList);
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    if (!location.state?.message) return;

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.pathname, location.state, navigate]);

  const stats = useMemo(() => {
    const active = properties.filter(
      (property) =>
        String(property.status || "").toUpperCase() === "ACTIVE"
    ).length;

    const inactive = properties.filter(
      (property) =>
        String(property.status || "").toUpperCase() === "INACTIVE"
    ).length;

    return {
      total: properties.length,
      active,
      inactive,
    };
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return properties.filter((property) => {
      const status = String(property.status || "").toUpperCase();

      if (statusFilter !== "ALL" && status !== statusFilter) {
        return false;
      }

      if (!keyword) return true;

      return [
        property.name,
        property.address,
        property.city,
        property.state,
        property.pincode,
        property.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [properties, search, statusFilter]);

  const totalPages = Math.ceil(
    filteredProperties.length / PAGE_SIZE
  );

  const paginatedProperties = useMemo(() => {
    const start = page * PAGE_SIZE;

    return filteredProperties.slice(
      start,
      start + PAGE_SIZE
    );
  }, [filteredProperties, page]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 1) return [];

    const start = Math.max(0, page - 2);
    const end = Math.min(totalPages, start + 5);
    const adjustedStart = Math.max(0, end - 5);

    return Array.from(
      { length: end - adjustedStart },
      (_, index) => adjustedStart + index
    );
  }, [page, totalPages]);

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(0);
  }

  function handleStatusChange(event) {
    setStatusFilter(event.target.value);
    setPage(0);
  }

  const startItem =
    filteredProperties.length === 0
      ? 0
      : page * PAGE_SIZE + 1;

  const endItem = Math.min(
    (page + 1) * PAGE_SIZE,
    filteredProperties.length
  );

  return (
    <div className="min-h-full bg-[#f7f9fc] px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>Workspace</span>
              <span>/</span>

              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Properties
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Property Management
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage your properties, addresses and availability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadProperties(false)}
              disabled={loading || refreshing}
              title="Refresh properties"
              aria-label="Refresh properties"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <RefreshCw
                className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>

            <Link
              to="/properties/add"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 dark:shadow-none"
            >
              <Plus className="h-4 w-4" />
              Add Property
            </Link>
          </div>
        </div>

        <ErrorMessage error={error} />

        {/* SUCCESS NOTIFICATION */}
        {success && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />

            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss notification"
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STATISTICS */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Properties"
            value={stats.total}
            icon={Building2}
            color="indigo"
          />

          <StatCard
            title="Active Properties"
            value={stats.active}
            icon={CheckCircle2}
            color="emerald"
          />

          <StatCard
            title="Inactive Properties"
            value={stats.inactive}
            icon={CirclePause}
            color="red"
          />
        </div>

        {/* TABLE CARD */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* TOOLBAR */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                All Properties
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {filteredProperties.length} matching properties
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* SEARCH */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search properties..."
                  aria-label="Search properties"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10 sm:w-64"
                />
              </div>

              {/* STATUS FILTER */}
              <div className="relative">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  aria-label="Filter property status"
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10 sm:w-44"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE CONTENT */}
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : paginatedProperties.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
                <Building2 className="h-9 w-9" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No properties found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                {search || statusFilter !== "ALL"
                  ? "No properties match your current filters."
                  : "Create your first property to start managing rooms and tenants."}
              </p>

              {search || statusFilter !== "ALL" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                    setPage(0);
                  }}
                  className="mt-5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  to="/properties/add"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Property
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/70">
                  <tr className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th className="whitespace-nowrap px-6 py-4">Property</th>
                    <th className="whitespace-nowrap px-6 py-4">Address</th>
                    <th className="whitespace-nowrap px-6 py-4">City</th>
                    <th className="whitespace-nowrap px-6 py-4">State</th>
                    <th className="whitespace-nowrap px-6 py-4">PIN Code</th>
                    <th className="whitespace-nowrap px-6 py-4">Status</th>
                    <th className="whitespace-nowrap px-6 py-4">Created</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedProperties.map((property, index) => (
                    <tr
                      key={property.propertyId || property.id || index}
                      className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      {/* PROPERTY */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                            <Building2 className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {property.name || "Unnamed Property"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Property
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ADDRESS */}
                      <td className="max-w-64 px-6 py-4">
                        <div
                          title={property.address || ""}
                          className="flex items-center gap-2 text-slate-600 dark:text-slate-300"
                        >
                          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

                          <span className="truncate">
                            {property.address || "—"}
                          </span>
                        </div>
                      </td>

                      {/* CITY */}
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                        {property.city || "—"}
                      </td>

                      {/* STATE */}
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                        {property.state || "—"}
                      </td>

                      {/* PIN CODE */}
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                        {property.pincode || "—"}
                      </td>

                      {/* STATUS */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <PropertyStatus status={property.status} />
                      </td>

                      {/* CREATED */}
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500 dark:text-slate-400">
                        {formatDate(property.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TABLE FOOTER */}
          {!loading && (
            <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {startItem}–{endItem} of {filteredProperties.length} properties
              </span>

              <span>
                Total registered: {stats.total}
              </span>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {page + 1}
              </span>{" "}
              of {totalPages}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPage((previous) => Math.max(0, previous - 1))
                }
                disabled={page === 0}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {visiblePages.map((pageIndex) => (
                <button
                  key={pageIndex}
                  type="button"
                  onClick={() => setPage(pageIndex)}
                  aria-label={`Go to page ${pageIndex + 1}`}
                  aria-current={pageIndex === page ? "page" : undefined}
                  className={
                    "flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition " +
                    (pageIndex === page
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200")
                  }
                >
                  {pageIndex + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setPage((previous) =>
                    Math.min(totalPages - 1, previous + 1)
                  )
                }
                disabled={page >= totalPages - 1}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
