
import { useEffect, useState } from "react";

import {
  Building2,
  UserRound,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Save,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";

import {
  getMyAdminProfile,
  updateMyAdminProfile,
} from "../api/adminApi";

import {
  enableAutogeneratebillApi,
} from "../api/adminApi";

import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 " +
  "text-sm text-slate-900 outline-none transition " +
  "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 " +
  "dark:border-slate-700 dark:bg-slate-800 dark:text-white " +
  "dark:focus:ring-indigo-500/10";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

const emptyForm = {
  businessName: "",
  businessEmail: "",
  businessMobile: "",
  businessAddress: "",
  city: "",
  state: "",
  pincode: "",
  websiteUrl: "",
  about: "",
};

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className={labelClass}>
        <span className="inline-flex items-center gap-2">
          <Icon className="h-4 w-4 text-indigo-500" />
          {label}
        </span>
      </label>
      {children}
    </div>
  );
}

export default function Profile() {
  const { user, userProfile, updateUserProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingAutoBill, setUpdatingAutoBill] = useState(false);

  const [autoBillEnabled, setAutoBillEnabled] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  async function loadProfile() {
    setLoading(true);
    setError(null);

    try {
      const response = await getMyAdminProfile();
      const data = response?.data ?? response;
      setProfile(data);
      const userFormData = {
        businessName: data?.businessName ?? "",
        businessEmail: data?.businessEmail ?? "",
        businessMobile: data?.businessMobile ?? "",
        businessAddress: data?.businessAddress ?? "",
        city: data?.city ?? "",
        state: data?.state ?? "",
        pincode: data?.pincode ?? "",
        websiteUrl: data?.websiteUrl ?? "",
        about: data?.about ?? "",
      }

      setForm(userFormData);
      updateUserProfile(userFormData);

      setAutoBillEnabled(
        Boolean(
          data?.isAutoGenerateBill ??
          data?.enableAutoGenerateBill ??
          false
        )
      );
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError(null);
    setSuccess("");

    try {
      const response = await updateMyAdminProfile(form);
      const updated = response?.data ?? response;

      setProfile(updated);

      const updatedrofile = {
        businessName: updated?.businessName ?? form.businessName,
        businessEmail: updated?.businessEmail ?? form.businessEmail,
        businessMobile: updated?.businessMobile ?? form.businessMobile,
        businessAddress: updated?.businessAddress ?? form.businessAddress,
        city: updated?.city ?? form.city,
        state: updated?.state ?? form.state,
        pincode: updated?.pincode ?? form.pincode,
        websiteUrl: updated?.websiteUrl ?? form.websiteUrl,
        about: updated?.about ?? form.about,
      }

      setForm(updatedrofile);

      updateUserProfile(updatedrofile);

      setSuccess("Business profile updated successfully.");
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleAutoBillChange(event) {
    const enabled = event.target.checked;

    setError(null);
    setSuccess("");
    setUpdatingAutoBill(true);

    try {
      // This existing API must now update AdminEntity
      // instead of UserEntity.

      setSuccess("we are working on it");


      // const response = await enableAutogeneratebillApi(
      //   enabled,
      //   userProfile?.userId
      // );

      // const data = response?.data ?? response;

      // const nextEnabled =
      //   data?.isAutoGenerateBill ??
      //   data?.enableAutoGenerateBill ??
      //   enabled;

      // setAutoBillEnabled(Boolean(nextEnabled));

      // setSuccess(
      //   nextEnabled
      //     ? "Automatic bill generation enabled."
      //     : "Automatic bill generation disabled."
      // );

    } catch (err) {
      setError(err);
    } finally {
      setUpdatingAutoBill(false);
    }
  }

  const accountName =
    user?.name || profile?.userName || "Administrator";

  const initials = accountName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-[#f7f9fc] px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-indigo-600">
              Account / Settings
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Business Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your business identity and account preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={loadProfile}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <ErrorMessage error={error} />

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center gap-3">
            <LoaderCircle className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-sm text-slate-500">
              Loading business profile...
            </span>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">

            {/* LEFT ACCOUNT PANEL */}
            <aside className="space-y-6">

              <div className="overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-400 text-xl font-bold text-slate-950">
                  {initials}
                </div>

                <h2 className="mt-5 text-xl font-bold">
                  {accountName}
                </h2>

                <p className="mt-1 break-all text-sm text-slate-300">
                  {user?.email || profile?.businessEmail || "No email"}
                </p>

                <div className="mt-6 space-y-4 border-t border-slate-700 pt-5">
                  <div>
                    <p className="text-xs text-slate-400">Account Role</p>
                    <p className="mt-1 font-semibold">
                      {user?.role || "TENANT_ADMIN"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">User ID</p>
                    <p className="mt-1 break-all text-xs font-medium">
                      {profile?.userId || user?.userId || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* BUSINESS PREVIEW */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10">
                  <Building2 className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {profile?.businessName || "My Business"}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {profile?.about || "No business description available."}
                </p>

                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">
                  <MapPin className="h-4 w-4" />
                  {profile?.city || "City not provided"}
                  {profile?.state ? `, ${profile.state}` : ""}
                </div>
              </div>

              {/* BILL SETTINGS */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-500/10">
                    <Zap className="h-5 w-5" />
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Billing Settings
                  </h3>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Auto-generate Bills
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Enable automatic electricity bill generation.
                    </p>
                  </div>

                  <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={autoBillEnabled}
                      onChange={handleAutoBillChange}
                      disabled={updatingAutoBill || !user?.userId}
                      className="peer sr-only"
                    />

                    <span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-indigo-600 peer-disabled:opacity-50 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:after:translate-x-5" />
                  </label>
                </div>
              </div>
            </aside>

            {/* RIGHT BUSINESS FORM */}
            <section className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">

              <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-500/10">
                    <Building2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Business Information
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Information displayed throughout your dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 p-6">

                <Field label="Business Name" icon={Building2}>
                  <input
                    name="businessName"
                    value={form.businessName}
                    onChange={handleChange}
                    placeholder="Enter business name"
                    required
                    className={inputClass}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Business Email" icon={Mail}>
                    <input
                      type="email"
                      name="businessEmail"
                      value={form.businessEmail}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Business Mobile" icon={Phone}>
                    <input
                      type="tel"
                      name="businessMobile"
                      value={form.businessMobile}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Business Address" icon={MapPin}>
                  <input
                    name="businessAddress"
                    value={form.businessAddress}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="City" icon={MapPin}>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="State" icon={MapPin}>
                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Pincode" icon={MapPin}>
                    <input
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Website" icon={Globe}>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={form.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className={inputClass}
                  />
                </Field>

                <Field label="About Business" icon={FileText}>
                  <textarea
                    name="about"
                    value={form.about}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us about your business..."
                    className={`${inputClass} resize-none`}
                  />
                </Field>

                <div className="flex justify-end border-t border-slate-100 pt-6 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50 dark:shadow-none"
                  >
                    {saving ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}

                    {saving ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
