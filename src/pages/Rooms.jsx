
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
  DoorOpen,
  Filter,
  IndianRupee,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Wallet,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { getProperties } from "../api/propertyApi";
import { getRoomsByProperty } from "../api/roomApi";
import ErrorMessage from "../components/ErrorMessage";

const PAGE_SIZE = 8;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white " +
  "px-4 py-3 text-sm text-slate-900 outline-none transition " +
  "placeholder:text-slate-400 focus:border-indigo-500 " +
  "focus:ring-4 focus:ring-indigo-100 " +
  "dark:border-slate-700 dark:bg-slate-800 dark:text-white " +
  "dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10";

function extractArray(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;

  return [];
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getRoomStatus(room) {
  return String(room.status || "UNKNOWN").toUpperCase();
}

function isAvailable(room) {
  return ["AVAILABLE", "VACANT"].includes(getRoomStatus(room));
}

function RoomStatus({ status }) {
  const { t } = useTranslation();
  const normalized = String(status || "UNKNOWN").toUpperCase();

  const available = ["AVAILABLE", "VACANT"].includes(normalized);
  const occupied = normalized === "OCCUPIED";

  const colorClass = available
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
    : occupied
      ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
      : "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${colorClass}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          available
            ? "bg-emerald-500"
            : occupied
              ? "bg-amber-500"
              : "bg-slate-400"
        }`}
      />

      {t(normalized)}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${colors[color]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function Rooms() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [propertyFilter, setPropertyFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  const [success, setSuccess] = useState(
    location.state?.message || ""
  );

  const loadRooms = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const propertiesResponse = await getProperties();
      const propertyList = extractArray(propertiesResponse);

      const roomResponses = await Promise.all(
        propertyList.map((property) =>
          getRoomsByProperty(property.propertyId || property.id)
        )
      );

      const allRooms = roomResponses.flatMap((response, index) => {
        const property = propertyList[index];

        return extractArray(response).map((room) => ({
          ...room,
          propertyId:
            room.propertyId ||
            property.propertyId ||
            property.id,

          propertyName:
            room.propertyName ||
            property.name ||
            "Unknown Property",
        }));
      });

      setProperties(propertyList);
      setRooms(allRooms);
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (!location.state?.message) return;

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.pathname, location.state, navigate]);

  const stats = useMemo(() => {
    const available = rooms.filter(isAvailable).length;

    const occupied = rooms.filter(
      (room) => getRoomStatus(room) === "OCCUPIED"
    ).length;

    return {
      total: rooms.length,
      available,
      occupied,
    };
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const status = getRoomStatus(room);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "AVAILABLE" && isAvailable(room)) ||
        (statusFilter === "OCCUPIED" && status === "OCCUPIED");

      const matchesProperty =
        propertyFilter === "ALL" ||
        String(room.propertyId) === propertyFilter;

      const searchable = [
        room.roomNumber,
        room.propertyName,
        room.floor,
        room.roomType,
        room.status,
        room.rent,
        room.securityDeposit,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        matchesProperty &&
        (!keyword || searchable.includes(keyword))
      );
    });
  }, [rooms, search, statusFilter, propertyFilter]);

  const totalPages = Math.ceil(
    filteredRooms.length / PAGE_SIZE
  );

  const paginatedRooms = useMemo(() => {
    const start = page * PAGE_SIZE;

    return filteredRooms.slice(start, start + PAGE_SIZE);
  }, [filteredRooms, page]);

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

  function handlePropertyChange(event) {
    setPropertyFilter(event.target.value);
    setPage(0);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setPropertyFilter("ALL");
    setPage(0);
  }

  const startItem =
    filteredRooms.length === 0 ? 0 : page * PAGE_SIZE + 1;

  const endItem = Math.min(
    (page + 1) * PAGE_SIZE,
    filteredRooms.length
  );

  return (
    <div className="min-h-full bg-[#f7f9fc] px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>{t("Workspace")}</span>
              <span>/</span>

              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {t("Rooms")}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {t("Room Management")}
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t("Manage rooms, occupancy, rent and security deposits.")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadRooms(false)}
              disabled={loading || refreshing}
              title={t("Refresh rooms")}
              aria-label={t("Refresh rooms")}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <RefreshCw
                className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>

            <Link
              to="/rooms/add"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 dark:shadow-none"
            >
              <Plus className="h-4 w-4" />
              {t("Add Room")}
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
              aria-label={t("Dismiss notification")}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title={t("Total Rooms")}
            value={stats.total}
            icon={DoorOpen}
            color="indigo"
          />

          <StatCard
            title={t("Available Rooms")}
            value={stats.available}
            icon={CheckCircle2}
            color="emerald"
          />

          <StatCard
            title={t("Occupied Rooms")}
            value={stats.occupied}
            icon={Building2}
            color="amber"
          />
        </div>

        {/* ROOM TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* TOOLBAR */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("All Rooms")}
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {filteredRooms.length} {t("matching rooms")}
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
                  placeholder={t("Search rooms...")}
                  aria-label={t("Search rooms")}
                  className={`${inputClass} pl-11 sm:w-52`}
                />
              </div>

              {/* PROPERTY FILTER */}
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={propertyFilter}
                  onChange={handlePropertyChange}
                  aria-label={t("Filter by property")}
                  className={`${inputClass} pl-11 sm:w-48`}
                >
                  <option value="ALL">{t("All Properties")}</option>

                  {properties.map((property) => (
                    <option
                      key={property.propertyId || property.id}
                      value={property.propertyId || property.id}
                    >
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* STATUS FILTER */}
              <div className="relative">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  aria-label={t("Filter by status")}
                  className={`${inputClass} pl-11 sm:w-40`}
                >
                  <option value="ALL">{t("All Status")}</option>
                  <option value="AVAILABLE">{t("Available")}</option>
                  <option value="OCCUPIED">{t("Occupied")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : paginatedRooms.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
                <DoorOpen className="h-9 w-9" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("No rooms found")}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                {search ||
                statusFilter !== "ALL" ||
                propertyFilter !== "ALL"
                  ? t("No rooms match your current filters.")
                  : t("Add a room to one of your properties to get started.")}
              </p>

              {search ||
              statusFilter !== "ALL" ||
              propertyFilter !== "ALL" ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  {t("Clear Filters")}
                </button>
              ) : (
                <Link
                  to="/rooms/add"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  {t("Add Room")}
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/70">
                  <tr className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th className="whitespace-nowrap px-6 py-4">{t("Room")}</th>
                    <th className="whitespace-nowrap px-6 py-4">{t("Property")}</th>
                    <th className="whitespace-nowrap px-6 py-4">{t("Floor")}</th>
                    <th className="whitespace-nowrap px-6 py-4">{t("Type")}</th>
                    <th className="whitespace-nowrap px-6 py-4">{t("Rent")}</th>
                    <th className="whitespace-nowrap px-6 py-4">{t("Deposit")}</th>
                    <th className="whitespace-nowrap px-6 py-4">{t("Status")}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedRooms.map((room, index) => (
                    <tr
                      key={room.roomId || room.id || index}
                      className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      {/* ROOM */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                            <DoorOpen className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {t("Room")} {room.roomNumber || "—"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {t("Room Unit")}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PROPERTY */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          {room.propertyName === "Unknown Property"
                            ? t("Unknown Property")
                            : room.propertyName || "—"}
                        </div>
                      </td>

                      {/* FLOOR */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Layers className="h-4 w-4 text-slate-400" />
                          {room.floor ?? "—"}
                        </span>
                      </td>

                      {/* TYPE */}
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                        {room.roomType || "—"}
                      </td>

                      {/* RENT */}
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(room.rent)}
                      </td>

                      {/* DEPOSIT */}
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                        {formatCurrency(room.securityDeposit)}
                      </td>

                      {/* STATUS */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <RoomStatus status={room.status} />
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
                {t("Showing {{start}}–{{end}} of {{total}} rooms", {
                  start: startItem,
                  end: endItem,
                  total: filteredRooms.length,
                })}
              </span>

              <span>
                {t("Total registered: {{total}}", { total: stats.total })}
              </span>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("Page {{page}} of {{totalPages}}", {
                page: page + 1,
                totalPages,
              })}
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
                {t("Previous")}
              </button>

              {visiblePages.map((pageIndex) => (
                <button
                  key={pageIndex}
                  type="button"
                  onClick={() => setPage(pageIndex)}
                  aria-label={t("Go to page {{page}}", { page: pageIndex + 1 })}
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
                {t("Next")}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
