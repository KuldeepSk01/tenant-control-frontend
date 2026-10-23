
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  MapPin,
  MapPinned,
  Landmark,
  Hash,
  FileText,
  Save,
  LoaderCircle,
  ShieldCheck,
  Info,
  ChevronDown,
  BuildingComplexIcon,
} from "lucide-react";

import { createProperty } from "../api/propertyApi";
import ErrorMessage from "../components/ErrorMessage";

const initialForm = {
  name: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  description: "",
  propertyType:"",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 " +
  "bg-slate-50/70 py-3 pl-11 pr-4 " +
  "text-sm text-slate-900 outline-none " +
  "transition-all duration-200 " +
  "placeholder:text-slate-400 " +
  "focus:border-indigo-500 focus:bg-white " +
  "focus:ring-4 focus:ring-indigo-100 " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "dark:border-slate-700 dark:bg-slate-800 " +
  "dark:text-white dark:placeholder:text-slate-500 " +
  "dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

  const PROPERTY_TYPES = [
  { value: "RENTAL_PROPERTY", label: "Rental Property" },
  { value: "PG", label: "Paying Guest (PG)" },
  { value: "HOSTEL", label: "Hostel" },
  { value: "HOTEL", label: "Hotel / OYO" },
  { value: "GUEST_HOUSE", label: "Guest House" },
  { value: "SERVICED_APARTMENT", label: "Serviced Apartment" },
];

function FormField({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  placeholder,
  required = false,
  disabled = false,
  type = "text",
  maxLength,
  inputMode,
  autoComplete,
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export default function AddProperty() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "pincode"
          ? value.replace(/\D/g, "").slice(0, 6)
          : value,
    }));
  }

  function validateForm() {
    if (form.name.trim().length < 2) {
      return "Property name must contain at least 2 characters.";
    }

    if (!form.address.trim()) {
      return "Please enter the property address.";
    }

    if (!form.city.trim()) {
      return "Please enter the city.";
    }

    if (!form.state.trim()) {
      return "Please enter the state.";
    }

    if (!form.propertyType.trim()) {
      return "Please enter the state.";
    }

    if (!/^[1-9][0-9]{5}$/.test(form.pincode)) {
      return "Please enter a valid 6-digit Indian PIN code.";
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError(null);

    const validationError = validateForm();

    if (validationError) {
      setError(new Error(validationError));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        description: form.description.trim(),
        propertyType : form.propertyType.trim(),
      };

      await createProperty(payload);

      navigate("/properties", {
        replace: true,
        state: {
          message: "Property created successfully.",
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
            to="/properties"
            className="font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400"
          >
            Properties
          </Link>

          <span className="text-slate-300">/</span>

          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            Add Property
          </span>
        </div>

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              <Building2 className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Add New Property
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Register a new property and manage its rooms and tenants.
              </p>
            </div>
          </div>

          <Link
            to="/properties"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Link>
        </div>

        <ErrorMessage error={error} />

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >

          {/* PROPERTY SECTION */}
          <div className="border-b border-slate-100 px-6 py-6 dark:border-slate-800 sm:px-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Property Information
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Basic details about the property.
                </p>
              </div>
            </div>

            <FormField
              label="Property Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              icon={Building2}
              placeholder="e.g. Green Valley Residency"
              required
              disabled={loading}
              autoComplete="off"
            />
          </div>

{/* PROPERTY TYPE SECTION */}
<div className="border-b border-slate-100 px-6 py-6 dark:border-slate-800 sm:px-8">
  <div className="mb-6 flex items-center gap-3">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
      <Building2 className="h-5 w-5" />
    </div>

    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
        Property Type
      </h2>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Select the type of property or accommodation your business manages.
      </p>
    </div>
  </div>

    <div className="relative">
      <select
        id="propertyType"
        name="propertyType"
        value={form.propertyType}
        onChange={handleChange}
        required
        className={`${inputClass} cursor-pointer appearance-none pr-11`}
      >
        <option value="" disabled>
          Select Property Type
        </option>

        {PROPERTY_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>

  {form.propertyType && (
    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 dark:border-indigo-500/20 dark:bg-indigo-500/10">
      <p className="text-sm text-indigo-700 dark:text-indigo-300">
        {form.propertyType === "HOTEL"
          ? "Manage hotel rooms, guest bookings, check-ins, and check-outs."
          : form.propertyType === "PG"
            ? "Manage paying guests, rooms, rent, and electricity bills."
            : form.propertyType === "HOSTEL"
              ? "Manage hostel rooms, occupants, and accommodation."
              : form.propertyType === "RENTAL_PROPERTY"
                ? "Manage rental properties, tenants, rooms, and monthly bills."
                : "Manage your property and accommodation details."}
      </p>
    </div>
  )}
</div>



          {/* LOCATION SECTION */}
          <div className="border-b border-slate-100 px-6 py-7 dark:border-slate-800 sm:px-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <MapPinned className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Location Details
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Where is this property located?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField
                  label="Street Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  icon={MapPin}
                  placeholder="Building number, street, area or locality"
                  required
                  disabled={loading}
                  autoComplete="street-address"
                />
              </div>

              <FormField
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                icon={MapPinned}
                placeholder="e.g. Greater Noida"
                required
                disabled={loading}
                autoComplete="address-level2"
              />

              <FormField
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                icon={Landmark}
                placeholder="e.g. Uttar Pradesh"
                required
                disabled={loading}
                autoComplete="address-level1"
              />

              <div>
                <FormField
                  label="PIN Code"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  icon={Hash}
                  placeholder="Enter 6-digit PIN code"
                  required
                  disabled={loading}
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="postal-code"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Enter a valid 6-digit Indian postal PIN code.
                </p>
              </div>
            </div>
          </div>

          {/* DESCRIPTION SECTION */}
          <div className="px-6 py-7 sm:px-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Additional Information
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Optional information about your property.
                </p>
              </div>
            </div>

            <label htmlFor="description" className={labelClass}>
              Property Description

              <span className="ml-2 text-xs font-normal text-slate-400">
                Optional
              </span>
            </label>

            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              disabled={loading}
              placeholder="Describe the property, amenities, parking facilities, nearby landmarks, etc."
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10"
            />

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />

              <div>
                <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                  What's next?
                </p>

                <p className="mt-1 text-xs leading-5 text-indigo-700 dark:text-indigo-300">
                  After creating the property, you can add rooms,
                  configure electricity meters and assign tenants
                  using their respective modules.
                </p>
              </div>
            </div>
          </div>

          {/* FORM FOOTER */}
          <div className="flex flex-col-reverse gap-4 border-t border-slate-100 bg-slate-50/60 px-6 py-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-8">

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Fields marked * are required
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Link
                to="/properties"
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
                    Saving Property...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Property
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
