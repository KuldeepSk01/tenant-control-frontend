
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ArrowRightLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  DoorOpen,
  Eye,
  Mail,
  Phone,
  UserRound,
  Building2,
  Clock3,
  IndianRupee,
  LoaderCircle,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";

import {
  getAssignments,
  getAssignment,
  assignTenantToRoom,
  moveOut,
} from "../api/tenantAssignmentsApi";

import { getProperties } from "../api/propertyApi";
import { getRoomsByProperty } from "../api/roomApi";
import { getTenants } from "../api/tenantApi";

import ErrorMessage from "../components/ErrorMessage";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 " +
  "text-sm text-slate-900 outline-none transition " +
  "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "dark:border-slate-700 dark:bg-slate-800 dark:text-white " +
  "dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

const emptyForm = {
  tenantPublicId: "",
  roomPublicId: "",
  moveInDate: "",
  rent: "",
  securityDeposit: "",
};

function extractArray(response) {
  const value = response?.data ?? response;

  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.content)) {
    return value.data.content;
  }

  return [];
}

function getId(item) {
  return (
    item?.publicId ??
    item?.assignmentId ??
    item?.roomPublicId ??
    item?.tenantPublicId ??
    item?.roomId ??
    item?.tenantId ??
    item?.propertyId ??
    item?.id ??
    ""
  );
}

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

function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number);
}

function getAssignmentStatus(assignment) {
  const status = String(assignment.status || "").toUpperCase();

  if (
    assignment.moveOutDate ||
    assignment.movedOutAt ||
    ["MOVED_OUT", "COMPLETED", "ENDED"].includes(status)
  ) {
    return "COMPLETED";
  }

  if (status === "CANCELLED") return "CANCELLED";

  if (status === "ACTIVE" || status === "OCCUPIED") {
    return "ACTIVE";
  }

  // Preserve the original page's fallback for records
  // that do not contain an explicit status.
  return status || "ACTIVE";
}

function isActiveAssignment(assignment) {
  return getAssignmentStatus(assignment) === "ACTIVE";
}

function isAvailableRoom(room) {
  return ["AVAILABLE", "VACANT"].includes(
    String(room.status || "").toUpperCase()
  );
}

function StatusBadge({ status }) {
  const styles = {
    ACTIVE:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 " +
      "dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",

    COMPLETED:
      "bg-slate-100 text-slate-600 ring-slate-200 " +
      "dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",

    CANCELLED:
      "bg-red-50 text-red-700 ring-red-200 " +
      "dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  };

  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 " +
        "text-xs font-semibold ring-1 ring-inset " +
        (styles[status] ||
          "bg-amber-50 text-amber-700 ring-amber-200")
      }
    >
      <span
        className={
          "h-1.5 w-1.5 rounded-full " +
          (status === "ACTIVE"
            ? "bg-emerald-500"
            : status === "CANCELLED"
              ? "bg-red-500"
              : "bg-slate-400")
        }
      />

      {status.replaceAll("_", " ")}
    </span>
  );
}

