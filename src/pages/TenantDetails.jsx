
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Edit3,
  FileText,
  Hash,
  Home,
  IdCard,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { getTenant } from "../api/tenantApi";
import ErrorMessage from "../components/ErrorMessage";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:2027"
).replace(/\/$/, "");

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function getInitials(name) {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getImageUrl(path) {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}/${String(path).replace(/^\/+/, "")}`;
}

function InfoCard({ icon: Icon, label, value, color = "indigo" }) {
  const colors = {
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    blue:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-2 break-words text-sm font-semibold text-slate-900 dark:text-white">
            {displayValue(value)}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 border-b border-slate-100 py-4 last:border-b-0 dark:border-slate-800">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">
          {displayValue(value)}
        </p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="h-32 bg-slate-100 dark:bg-slate-800" />

        <div className="flex items-center gap-5 p-6">
          <div className="h-24 w-24 shrink-0 rounded-2xl bg-slate-200 dark:bg-slate-700" />

          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-64 max-w-full rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
    </div>
  );
}

export default function TenantDetails() {
  const { tenantId } = useParams();

  const [tenant, setTenant] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState(null);

  // Load tenant information.
  useEffect(() => {
    let cancelled = false;

    async function loadTenant() {
      setLoading(true);
      setError(null);
      setTenant(null);

      try {
        const response = await getTenant(tenantId);

        if (!cancelled) {
          setTenant(response?.data ?? response);
        }
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

    loadTenant();

    return () => {
      cancelled = true;
    };
  }, [tenantId, refreshKey]);

  // Load protected profile image using JWT.
  useEffect(() => {
    const imagePath = tenant?.profileImageUrl;

    setImageUrl(null);

    if (!imagePath) return;

    const controller = new AbortController();
    let objectUrl = null;
    let cancelled = false;

    async function loadImage() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(getImageUrl(imagePath), {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load profile image.");
        }

        const blob = await response.blob();

        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch (fetchError) {
        if (!cancelled && fetchError.name !== "AbortError") {
          console.error("Profile image error:", fetchError);
          setImageUrl(null);
        }
      }
    }

    loadImage();

    return () => {
      cancelled = true;
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [tenant?.profileImageUrl]);

  const tenantName = tenant?.name || "Unknown Tenant";

  const tenantPublicId =
    tenant?.tenantId || tenant?.publicId || tenant?.id;

  const tenantStatus = String(
    tenant?.status || tenant?.userStatus || ""
  ).toUpperCase();

  return (
    <div className="min-h-full bg-[#f7f9fc] px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link
                to="/tenants"
                className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Tenants
              </Link>

              <span>/</span>

              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Tenant Details
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Tenant Details
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              View and manage tenant profile and rental information.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/tenants"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            {tenant && (
              <Link
                to={`/tenants/${tenantId}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 dark:shadow-none"
              >
                <Edit3 className="h-4 w-4" />
                Update Tenant
              </Link>
            )}
          </div>
        </div>

        <ErrorMessage error={error} />

        {loading ? (
          <LoadingSkeleton />
        ) : !tenant ? (
          <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Users className="h-9 w-9" />
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Tenant Not Found
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Unable to display the requested tenant information.
            </p>

            <Link
              to="/tenants"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tenants
            </Link>
          </div>
        ) : (
          <>
            {/* PROFILE HEADER */}
            <section className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="relative h-32 overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 sm:h-40">
                <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border border-white/20" />
                <div className="absolute right-20 top-10 h-32 w-32 rounded-full bg-white/10" />
                <div className="absolute bottom-4 left-6 flex items-center gap-2 text-sm font-semibold text-white/90">
                  <Building2 className="h-4 w-4" />
                  TenantControl
                </div>
              </div>

              <div className="px-6 pb-7 sm:px-8">
                <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="relative z-10 shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`${tenantName}'s profile`}
                          className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-lg dark:border-slate-900 sm:h-28 sm:w-28"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-600 shadow-lg dark:border-slate-900 dark:bg-indigo-500/20 dark:text-indigo-400 sm:h-28 sm:w-28">
                          {getInitials(tenantName)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 sm:pb-2">
                      <h2 className="break-words text-2xl font-bold text-slate-900 dark:text-white">
                        {tenantName}
                      </h2>

                      <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                        {tenant.email || tenant.mobile || "Tenant Profile"}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
                          <UserRound className="h-3.5 w-3.5" />
                          Tenant
                        </span>

                        {tenantStatus && (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                              tenantStatus === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {tenantStatus.replaceAll("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* QUICK INFORMATION */}
            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <InfoCard
                icon={Phone}
                label="Mobile Number"
                value={tenant.mobile}
                color="indigo"
              />

              <InfoCard
                icon={Mail}
                label="Email Address"
                value={tenant.email}
                color="blue"
              />

              <InfoCard
                icon={Home}
                label="Room Number"
                value={tenant.roomNumber || tenant.room?.roomNumber}
                color="emerald"
              />

              <InfoCard
                icon={MapPin}
                label="Tenant Address"
                value={tenant.address}
                color="amber"
              />

              <InfoCard
                icon={CalendarDays}
                label="Added On"
                value={formatDate(tenant.createdAt)}
                color="indigo"
              />

              <InfoCard
                icon={IdCard}
                label="Tenant ID"
                value={tenantPublicId}
                color="blue"
              />
            </div>

            {/* DETAILED INFORMATION */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* PERSONAL DETAILS */}
              <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Personal Information
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Contact and identification details
                    </p>
                  </div>
                </div>

                <div className="px-6 py-2">
                  <DetailRow
                    icon={UserRound}
                    label="Full Name"
                    value={tenant.name}
                  />

                  <DetailRow
                    icon={Phone}
                    label="Mobile Number"
                    value={tenant.mobile}
                  />

                  <DetailRow
                    icon={Mail}
                    label="Email Address"
                    value={tenant.email}
                  />

                  <DetailRow
                    icon={MapPin}
                    label="Residential Address"
                    value={tenant.address}
                  />
                </div>
              </section>

              {/* RENTAL DETAILS */}
              <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                    <Building2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Rental Information
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Property and room details
                    </p>
                  </div>
                </div>

                <div className="px-6 py-2">
                  <DetailRow
                    icon={Building2}
                    label="Property"
                    value={
                      tenant.propertyName ||
                      tenant.property?.name
                    }
                  />

                  <DetailRow
                    icon={Home}
                    label="Room Number"
                    value={
                      tenant.roomNumber ||
                      tenant.room?.roomNumber
                    }
                  />

                  <DetailRow
                    icon={ShieldCheck}
                    label="Assigned Admin"
                    value={tenant.adminName}
                  />

                  <DetailRow
                    icon={CalendarDays}
                    label="Tenant Added On"
                    value={formatDate(tenant.createdAt)}
                  />
                </div>
              </section>
            </div>

            {/* RECORD INFORMATION */}
            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Record Information
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Tenant account and record metadata
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-8 px-6 py-2 sm:grid-cols-2">
                <DetailRow
                  icon={Hash}
                  label="Tenant Reference ID"
                  value={tenantPublicId}
                />

                <DetailRow
                  icon={CalendarDays}
                  label="Created At"
                  value={formatDate(tenant.createdAt)}
                />

                {tenant.updatedAt && (
                  <DetailRow
                    icon={RefreshCw}
                    label="Last Updated"
                    value={formatDate(tenant.updatedAt)}
                  />
                )}

                {tenant.adminName && (
                  <DetailRow
                    icon={ShieldCheck}
                    label="Managed By"
                    value={tenant.adminName}
                  />
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
