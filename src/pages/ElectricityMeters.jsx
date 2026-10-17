
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleOff,
  Gauge,
  Hash,
  IndianRupee,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";

import {
  createElectricityMeter,
  deactivateElectricityMeter,
  getElectricityMeters,
} from "../api/electricityApi";

import { getProperties } from "../api/propertyApi";
import { getRoomsByProperty } from "../api/roomApi";
import ErrorMessage from "../components/ErrorMessage";

const PAGE_SIZE = 8;

const initialForm = {
  propertyId: "",
  roomId: "",
  meterNumber: "",
  initialReading: "",
  ratePerUnit: "",
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

function getMeterId(meter) {
  return meter.publicId || meter.meterPublicId || meter.id;
}

function isMeterActive(meter) {
  if (typeof meter.active === "boolean") {
    return meter.active;
  }

  return String(meter.status || "ACTIVE").toUpperCase() === "ACTIVE";
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
          : "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      {active ? "ACTIVE" : "INACTIVE"}
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
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

export default function ElectricityMeters() {
  const [meters, setMeters] = useState([]);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(initialForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  const [meterToDeactivate, setMeterToDeactivate] = useState(null);

  const loadMeters = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getElectricityMeters();
      setMeters(getItems(response));
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadRooms = useCallback(async () => {
    setRoomsLoading(true);

    try {
      const propertiesResponse = await getProperties();
      const propertyList = getItems(propertiesResponse);

      const roomResponses = await Promise.all(
        propertyList.map((property) =>
          getRoomsByProperty(property.propertyId || property.id)
        )
      );

      const allRooms = roomResponses.flatMap((response, index) => {
        const property = propertyList[index];

        return getItems(response).map((room) => ({
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
      setRoomsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeters();
    loadRooms();
  }, [loadMeters, loadRooms]);

  const stats = useMemo(() => {
    const active = meters.filter(isMeterActive).length;

    return {
      total: meters.length,
      active,
      inactive: meters.length - active,
    };
  }, [meters]);

  const availableRooms = useMemo(() => {
    if (!form.propertyId) return [];

    return rooms.filter(
      (room) =>
        String(room.propertyId) === String(form.propertyId)
    );
  }, [rooms, form.propertyId]);

  const filteredMeters = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return meters.filter((meter) => {
      const active = isMeterActive(meter);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);

      const searchable = [
        meter.meterNumber,
        meter.roomNumber,
        meter.roomId,
        meter.initialReading,
        meter.ratePerUnit,
        meter.status,
      ]
        .filter((value) => value != null)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        (!keyword || searchable.includes(keyword))
      );
    });
  }, [meters, search, statusFilter]);

  const totalPages = Math.ceil(filteredMeters.length / PAGE_SIZE);

  const paginatedMeters = useMemo(() => {
    const start = page * PAGE_SIZE;

    return filteredMeters.slice(start, start + PAGE_SIZE);
  }, [filteredMeters, page]);

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
    filteredMeters.length === 0 ? 0 : page * PAGE_SIZE + 1;

  const endItem = Math.min(
    (page + 1) * PAGE_SIZE,
    filteredMeters.length
  );

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "propertyId" ? { roomId: "" } : {}),
    }));
  }

  function validateForm() {
    if (!form.propertyId) {
      return "Please select a property.";
    }

    if (!form.roomId) {
      return "Please select a room.";
    }

    if (!form.meterNumber.trim()) {
      return "Please enter the meter number.";
    }

    if (
      form.initialReading === "" ||
      !Number.isFinite(Number(form.initialReading)) ||
      Number(form.initialReading) < 0
    ) {
      return "Please enter a valid initial reading.";
    }

    if (
      form.ratePerUnit === "" ||
      !Number.isFinite(Number(form.ratePerUnit)) ||
      Number(form.ratePerUnit) < 0
    ) {
      return "Please enter a valid rate per unit.";
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
      await createElectricityMeter({
        roomId: String(form.roomId),
        meterNumber: form.meterNumber.trim(),
        initialReading: Number(form.initialReading),
        ratePerUnit: Number(form.ratePerUnit),
      });

      setForm(initialForm);

      await loadMeters(true);

      setSuccess("Electricity meter registered successfully.");
    } catch (submitError) {
      setError(submitError);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate() {
    if (!meterToDeactivate || deactivatingId !== null) return;

    const publicId = getMeterId(meterToDeactivate);

    setDeactivatingId(publicId);
    setError(null);
    setSuccess("");

    try {
      await deactivateElectricityMeter(publicId);

      setMeterToDeactivate(null);

      await loadMeters(true);

      setSuccess("Electricity meter deactivated successfully.");
    } catch (deactivateError) {
      setError(deactivateError);
    } finally {
      setDeactivatingId(null);
    }
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
                Electricity Meters
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Electricity Meter Management
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Register, monitor and manage electricity meters for your rooms.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError(null);
              loadMeters(true);
              loadRooms();
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

        {/* SUCCESS */}
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
            title="Total Meters"
            value={stats.total}
            icon={Gauge}
            color="indigo"
          />

          <StatCard
            title="Active Meters"
            value={stats.active}
            icon={CheckCircle2}
            color="emerald"
          />

          <StatCard
            title="Inactive Meters"
            value={stats.inactive}
            icon={CircleOff}
            color="red"
          />
        </div>

        {/* REGISTER METER */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <Plus className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Register New Meter
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Assign an electricity meter to a property room.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

              {/* PROPERTY */}
              <div>
                <label htmlFor="propertyId" className={labelClass}>
                  Property <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    id="propertyId"
                    name="propertyId"
                    value={form.propertyId}
                    onChange={updateForm}
                    required
                    disabled={roomsLoading || submitting}
                    className={`${inputClass} pl-11`}
                  >
                    <option value="">
                      {roomsLoading ? "Loading..." : "Select property"}
                    </option>

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
              </div>

              {/* ROOM */}
              <div>
                <label htmlFor="roomId" className={labelClass}>
                  Room <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Hash className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    id="roomId"
                    name="roomId"
                    value={form.roomId}
                    onChange={updateForm}
                    required
                    disabled={
                      !form.propertyId ||
                      roomsLoading ||
                      submitting
                    }
                    className={`${inputClass} pl-11`}
                  >
                    <option value="">Select room</option>

                    {availableRooms.map((room) => {
                      const roomId = room.roomId || room.id;

                      if (!roomId) return null;

                      return (
                        <option key={roomId} value={roomId}>
                          Room {room.roomNumber || roomId}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* METER NUMBER */}
              <div>
                <label htmlFor="meterNumber" className={labelClass}>
                  Meter Number <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Hash className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="meterNumber"
                    name="meterNumber"
                    value={form.meterNumber}
                    onChange={updateForm}
                    placeholder="e.g. MTR-1001"
                    required
                    disabled={submitting}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* INITIAL READING */}
              <div>
                <label htmlFor="initialReading" className={labelClass}>
                  Initial Reading <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Gauge className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="initialReading"
                    name="initialReading"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.initialReading}
                    onChange={updateForm}
                    placeholder="e.g. 1200"
                    required
                    disabled={submitting}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* RATE PER UNIT */}
              <div>
                <label htmlFor="ratePerUnit" className={labelClass}>
                  Rate Per Unit (₹) <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <IndianRupee className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="ratePerUnit"
                    name="ratePerUnit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.ratePerUnit}
                    onChange={updateForm}
                    placeholder="e.g. 8.50"
                    required
                    disabled={submitting}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Fields marked * are required.
              </p>

              <button
                type="submit"
                disabled={submitting || roomsLoading || rooms.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Register Meter
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* METER LIST */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Registered Meters
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {filteredMeters.length} matching meters
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(0);
                  }}
                  placeholder="Search meters..."
                  aria-label="Search meters"
                  className={`${inputClass} pl-11 sm:w-64`}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(0);
                }}
                aria-label="Filter meters by status"
                className={`${inputClass} sm:w-40`}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : paginatedMeters.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
                <Gauge className="h-9 w-9" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No electricity meters found
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {search || statusFilter !== "ALL"
                  ? "No meters match your filters."
                  : "Register a meter to start tracking electricity usage."}
              </p>

              {(search || statusFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                    setPage(0);
                  }}
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
                    <th className="whitespace-nowrap px-6 py-4">Initial Reading</th>
                    <th className="whitespace-nowrap px-6 py-4">Rate / Unit</th>
                    <th className="whitespace-nowrap px-6 py-4">Status</th>
                    <th className="whitespace-nowrap px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedMeters.map((meter, index) => {
                    const publicId = getMeterId(meter);
                    const active = isMeterActive(meter);

                    return (
                      <tr
                        key={publicId || index}
                        className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                              <Zap className="h-5 w-5" />
                            </div>

                            <span className="font-semibold text-slate-900 dark:text-white">
                              {meter.meterNumber || "—"}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                          {meter.roomNumber || meter.roomId || "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                          {meter.initialReading ?? "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(meter.ratePerUnit)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge active={active} />
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          {active && publicId && (
                            <button
                              type="button"
                              onClick={() => setMeterToDeactivate(meter)}
                              disabled={deactivatingId !== null}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
                            >
                              <CircleOff className="h-4 w-4" />
                              Deactivate
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
                Showing {startItem}–{endItem} of {filteredMeters.length} meters
              </span>

              <span>Total registered: {stats.total}</span>
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

        {/* DEACTIVATION CONFIRMATION MODAL */}
        {meterToDeactivate && (
          <div
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="deactivate-meter-title"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle className="h-7 w-7" />
              </div>

              <h3
                id="deactivate-meter-title"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                Deactivate Electricity Meter?
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Are you sure you want to deactivate{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {meterToDeactivate.meterNumber}
                </span>
                ? This will change its active status.
              </p>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMeterToDeactivate(null)}
                  disabled={deactivatingId !== null}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={deactivatingId !== null}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deactivatingId !== null ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Deactivating...
                    </>
                  ) : (
                    <>
                      <CircleOff className="h-4 w-4" />
                      Deactivate
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