function SummaryCard({ title, value, icon: Icon, color }) {
  const colors = {
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    slate:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
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

function formatDateTime(value) {
  if (!value) return "—";
  // Java LocalDateTime has no timezone. Display the supplied local clock
  // without silently converting it to the browser's timezone.
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return formatDate(value);
  const [, year, month, day, hour, minute] = match;
  const h = Number(hour);
  return `${day}/${month}/${year}, ${String(h % 12 || 12).padStart(2, "0")}:${minute} ${h >= 12 ? "PM" : "AM"}`;
}

function DetailItem({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1.5 flex items-start gap-2 break-words text-sm font-semibold text-slate-900 dark:text-white">
        {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />}
        <span className="min-w-0 break-all">{value === null || value === undefined || value === "" ? "—" : value}</span>
      </p>
    </div>
  );
}

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [movingOutId, setMovingOutId] = useState(null);
  const [confirmMoveOut, setConfirmMoveOut] = useState(null);

  const [viewAssignmentId, setViewAssignmentId] = useState(null);
  const [viewAssignment, setViewAssignment] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState(null);

  const loadAssignments = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    setError(null);

    try {
      const response = await getAssignments();
      setAssignments(extractArray(response));
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const stats = useMemo(() => {
    const active = assignments.filter(isActiveAssignment).length;

    const completed = assignments.filter(
      (item) => getAssignmentStatus(item) === "COMPLETED"
    ).length;

    return {
      total: assignments.length,
      active,
      completed,
    };
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const status = getAssignmentStatus(assignment);

      if (statusFilter !== "ALL" && status !== statusFilter) {
        return false;
      }

      if (!keyword) return true;

      const searchable = [
        assignment.tenantName,
        assignment.tenant?.name,
        assignment.roomNumber,
        assignment.room?.roomNumber,
        assignment.propertyName,
        assignment.room?.propertyName,
        status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [assignments, search, statusFilter]);

  const availableRooms = useMemo(
    () => rooms.filter(isAvailableRoom),
    [rooms]
  );

  const selectedRoom = useMemo(
    () =>
      rooms.find(
        (room) => String(getId(room)) === form.roomPublicId
      ),
    [rooms, form.roomPublicId]
  );

  function updateForm(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function openAssignModal() {
    setIsAssignModalOpen(true);
    setAssignmentLoading(true);
    setError(null);
    setSuccess("");
    setForm(emptyForm);

    try {
      const [tenantsResponse, propertiesResponse] =
        await Promise.all([
          getTenants(0, 1000),
          getProperties(),
        ]);

      const tenantData = extractArray(tenantsResponse);
      const propertyData = extractArray(propertiesResponse);

      const roomResponses = await Promise.all(
        propertyData.map((property) =>
          getRoomsByProperty(property.propertyId || property.id)
        )
      );

      const roomData = roomResponses.flatMap(extractArray);

      setTenants(tenantData);
      setRooms(roomData);
    } catch (fetchError) {
      setError(fetchError);
      setIsAssignModalOpen(false);
    } finally {
      setAssignmentLoading(false);
    }
  }

  function closeAssignModal() {
    if (assigning) return;

    setIsAssignModalOpen(false);
    setForm(emptyForm);
  }

  function handleRoomChange(event) {
    const roomPublicId = event.target.value;

    const room = rooms.find(
      (item) => String(getId(item)) === roomPublicId
    );

    setForm((previous) => ({
      ...previous,
      roomPublicId,
      rent: room?.rent ?? "",
      securityDeposit: room?.securityDeposit ?? "",
    }));
  }

  async function handleAssignTenant(event) {
    event.preventDefault();

    if (assigning) return;

    setError(null);
    setSuccess("");

    if (
      !form.tenantPublicId ||
      !form.roomPublicId ||
      !form.moveInDate
    ) {
      setError(new Error("Please complete all required fields."));
      return;
    }

    if (!selectedRoom || !isAvailableRoom(selectedRoom)) {
      setError(new Error("Please select an available room."));
      return;
    }

    if (
      form.rent === "" ||
      form.securityDeposit === "" ||
      !Number.isFinite(Number(form.rent)) ||
      !Number.isFinite(Number(form.securityDeposit)) ||
      Number(form.rent) < 0 ||
      Number(form.securityDeposit) < 0
    ) {
      setError(new Error("Please enter valid rent and deposit amounts."));
      return;
    }

    setAssigning(true);

    try {
      await assignTenantToRoom({
        tenantPublicId: form.tenantPublicId,
        roomPublicId: form.roomPublicId,
        moveInDate: form.moveInDate,
        rent: Number(form.rent),
        securityDeposit: Number(form.securityDeposit),
      });

      setIsAssignModalOpen(false);
      setForm(emptyForm);

      await loadAssignments(false);

      setSuccess("Tenant assigned to the room successfully.");
    } catch (assignError) {
      setError(assignError);
    } finally {
      setAssigning(false);
    }
  }

  async function openAssignmentDetails(publicId) {
    if (!publicId) return;
    setViewAssignmentId(publicId);
    setViewAssignment(null);
    setViewError(null);
    setViewLoading(true);
    try {
      const response = await getAssignment(publicId);
      // Supports both { data: {...} } and a directly returned assignment.
      const details = response?.data?.data ?? response?.data ?? response;
      if (!details || typeof details !== "object" || !details.publicId) {
        throw new Error("Assignment details were not returned by the API.");
      }
      setViewAssignment(details);
    } catch (fetchError) {
      setViewError(fetchError);
    } finally {
      setViewLoading(false);
    }
  }

  function closeAssignmentDetails() {
    setViewAssignmentId(null);
    setViewAssignment(null);
    setViewError(null);
  }

  async function handleMoveOut() {
    if (!confirmMoveOut || movingOutId) return;

    const publicId = getId(confirmMoveOut);

    if (!publicId) return;

    setMovingOutId(publicId);
    setError(null);
    setSuccess("");

    try {
      await moveOut(publicId);

      setConfirmMoveOut(null);

      await loadAssignments(false);

      setSuccess("Tenant moved out successfully.");
    } catch (moveOutError) {
      setError(moveOutError);
    } finally {
      setMovingOutId(null);
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
                Assignments
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Room Assignments
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage tenant occupancy, move-ins and move-outs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadAssignments(false)}
              disabled={loading || refreshing}
              title="Refresh assignments"
              aria-label="Refresh assignments"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <RefreshCw
                className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={openAssignModal}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 dark:shadow-none"
            >
              <Plus className="h-4 w-4" />
              Assign Tenant
            </button>
          </div>
        </div>

        {/* ERRORS / SUCCESS */}
        <ErrorMessage error={error} />

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

        {/* SUMMARY CARDS */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <SummaryCard
            title="Total Assignments"
            value={stats.total}
            icon={ClipboardList}
            color="indigo"
          />

          <SummaryCard
            title="Active Assignments"
            value={stats.active}
            icon={Users}
            color="emerald"
          />

          <SummaryCard
            title="Completed Move-outs"
            value={stats.completed}
            icon={ArrowRightLeft}
            color="slate"
          />
        </div>

        {/* TABLE CARD */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* TABLE TOOLBAR */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Assignment Records
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {filteredAssignments.length} records found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search assignments..."
                  aria-label="Search assignments"
                  className={`${inputClass} pl-10 sm:w-64`}
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                  className={`${inputClass} appearance-none pr-10 sm:w-44`}
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
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
          ) : filteredAssignments.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
                <ClipboardList className="h-8 w-8" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No assignments found
              </h3>

              <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                {search || statusFilter !== "ALL"
                  ? "Try changing your search or status filter."
                  : "Start by assigning a tenant to an available room."}
              </p>

              {!search && statusFilter === "ALL" && (
                <button
                  type="button"
                  onClick={openAssignModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Assignment
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/70">
                  <tr className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th className="whitespace-nowrap px-6 py-4">Tenant</th>
                    <th className="whitespace-nowrap px-6 py-4">Room</th>
                    <th className="whitespace-nowrap px-6 py-4">Property</th>
                    <th className="whitespace-nowrap px-6 py-4">Move In</th>
                    <th className="whitespace-nowrap px-6 py-4">Move Out</th>
                    <th className="whitespace-nowrap px-6 py-4">Status</th>
                    <th className="whitespace-nowrap px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAssignments.map((assignment, index) => {
                    const publicId = getId(assignment);
                    const status = getAssignmentStatus(assignment);

                    const tenantName =
                      assignment.tenantName ||
                      assignment.tenant?.name ||
                      "Unknown Tenant";

                    const roomNumber =
                      assignment.roomNumber ||
                      assignment.room?.roomNumber ||
                      "—";

                    const propertyName =
                      assignment.propertyName ||
                      assignment.room?.propertyName ||
                      "—";

                    return (
                      <tr
                        key={publicId || index}
                        className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                              {tenantName.charAt(0).toUpperCase()}
                            </div>

                            <span className="font-semibold text-slate-900 dark:text-white">
                              {tenantName}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                            <DoorOpen className="h-4 w-4 text-slate-400" />
                            {roomNumber}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                          {propertyName}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-500 dark:text-slate-400">
                          {formatDate(
                            assignment.moveInDate ||
                            assignment.movedInAt ||
                            assignment.createdAt
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-500 dark:text-slate-400">
                          {formatDate(
                            assignment.moveOutDate ||
                            assignment.movedOutAt
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge status={status} />
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {publicId && (
                              <button
                                type="button"
                                onClick={() => openAssignmentDetails(publicId)}
                                className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </button>
                            )}
                            {status === "ACTIVE" && publicId && (
                              <button
                                type="button"
                                onClick={() => setConfirmMoveOut(assignment)}
                                disabled={Boolean(movingOutId)}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                              >
                                <LogOut className="h-3.5 w-3.5" />
                                Move Out
                              </button>
                            )}
                            {!publicId && <span className="text-slate-400">—</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredAssignments.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Showing {filteredAssignments.length} of {assignments.length} assignments
            </div>
          )}
        </div>
      </div>

      {/* ASSIGNMENT DETAILS / OCCUPANCY HISTORY MODAL */}
      {viewAssignmentId && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAssignmentDetails();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignment-details-title"
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white px-5 py-5 dark:border-slate-800 dark:from-indigo-500/10 dark:to-slate-900 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="assignment-details-title" className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                    Assignment Details
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Tenant occupancy record and history
                  </p>
                </div>
              </div>
              <button type="button" onClick={closeAssignmentDetails} aria-label="Close assignment details" className="rounded-xl p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
              {viewLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
                  <LoaderCircle className="h-8 w-8 animate-spin text-indigo-600" />
                  <p className="text-sm">Loading assignment details...</p>
                </div>
              ) : viewError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  <p className="font-semibold">Unable to load assignment</p>
                  <p className="mt-1">{viewError?.message || "Please try again."}</p>
                  <button type="button" onClick={() => openAssignmentDetails(viewAssignmentId)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">
                    <RefreshCw className="h-4 w-4" /> Retry
                  </button>
                </div>
              ) : viewAssignment ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                        {(viewAssignment.tenant?.name || viewAssignment.tenantName || "T").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{viewAssignment.tenant?.name || viewAssignment.tenantName || "Unknown Tenant"}</h3>
                        <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">Assignment ID: {viewAssignment.publicId}</p>
                      </div>
                    </div>
                    <StatusBadge status={getAssignmentStatus(viewAssignment)} />
                  </div>

                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                      <UserRound className="h-4 w-4 text-indigo-500" /> Tenant Information
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailItem label="Full Name" value={viewAssignment.tenant?.name || viewAssignment.tenantName} />
                      <DetailItem label="Mobile" value={viewAssignment.tenant?.mobile} icon={Phone} />
                      <DetailItem label="Email" value={viewAssignment.tenant?.email} icon={Mail} />
                      <DetailItem label="Address" value={viewAssignment.tenant?.address} icon={MapPin} />
                      <DetailItem label="Managed By" value={viewAssignment.tenant?.adminName} />
                      <DetailItem label="Tenant ID" value={viewAssignment.tenantPublicId || viewAssignment.tenant?.tenantId} />
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                      <Building2 className="h-4 w-4 text-indigo-500" /> Property & Room
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailItem label="Property" value={viewAssignment.propertyName} icon={Building2} />
                      <DetailItem label="Room Number" value={viewAssignment.roomNumber} icon={DoorOpen} />
                      <DetailItem label="Monthly Rent" value={formatCurrency(viewAssignment.rent)} icon={IndianRupee} />
                      <DetailItem label="Security Deposit" value={formatCurrency(viewAssignment.securityDeposit)} icon={Wallet} />
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                      <Clock3 className="h-4 w-4 text-indigo-500" /> Occupancy Timeline
                    </h3>
                    <div className="rounded-2xl border border-slate-100 p-5 dark:border-slate-800">
                      <div className="relative ml-2 border-l-2 border-indigo-200 pl-6 dark:border-indigo-500/30">
                        <div className="relative pb-7">
                          <span className="absolute -left-[33px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-600 dark:border-slate-900" />
                          <p className="font-semibold text-slate-900 dark:text-white">Tenant Moved In</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDateTime(viewAssignment.moveInDate)}</p>
                        </div>
                        <div className="relative">
                          <span className={`absolute -left-[33px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${viewAssignment.moveOutDate ? "bg-slate-500" : "bg-emerald-500"}`} />
                          <p className="font-semibold text-slate-900 dark:text-white">{viewAssignment.moveOutDate ? "Tenant Moved Out" : "Current Occupancy"}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{viewAssignment.moveOutDate ? formatDateTime(viewAssignment.moveOutDate) : "No move-out date recorded"}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <p className="rounded-xl bg-indigo-50 px-4 py-3 text-xs leading-5 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                    This is the history of the selected room assignment. To display every past assignment for this tenant across different rooms, the backend must provide a tenant assignment history endpoint.
                  </p>
                </div>
              ) : null}
            </div>
            <div className="flex justify-end border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-7">
              <button type="button" onClick={closeAssignmentDetails} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN TENANT MODAL */}
      {isAssignModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAssignModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-modal-title"
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>

                <div>
                  <h2
                    id="assign-modal-title"
                    className="text-lg font-bold text-slate-900 dark:text-white"
                  >
                    Assign Tenant to Room
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Select a tenant and an available room.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAssignModal}
                disabled={assigning}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {assignmentLoading ? (
              <div className="flex items-center justify-center gap-3 p-16 text-sm text-slate-500">
                <LoaderCircle className="h-5 w-5 animate-spin text-indigo-600" />
                Loading tenants and rooms...
              </div>
            ) : (
              <form
                onSubmit={handleAssignTenant}
                className="flex min-h-0 flex-col"
              >
                <div className="space-y-5 overflow-y-auto px-6 py-6">

                  <div>
                    <label htmlFor="assignment-tenant" className={labelClass}>
                      Select Tenant *
                    </label>

                    <select
                      id="assignment-tenant"
                      required
                      value={form.tenantPublicId}
                      onChange={(event) =>
                        updateForm("tenantPublicId", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">Choose a tenant</option>

                      {tenants.map((tenant) => (
                        <option
                          key={getId(tenant)}
                          value={getId(tenant)}
                        >
                          {tenant.name}
                          {tenant.mobile ? ` — ${tenant.mobile}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="assignment-room" className={labelClass}>
                      Select Available Room *
                    </label>

                    <select
                      id="assignment-room"
                      required
                      value={form.roomPublicId}
                      onChange={handleRoomChange}
                      className={inputClass}
                    >
                      <option value="">Choose a room</option>

                      {rooms.map((room) => (
                        <option
                          key={getId(room)}
                          value={getId(room)}
                          disabled={!isAvailableRoom(room)}
                        >
                          Room {room.roomNumber} — {room.propertyName || "Property"}
                          {" "}({room.status || "UNKNOWN"})
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {availableRooms.length} available rooms found
                    </p>
                  </div>

                  <div>
                    <label htmlFor="assignment-date" className={labelClass}>
                      Move-in Date *
                    </label>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="assignment-date"
                        type="datetime-local"
                        required
                        value={form.moveInDate}
                        onChange={(event) =>
                          updateForm("moveInDate", event.target.value)
                        }
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="assignment-rent" className={labelClass}>
                        Monthly Rent *
                      </label>

                      <div className="relative">
                        <IndianRupee className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          id="assignment-rent"
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={form.rent}
                          onChange={(event) =>
                            updateForm("rent", event.target.value)
                          }
                          placeholder="0.00"
                          className={`${inputClass} pl-11`}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="assignment-deposit" className={labelClass}>
                        Security Deposit *
                      </label>

                      <div className="relative">
                        <Wallet className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          id="assignment-deposit"
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={form.securityDeposit}
                          onChange={(event) =>
                            updateForm("securityDeposit", event.target.value)
                          }
                          placeholder="0.00"
                          className={`${inputClass} pl-11`}
                        />
                      </div>
                    </div>
                  </div>

                  {selectedRoom && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                      <p className="mb-3 text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                        Selected Room
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-xs text-indigo-700 dark:text-indigo-300">
                        <span>Room: {selectedRoom.roomNumber}</span>
                        <span>Status: {selectedRoom.status}</span>
                        <span>Rent: {formatCurrency(selectedRoom.rent)}</span>
                        <span>
                          Deposit: {formatCurrency(selectedRoom.securityDeposit)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-500" />
                    The assignment will be submitted using your existing
                    tenant assignment API.
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={closeAssignModal}
                    disabled={assigning}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      assigning ||
                      !form.tenantPublicId ||
                      !form.roomPublicId ||
                      !form.moveInDate ||
                      form.rent === "" ||
                      form.securityDeposit === ""
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {assigning ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Confirm Assignment
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MOVE OUT CONFIRMATION */}
      {confirmMoveOut && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="move-out-title"
            aria-describedby="move-out-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <LogOut className="h-7 w-7" />
            </div>

            <h2
              id="move-out-title"
              className="text-xl font-bold text-slate-900 dark:text-white"
            >
              Confirm Tenant Move-out
            </h2>

            <p
              id="move-out-description"
              className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400"
            >
              Are you sure you want to move out{" "}
              <strong className="text-slate-900 dark:text-white">
                {confirmMoveOut.tenantName ||
                  confirmMoveOut.tenant?.name ||
                  "this tenant"}
              </strong>
              ? This will update the room assignment through your backend.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmMoveOut(null)}
                disabled={Boolean(movingOutId)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleMoveOut}
                disabled={Boolean(movingOutId)}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {movingOutId ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Moving Out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Confirm Move-out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
