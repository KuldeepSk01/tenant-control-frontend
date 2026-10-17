
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
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import { getTenants } from "../api/tenantApi";
import ErrorMessage from "../components/ErrorMessage";

const PAGE_SIZE = 5;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white " +
  "py-3 pl-11 pr-4 text-sm text-slate-900 outline-none " +
  "transition placeholder:text-slate-400 " +
  "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 " +
  "dark:border-slate-700 dark:bg-slate-800 dark:text-white " +
  "dark:placeholder:text-slate-500 " +
  "dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10";

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

function getTenantId(tenant) {
  return tenant.tenantId || tenant.publicId || tenant.id;
}

function getInitials(name) {
  return String(name || "T")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function TenantAvatar({ name }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
      {getInitials(name)}
    </div>
  );
}

function EmptyState({ hasSearch, onClear }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
        <Users className="h-9 w-9" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        {hasSearch ? "No matching tenants" : "No tenants found"}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        {hasSearch
          ? "No tenants on this page match your search. Try a different keyword or page."
          : "You haven't added any tenants yet. Create your first tenant to get started."}
      </p>

      {hasSearch ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
        >
          Clear Search
        </button>
      ) : (
        <Link
          to="/tenants/add"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Tenant
        </Link>
      )}
    </div>
  );
}

export default function Tenants() {
  const navigate = useNavigate();
  const location = useLocation();

  const [tenants, setTenants] = useState([]);
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");

  const [success, setSuccess] = useState(
    location.state?.message || ""
  );

  const loadTenants = useCallback(async (pageNumber, showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const response = await getTenants(pageNumber, PAGE_SIZE);
      const data = response?.data;

      setTenants(
        Array.isArray(data?.content) ? data.content : []
      );

      setPagination(data || null);
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchPage() {
      setLoading(true);
      setError(null);

      try {
        const response = await getTenants(page, PAGE_SIZE);

        if (cancelled) return;

        const data = response?.data;

        setTenants(
          Array.isArray(data?.content) ? data.content : []
        );

        setPagination(data || null);
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPage();

    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    if (!location.state?.message) return;

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.pathname, location.state, navigate]);

  const filteredTenants = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return tenants;

    return tenants.filter((tenant) =>
      [
        tenant.name,
        tenant.mobile,
        tenant.email,
        tenant.address,
        tenant.roomNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [tenants, search]);

  const totalPages = pagination?.totalPages ?? 0;
  const totalElements = pagination?.totalElements ?? 0;

  const currentPage = pagination?.page ?? page;

  const hasPrevious =
    pagination?.hasPrevious ?? currentPage > 0;

  const hasNext =
    pagination?.hasNext ?? currentPage < totalPages - 1;

  const startItem =
    totalElements === 0
      ? 0
      : currentPage * PAGE_SIZE + 1;

  const endItem = Math.min(
    (currentPage + 1) * PAGE_SIZE,
    totalElements
  );

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];

    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages, start + 5);
    const adjustedStart = Math.max(0, end - 5);

    return Array.from(
      { length: end - adjustedStart },
      (_, index) => adjustedStart + index
    );
  }, [currentPage, totalPages]);

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
                Tenants
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Tenant Management
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage tenant information, contact details and room assignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadTenants(page, false)}
              disabled={loading || refreshing}
              title="Refresh tenants"
              aria-label="Refresh tenants"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <RefreshCw
                className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>

            <Link
              to="/tenants/add"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 dark:shadow-none"
            >
              <Plus className="h-4 w-4" />
              Add Tenant
            </Link>
          </div>
        </div>

        <ErrorMessage error={error} />

        {/* SUCCESS MESSAGE */}
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

        {/* SUMMARY */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <Users className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Tenants
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {totalElements.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CalendarDays className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Current Page
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {totalPages > 0 ? currentPage + 1 : 0}
                  <span className="ml-2 text-sm font-medium text-slate-400">
                    / {totalPages}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* TABLE HEADER */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                All Tenants
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Search and manage tenant records
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search current page..."
                aria-label="Search tenants on current page"
                className={inputClass}
              />
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
          ) : filteredTenants.length === 0 ? (
            <EmptyState
              hasSearch={Boolean(search.trim())}
              onClear={() => setSearch("")}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/70">
                  <tr className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th className="whitespace-nowrap px-6 py-4">Tenant</th>
                    <th className="whitespace-nowrap px-6 py-4">Mobile</th>
                    <th className="whitespace-nowrap px-6 py-4">Email</th>
                    <th className="whitespace-nowrap px-6 py-4">Address</th>
                    <th className="whitespace-nowrap px-6 py-4">Room</th>
                    <th className="whitespace-nowrap px-6 py-4">Added On</th>
                    <th className="whitespace-nowrap px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTenants.map((tenant, index) => {
                    const tenantId = getTenantId(tenant);

                    return (
                      <tr
                        key={tenantId || index}
                        className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        {/* NAME */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <TenantAvatar name={tenant.name} />

                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {tenant.name || "Unknown Tenant"}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Tenant
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* MOBILE */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Phone className="h-4 w-4 text-slate-400" />
                            {tenant.mobile || "—"}
                          </span>
                        </td>

                        {/* EMAIL */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Mail className="h-4 w-4 text-slate-400" />
                            {tenant.email || "—"}
                          </span>
                        </td>

                        {/* ADDRESS */}
                        <td className="max-w-56 px-6 py-4">
                          <span
                            title={tenant.address || ""}
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-300"
                          >
                            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

                            <span className="truncate">
                              {tenant.address || "—"}
                            </span>
                          </span>
                        </td>

                        {/* ROOM */}
                        <td className="whitespace-nowrap px-6 py-4">
                          {tenant.roomNumber ? (
                            <span className="inline-flex rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                              Room {tenant.roomNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* CREATED */}
                        <td className="whitespace-nowrap px-6 py-4 text-slate-500 dark:text-slate-400">
                          {formatDate(tenant.createdAt)}
                        </td>

                        {/* ACTIONS */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {tenantId ? (
                              <>
                                <Link
                                  to={`/tenants/${tenantId}`}
                                  title="View tenant"
                                  aria-label={`View ${tenant.name || "tenant"}`}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </Link>

                                <Link
                                  to={`/tenants/${tenantId}/edit`}
                                  title="Edit tenant"
                                  aria-label={`Edit ${tenant.name || "tenant"}`}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </Link>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Unavailable
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TABLE FOOTER */}
          {!loading && (
            <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filteredTenants.length} tenant(s) on this page
              </span>

              <span>
                {totalElements > 0
                  ? `Records ${startItem}–${endItem} of ${totalElements}`
                  : "No records"}
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
                {currentPage + 1}
              </span>{" "}
              of {totalPages}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPage((previous) => Math.max(0, previous - 1))
                }
                disabled={!hasPrevious || loading}
                aria-label="Previous page"
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {visiblePageNumbers.map((pageIndex) => (
                <button
                  key={pageIndex}
                  type="button"
                  onClick={() => setPage(pageIndex)}
                  disabled={pageIndex === currentPage || loading}
                  aria-label={`Go to page ${pageIndex + 1}`}
                  aria-current={
                    pageIndex === currentPage ? "page" : undefined
                  }
                  className={
                    "flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition " +
                    (pageIndex === currentPage
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
                disabled={!hasNext || loading}
                aria-label="Next page"
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
