
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronDown,
  DoorOpen,
  Hash,
  IndianRupee,
  Info,
  Layers,
  LoaderCircle,
  Plus,
  Save,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { getProperties } from "../api/propertyApi";
import { createRoom } from "../api/roomApi";
import ErrorMessage from "../components/ErrorMessage";

const initialForm = {
  propertyId: "",
  roomNumber: "",
  floor: "",
  roomType: "",
  rent: "",
  securityDeposit: "",
  status: "AVAILABLE",
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
  min,
  step,
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
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
          min={min}
          step={step}
          className={inputClass}
        />
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AddRoom() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadProperties() {
      setPropertiesLoading(true);

      try {
        const response = await getProperties();

        const data = response?.data;

        const propertyList = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : [];

        if (!ignore) {
          setProperties(propertyList);
        }
      } catch (fetchError) {
        if (!ignore) {
          setError(fetchError);
        }
      } finally {
        if (!ignore) {
          setPropertiesLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      ignore = true;
    };
  }, []);

  const selectedProperty = useMemo(
    () =>
      properties.find(
        (property) =>
          String(property.propertyId || property.id) === form.propertyId
      ),
    [properties, form.propertyId]
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!form.propertyId) {
      return "Please select a property.";
    }

    if (!form.roomNumber.trim()) {
      return "Please enter a room number.";
    }

    if (
      form.floor.trim() === "" ||
      !Number.isInteger(Number(form.floor))
    ) {
      return "Please enter a valid floor number.";
    }

    if (!form.roomType.trim()) {
      return "Please enter a room type.";
    }

    if (
      form.rent === "" ||
      !Number.isFinite(Number(form.rent)) ||
      Number(form.rent) < 0
    ) {
      return "Please enter a valid rent amount.";
    }

    if (
      form.securityDeposit === "" ||
      !Number.isFinite(Number(form.securityDeposit)) ||
      Number(form.securityDeposit) < 0
    ) {
      return "Please enter a valid security deposit.";
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
      const { propertyId, ...roomData } = form;

      const payload = {
        ...roomData,
        roomNumber: roomData.roomNumber.trim(),
        roomType: roomData.roomType.trim(),
        floor: Number(roomData.floor),
        rent: Number(roomData.rent),
        securityDeposit: Number(roomData.securityDeposit),
      };

      await createRoom(propertyId, payload);

      navigate("/rooms", {
        replace: true,
        state: {
          message: "Room created successfully.",
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
            to="/rooms"
            className="font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400"
          >
            Rooms
          </Link>

          <span className="text-slate-300">/</span>

          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            Add Room
          </span>
        </div>

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
              <DoorOpen className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Add New Room
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Register a room under one of your properties.
              </p>
            </div>
          </div>

          <Link
            to="/rooms"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Link>
        </div>

        <ErrorMessage error={error} />

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >

          {/* PROPERTY SELECTION */}
          <section className="border-b border-slate-100 px-6 py-7 dark:border-slate-800 sm:px-8">
            <SectionHeading
              icon={Building2}
              title="Property Selection"
              description="Choose the property where this room belongs."
            />

            <label htmlFor="propertyId" className={labelClass}>
              Select Property <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Building2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <select
                id="propertyId"
                name="propertyId"
                value={form.propertyId}
                onChange={handleChange}
                required
                disabled={propertiesLoading || loading}
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="">
                  {propertiesLoading
                    ? "Loading properties..."
                    : "Select a property"}
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

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {selectedProperty && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />

                <div>
                  <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                    {selectedProperty.name}
                  </p>

                  <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                    {[
                      selectedProperty.address,
                      selectedProperty.city,
                      selectedProperty.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}

            {!propertiesLoading && properties.length === 0 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                No properties found.{" "}
                <Link
                  to="/properties/add"
                  className="font-semibold underline"
                >
                  Create a property first
                </Link>
                .
              </div>
            )}
          </section>

          {/* ROOM INFORMATION */}
          <section className="border-b border-slate-100 px-6 py-7 dark:border-slate-800 sm:px-8">
            <SectionHeading
              icon={DoorOpen}
              title="Room Information"
              description="Provide the room number, floor, type and occupancy status."
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                label="Room Number"
                name="roomNumber"
                value={form.roomNumber}
                onChange={handleChange}
                icon={Hash}
                placeholder="e.g. A-101"
                required
                disabled={loading}
              />

              <FormField
                label="Floor"
                name="floor"
                type="number"
                value={form.floor}
                onChange={handleChange}
                icon={Layers}
                placeholder="e.g. 1"
                required
                disabled={loading}
                step="1"
              />

              <FormField
                label="Room Type"
                name="roomType"
                value={form.roomType}
                onChange={handleChange}
                icon={DoorOpen}
                placeholder="e.g. SINGLE, DOUBLE"
                required
                disabled={loading}
              />

              <div>
                <label htmlFor="status" className={labelClass}>
                  Room Status
                </label>

                <div className="relative">
                  <CheckCircle2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    disabled={loading}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Available rooms can be selected during tenant assignment.
                </p>
              </div>
            </div>
          </section>

          {/* FINANCIAL INFORMATION */}
          <section className="px-6 py-7 sm:px-8">
            <SectionHeading
              icon={IndianRupee}
              title="Financial Information"
              description="Set the monthly rent and refundable security deposit."
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                label="Monthly Rent (₹)"
                name="rent"
                type="number"
                value={form.rent}
                onChange={handleChange}
                icon={IndianRupee}
                placeholder="e.g. 7500"
                required
                disabled={loading}
                min="0"
                step="0.01"
              />

              <FormField
                label="Security Deposit (₹)"
                name="securityDeposit"
                type="number"
                value={form.securityDeposit}
                onChange={handleChange}
                icon={Wallet}
                placeholder="e.g. 15000"
                required
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />

              <div>
                <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                  Room Assignment
                </p>

                <p className="mt-1 text-xs leading-5 text-indigo-700 dark:text-indigo-300">
                  After creating the room, you can assign a tenant
                  using the Room Assignments module. Rent and security
                  deposit values will be available for the assignment form.
                </p>
              </div>
            </div>
          </section>

          {/* ACTION FOOTER */}
          <div className="flex flex-col-reverse gap-4 border-t border-slate-100 bg-slate-50/60 px-6 py-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Fields marked * are required
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Link
                to="/rooms"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading || propertiesLoading || properties.length === 0}
                className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Saving Room...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Room
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
