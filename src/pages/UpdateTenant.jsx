import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { getTenant, updateTenant } from "../api/tenantApi";
import ErrorMessage from "../components/ErrorMessage";
import Header from "../components/Header";
import Footer from "../components/Footer";

const emptyForm = { name: "", email: "", mobile: "", address: "" };

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 " +
  "placeholder:text-slate-400 outline-none transition focus:border-indigo-500 " +
  "focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 " +
  "dark:text-slate-100 dark:placeholder:text-slate-500";

function FormField({ id, label, icon: Icon, required, children }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <Icon className="h-4 w-4 text-indigo-500" />
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function UpdateTenant() {
  const { tenantId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    let objectUrl = null;

    async function loadTenant() {
      setLoading(true);
      setError(null);
      setExistingImageUrl(null);

      try {
        const response = await getTenant(tenantId);
        const tenant = response?.data?.data ?? response?.data ?? response;
        if (cancelled) return;

        setForm({
          name: tenant?.name ?? "",
          email: tenant?.email ?? "",
          mobile: tenant?.mobile ?? "",
          address: tenant?.address ?? "",
        });

        // Profile images may require a Bearer token. Fetch them as blobs
        // instead of using the protected URL directly in an <img> tag.
        if (tenant?.profileImageUrl) {
          try {
            const imagePath = tenant.profileImageUrl;
            const imageUrl = /^https?:\/\//i.test(imagePath)
              ? imagePath
              : new URL(imagePath, import.meta.env.VITE_API_BASE_URL || window.location.origin).href;
            const token = localStorage.getItem("token");
            const imageResponse = await fetch(imageUrl, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              signal: controller.signal,
            });
            if (imageResponse.ok) {
              objectUrl = URL.createObjectURL(await imageResponse.blob());
              if (!cancelled) setExistingImageUrl(objectUrl);
            }
          } catch (imageFetchError) {
            if (imageFetchError.name !== "AbortError") {
              console.warn("Unable to load tenant profile image", imageFetchError);
            }
          }
        }
      } catch (fetchError) {
        if (!cancelled) setError(fetchError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTenant();
    return () => {
      cancelled = true;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [tenantId]);

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(profileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] ?? null;
    setImageError("");
    if (!file) {
      setProfileImage(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Profile image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }
    setProfileImage(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (profileImage) formData.append("profileImage", profileImage);
      await updateTenant(tenantId, formData);
      navigate(`/tenants/${tenantId}`);
    } catch (submitError) {
      setError(submitError);
    } finally {
      setSaving(false);
    }
  }

  const initials = (form.name || "T")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              <UserRound className="h-4 w-4" /> Tenant Management <span className="text-slate-400">/</span> Edit Profile
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Update Tenant</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Keep your tenant's contact details and profile photo up to date.
            </p>
          </div>
          <Link
            to={`/tenants/${tenantId}`}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Details
          </Link>
        </div>

        {error && <div className="mb-6"><ErrorMessage error={error} /></div>}

        {loading ? (
          <div className="flex min-h-80 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-slate-500">Loading tenant details...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-5">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-7 text-white">
                  <div className="relative mx-auto h-28 w-28">
                    {previewUrl || existingImageUrl ? (
                      <img src={previewUrl || existingImageUrl} alt="Tenant profile" className="h-full w-full rounded-3xl border-4 border-white/30 object-cover shadow-xl" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-3xl border-4 border-white/30 bg-white/20 text-3xl font-bold shadow-xl">
                        {initials}
                      </div>
                    )}
                    <span className="absolute -bottom-2 -right-2 rounded-full bg-white p-2 text-indigo-600 shadow-md"><Camera className="h-4 w-4" /></span>
                  </div>
                  <h2 className="mt-5 truncate text-center text-lg font-bold">{form.name || "Tenant"}</h2>
                  <p className="mt-1 text-center text-xs text-indigo-100">Tenant Profile</p>
                </div>
                <div className="p-5">
                  <label htmlFor="profileImage" className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <ImagePlus className="h-4 w-4" /> {profileImage ? "Change Selected Photo" : "Upload New Photo"}
                  </label>
                  <input id="profileImage" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                  <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">JPG, PNG or WebP · Max 5 MB</p>
                  {profileImage && (
                    <button type="button" onClick={() => { setProfileImage(null); setImageError(""); }} className="mt-3 flex w-full items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600">
                      <X className="h-3.5 w-3.5" /> Discard selected photo
                    </button>
                  )}
                  {imageError && <p role="alert" className="mt-3 text-sm text-rose-600">{imageError}</p>}
                </div>
              </section>
              <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <p>Changes to tenant details will be saved securely to your tenant management system.</p>
              </div>
            </aside>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-6 py-6 dark:border-slate-800 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><UserRound className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Edit the tenant's name and contact information.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6 px-6 py-7 sm:px-8">
                <FormField id="name" label="Full Name" icon={UserRound} required>
                  <input id="name" name="name" type="text" autoComplete="name" value={form.name} onChange={handleChange} placeholder="Enter tenant name" required className={inputClass} />
                </FormField>
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField id="mobile" label="Mobile Number" icon={Phone} required>
                    <input id="mobile" name="mobile" type="tel" autoComplete="tel" value={form.mobile} onChange={handleChange} placeholder="Enter mobile number" required className={inputClass} />
                  </FormField>
                  <FormField id="email" label="Email Address" icon={Mail}>
                    <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="name@example.com" className={inputClass} />
                  </FormField>
                </div>
                <FormField id="address" label="Residential Address" icon={MapPin}>
                  <textarea id="address" name="address" rows={4} value={form.address} onChange={handleChange} placeholder="Enter tenant's residential address" className={`${inputClass} resize-y`} />
                </FormField>
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-end sm:px-8">
                <Link to={`/tenants/${tenantId}`} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">Cancel</Link>
                <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </section>
          </form>
        )}
      </main>
    </div>
  );
}
