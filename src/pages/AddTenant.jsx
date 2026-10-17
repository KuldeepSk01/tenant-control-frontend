
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  UserRoundPlus,
  UserRound,
  Mail,
  Smartphone,
  MapPin,
  Save,
  LoaderCircle,
  ShieldCheck,
  Info,
  CheckCircle2,
} from "lucide-react";

import { createTenant } from "../api/tenantApi";
import ErrorMessage from "../components/ErrorMessage";

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  address: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 " +
  "bg-slate-50/70 py-3 pl-11 pr-4 " +
  "text-sm text-slate-900 outline-none " +
  "transition-all duration-200 " +
  "placeholder:text-slate-400 " +
  "focus:border-indigo-500 focus:bg-white " +
  "focus:ring-4 focus:ring-indigo-100 " +
  "dark:border-slate-700 dark:bg-slate-800 " +
  "dark:text-white dark:placeholder:text-slate-500 " +
  "dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10";

const labelClass =
  "mb-2 block text-sm font-semibold " +
  "text-slate-700 dark:text-slate-200";

export default function AddTenant() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "mobile"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));
  }

  function validateForm() {
    if (form.name.trim().length < 2) {
      return "Tenant name must contain at least 2 characters.";
    }

    if (!/^[0-9]{10}$/.test(form.mobile)) {
      return "Please enter a valid 10-digit mobile number.";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      return "Please enter a valid email address.";
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim(),
        address: form.address.trim(),
      };

      await createTenant(payload);

      navigate("/tenants", {
        replace: true,
        state: {
          message: "Tenant created successfully.",
        },
      });
    } catch (submitError) {
      setError(submitError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-[#f7f9fc] px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* BREADCRUMB */}
        <div className="mb-5 flex items-center gap-2 text-sm">
          <Link
            to="/tenants"
            className="font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400"
          >
            Tenants
          </Link>

          <span className="text-slate-300">/</span>

          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            Add Tenant
          </span>
        </div>

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              <UserRoundPlus className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Add New Tenant
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Create a new tenant record in your workspace.
              </p>
            </div>
          </div>

          <Link
            to="/tenants"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tenants
          </Link>
        </div>

        <ErrorMessage error={error} />

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          {/* SECTION HEADER */}
          <div className="border-b border-slate-100 px-6 py-6 dark:border-slate-800 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <UserRound className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Personal Information
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Enter the tenant's basic information and contact details.
                </p>
              </div>
            </div>
          </div>

          {/* FORM FIELDS */}
          <div className="grid grid-cols-1 gap-6 px-6 py-8 sm:grid-cols-2 sm:px-8">

            {/* NAME */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className={labelClass}>
                Full Name
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Enter tenant's full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            {/* MOBILE */}
            <div>
              <label htmlFor="mobile" className={labelClass}>
                Mobile Number
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <Smartphone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="mobile"
                  type="tel"
                  name="mobile"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="Enter 10-digit mobile number"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Enter a 10-digit mobile number.
              </p>
            </div>

            {/* EMAIL */}
            <div>
              <label htmlFor="email" className={labelClass}>
                Email Address
                <span className="ml-2 text-xs font-normal text-slate-400">
                  Optional
                </span>
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="tenant@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div className="sm:col-span-2">
              <label htmlFor="address" className={labelClass}>
                Address
                <span className="ml-2 text-xs font-normal text-slate-400">
                  Optional
                </span>
              </label>

              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400" />

                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  placeholder="Enter tenant's residential address"
                  value={form.address}
                  onChange={handleChange}
                  disabled={loading}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* INFORMATION NOTE */}
          <div className="mx-6 mb-7 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10 sm:mx-8">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />

            <div>
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                Tenant Information
              </p>

              <p className="mt-1 text-xs leading-5 text-indigo-700 dark:text-indigo-300">
                This form creates a tenant record. Room assignments
                and electricity billing can be managed separately
                through their respective modules.
              </p>
            </div>
          </div>

          {/* ACTION FOOTER */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-8">

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Fields marked * are required
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Link
                to="/tenants"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Saving Tenant...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Tenant
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
