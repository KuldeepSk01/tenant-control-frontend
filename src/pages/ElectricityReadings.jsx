
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  Gauge,
  Hash,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

import {
  createElectricityReading,
  deleteElectricityReading,
  getElectricityMeters,
  getElectricityReadings,
} from "../api/electricityApi";

import ErrorMessage from "../components/ErrorMessage";

const PAGE_SIZE = 8;

const initialForm = {
  meterId: "",
  currentReading: "",
  readingMonth: "",
};

const initialFilters = {
  meterNumber: "",
  roomNumber: "",
  readingMonth: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 " +
  "px-4 py-3 text-sm text-slate-900 outline-none transition " +
  "placeholder:text-slate-400 focus:border-indigo-500 " +
  "focus:bg-white focus:ring-4 focus:ring-indigo-100 " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "dark:border-slate-700 dark:bg-slate-800 dark:text-white " +
  "dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

function getItems(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data)) return data;

  return [];
}

function getReadingId(reading) {
  return reading.publicId || reading.readingPublicId || reading.id;
}

function getMeterId(meter) {
  return meter.publicId || meter.meterPublicId || meter.id;
}

function isMeterActive(meter) {
  if (typeof meter.active === "boolean") {
    return meter.active;
  }

  return String(meter.status || "ACTIVE").toUpperCase() === "ACTIVE";
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(number);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getUnits(reading) {
  const previous = Number(reading.previousReading);
  const current = Number(reading.currentReading);

  if (
    reading.previousReading === null ||
    reading.previousReading === undefined ||
    reading.currentReading === null ||
    reading.currentReading === undefined ||
    !Number.isFinite(previous) ||
    !Number.isFinite(current)
  ) {
    return null;
  }

  return current - previous;
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {subtitle}
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

export default function ElectricityReadings() {
  const [readings, setReadings] = useState([]);
  const [meters, setMeters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [metersLoading, setMetersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(initialForm);

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const [page, setPage] = useState(0);
  const [readingToDelete, setReadingToDelete] = useState(null);

  const loadReadings = useCallback(
    async (activeFilters = initialFilters, refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await getElectricityReadings(activeFilters);
        setReadings(getItems(response));
      } catch (fetchError) {
        setError(fetchError);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  const loadMeters = useCallback(async () => {
    setMetersLoading(true);

    try {
      const response = await getElectricityMeters(0, 1000);
      setMeters(getItems(response));
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      setMetersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReadings(initialFilters);
    loadMeters();
  }, [loadReadings, loadMeters]);

  const activeMeters = useMemo(
    () => meters.filter(isMeterActive),
    [meters]
  );

  const selectedMeter = useMemo(
    () =>
      meters.find(
        (meter) =>
          String(getMeterId(meter)) === String(form.meterId)
      ),
    [meters, form.meterId]
  );

  const stats = useMemo(() => {
    const totalUnits = readings.reduce((sum, reading) => {
      const units = getUnits(reading);
      return sum + (units !== null ? Math.max(0, units) : 0);
    }, 0);

    const uniqueMeters = new Set(
      readings
        .map((reading) => reading.meterId || reading.meterNumber)
        .filter(Boolean)
    ).size;

    return {
      total: readings.length,
      totalUnits,
      uniqueMeters,
    };
  }, [readings]);

  const totalPages = Math.ceil(readings.length / PAGE_SIZE);

  const paginatedReadings = useMemo(() => {
    const start = page * PAGE_SIZE;

    return readings.slice(start, start + PAGE_SIZE);
  }, [readings, page]);

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

  const startItem =
    readings.length === 0 ? 0 : page * PAGE_SIZE + 1;

  const endItem = Math.min(
    (page + 1) * PAGE_SIZE,
    readings.length
  );

  const hasFilters = Object.values(appliedFilters).some(Boolean);

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateFilters(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!form.meterId) {
      return "Please select an electricity meter.";
    }

    if (
      form.currentReading === "" ||
      !Number.isFinite(Number(form.currentReading)) ||
      Number(form.currentReading) < 0
    ) {
      return "Please enter a valid current reading.";
    }

    if (!form.readingMonth) {
      return "Please select the reading date.";
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setError(null);
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(new Error(validationError));
      return;
    }

    setSubmitting(true);

    try {
      await createElectricityReading({
        meterId: form.meterId,
        currentReading: Number(form.currentReading),
        readingMonth: form.readingMonth,
      });

      setForm(initialForm);
      setPage(0);

      await loadReadings(appliedFilters, true);

      setSuccess("Electricity reading recorded successfully.");
    } catch (submitError) {
      setError(submitError);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!readingToDelete || deletingId !== null) return;

    const publicId = getReadingId(readingToDelete);

    setDeletingId(publicId);
    setError(null);
    setSuccess("");

    try {
      await deleteElectricityReading(publicId);

      setReadingToDelete(null);

      const nextPage =
        readings.length % PAGE_SIZE === 1
          ? Math.max(0, page - 1)
          : page;

      setPage(nextPage);

      await loadReadings(appliedFilters, true);

      setSuccess("Electricity reading deleted successfully.");
    } catch (deleteError) {
      setError(deleteError);
    } finally {
      setDeletingId(null);
    }
  }

  function handleFilterSubmit(event) {
    event.preventDefault();

    const nextFilters = {
      meterNumber: filters.meterNumber.trim(),
      roomNumber: filters.roomNumber.trim(),
      readingMonth: filters.readingMonth,
    };

    setAppliedFilters(nextFilters);
    setPage(0);

    loadReadings(nextFilters);
  }

  function clearFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(0);

    loadReadings(initialFilters);
  }

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
                Electricity Readings
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Electricity Readings
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Record monthly meter readings and track electricity usage.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              loadReadings(appliedFilters, true);
              loadMeters();
            }}
            disabled={loading || refreshing || submitting}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <ErrorMessage error={error} />

        {/* SUCCESS MESSAGE */}
        {success && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
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
            title="Total Readings"
            value={stats.total}
            subtitle="In the current result set"
            icon={ClipboardList}
            color="indigo"
          />

          <StatCard
            title="Meters Recorded"
            value={stats.uniqueMeters}
            subtitle="Unique meters in these readings"
            icon={Gauge}
            color="emerald"
          />

          <StatCard
            title="Total Units Consumed"
            value={formatNumber(stats.totalUnits)}
            subtitle="Calculated from available readings"
            icon={Zap}
            color="amber"
          />
        </div>

        {/* CREATE READING */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <Plus className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Record New Reading
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Select a meter and enter its latest reading.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              {/* METER */}
              <div>
                <label htmlFor="meterId" className={labelClass}>
                  Electricity Meter <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Gauge className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    id="meterId"
                    name="meterId"
                    value={form.meterId}
                    onChange={updateForm}
                    required
                    disabled={metersLoading || submitting}
                    className={`${inputClass} pl-11`}
                  >
                    <option value="">
                      {metersLoading
                        ? "Loading meters..."
                        : "Select a meter"}
                    </option>

                    {activeMeters.map((meter) => {
                      const meterId = getMeterId(meter);

                      if (!meterId) return null;

                      return (
                        <option key={meterId} value={meterId}>
                          {meter.meterNumber || `Meter ${meterId}`}
                          {meter.roomNumber
                            ? ` - Room ${meter.roomNumber}`
                            : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedMeter && (
                  <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                    Selected: {selectedMeter.meterNumber}
                    {selectedMeter.roomNumber
                      ? ` · Room ${selectedMeter.roomNumber}`
                      : ""}
                  </p>
                )}
              </div>

              {/* CURRENT READING */}
              <div>
                <label htmlFor="currentReading" className={labelClass}>
                  Current Reading <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Activity className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="currentReading"
                    name="currentReading"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.currentReading}
                    onChange={updateForm}
                    placeholder="e.g. 1450.50"
                    required
                    disabled={submitting}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* READING MONTH */}
              <div>
                <label htmlFor="readingMonth" className={labelClass}>
                  Reading Date <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="readingMonth"
                    name="readingMonth"
                    type="date"
                    value={form.readingMonth}
                    onChange={updateForm}
                    required
                    disabled={submitting}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Fields marked * are required.
              </p>

              <button
                type="submit"
                disabled={
                  submitting ||
                  metersLoading ||
                  activeMeters.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Record Reading
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* READINGS LIST */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* FILTER HEADER */}
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Reading History
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {readings.length} readings in the current result set
            </p>

            <form
              onSubmit={handleFilterSubmit}
              className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
            >
              <div className="relative lg:col-span-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  name="meterNumber"
                  value={filters.meterNumber}
                  onChange={updateFilters}
                  placeholder="Meter number"
                  aria-label="Filter by meter number"
                  className={`${inputClass} pl-11`}
                />
              </div>

              <div className="relative">
                <Hash className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  name="roomNumber"
                  value={filters.roomNumber}
                  onChange={updateFilters}
                  placeholder="Room number"
                  aria-label="Filter by room number"
                  className={`${inputClass} pl-11`}
                />
              </div>

              <input
                name="readingMonth"
                type="date"
                value={filters.readingMonth}
                onChange={updateFilters}
                aria-label="Filter by reading date"
                className={inputClass}
              />

              <button
                type="submit"
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Filter className="h-4 w-4" />
                Apply Filters
              </button>

              <button
                type="button"
                onClick={clearFilters}
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </form>

            {hasFilters && (
              <p className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                Filters are currently applied to the reading history.
              </p>
            )}
          </div>

          {/* TABLE */}
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : paginatedReadings.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
                <ClipboardList className="h-9 w-9" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No electricity readings found
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {hasFilters
                  ? "No readings match the selected filters."
                  : "Record your first meter reading to begin tracking electricity consumption."}
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/70">
                  <tr className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th className="whitespace-nowrap px-6 py-4">Meter</th>
                    <th className="whitespace-nowrap px-6 py-4">Room</th>
                    <th className="whitespace-nowrap px-6 py-4">Previous</th>
                    <th className="whitespace-nowrap px-6 py-4">Current</th>
                    <th className="whitespace-nowrap px-6 py-4">Units Used</th>
                    <th className="whitespace-nowrap px-6 py-4">Reading Date</th>
                    <th className="whitespace-nowrap px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedReadings.map((reading, index) => {
                    const publicId = getReadingId(reading);
                    const units = getUnits(reading);

                    return (
                      <tr
                        key={publicId || index}
                        className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                              <Gauge className="h-5 w-5" />
                            </div>

                            <span className="font-semibold text-slate-900 dark:text-white">
                              {reading.meterNumber || reading.meterId || "—"}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                          {reading.roomNumber || "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                          {formatNumber(reading.previousReading)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900 dark:text-white">
                          {formatNumber(reading.currentReading)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          {units !== null ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                              <Zap className="h-3.5 w-3.5" />
                              {formatNumber(units)}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                          {formatDate(reading.readingMonth)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          {publicId && (
                            <button
                              type="button"
                              onClick={() => setReadingToDelete(reading)}
                              disabled={deletingId !== null}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && (
            <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {startItem}–{endItem} of {readings.length} readings
              </span>

              <span>
                Total units: {formatNumber(stats.totalUnits)}
              </span>
            </div>
          )}
        </section>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {page + 1} of {totalPages}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPage((previous) => Math.max(0, previous - 1))
                }
                disabled={page === 0}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {visiblePages.map((pageIndex) => (
                <button
                  key={pageIndex}
                  type="button"
                  onClick={() => setPage(pageIndex)}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold ${
                    pageIndex === page
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  }`}
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
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {readingToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-reading-title"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle className="h-7 w-7" />
              </div>

              <h3
                id="delete-reading-title"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                Delete Electricity Reading?
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Are you sure you want to delete the reading for{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {readingToDelete.meterNumber ||
                    readingToDelete.meterId}
                </span>
                ? This action may affect electricity billing records.
              </p>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReadingToDelete(null)}
                  disabled={deletingId !== null}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deletingId !== null}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deletingId !== null ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Reading
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
