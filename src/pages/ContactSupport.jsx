import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  Headset,
  Mail,
  MessageSquareText,
  Send,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock3,
  HelpCircle,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
// import { createSupportQuery } from "../api/supportApi";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300";

const QUERY_TYPES = [
  { value: "TECHNICAL", label: "Technical Support" },
  { value: "BILLING", label: "Billing & Payments" },
  { value: "SUBSCRIPTION", label: "Subscription Issues" },
  { value: "ACCOUNT", label: "Account & Profile" },
  { value: "PROPERTY", label: "Property Management" },
  { value: "FEATURE_REQUEST", label: "Feature Request" },
  { value: "OTHER", label: "Other" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const initialForm = {
  subject: "",
  queryType: "TECHNICAL",
  priority: "MEDIUM",
  message: "",
};

export default function ContactSupport() {
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.subject.trim() || !form.message.trim()) {
      setError("Subject and message are required.");
      return;
    }

    if (form.message.trim().length < 10) {
      setError("Please enter at least 10 characters in your message.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
    //   await createSupportQuery({
    //     subject: form.subject.trim(),
    //     queryType: form.queryType,
    //     priority: form.priority,
    //     message: form.message.trim(),
    //   });

      setSuccess(
        "Your support query has been submitted successfully. Our support team will review it."
      );

      setForm(initialForm);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to submit your query. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc] dark:bg-slate-950">

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600 dark:text-slate-400"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Headset size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Contact Support
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Submit your questions, report issues, or request assistance.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT INFORMATION */}
          <div className="space-y-6 lg:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 p-6 dark:border-slate-800">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <MessageSquareText
                    size={19}
                    className="text-indigo-600"
                  />
                  Support Center
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Our support team can assist with account management,
                  property operations, subscriptions, and technical problems.
                </p>
              </div>

              <div className="space-y-5 p-6">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Secure Support
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Your query is associated with your signed-in account.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10">
                    <Clock3 size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Query Tracking
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Submitted queries can be tracked once the ticket
                      history feature is enabled.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                    <HelpCircle size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Detailed Information
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Include relevant error messages and steps to reproduce
                      the problem for faster investigation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACCOUNT INFORMATION */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 dark:border-indigo-500/20 dark:bg-indigo-500/10">
              <div className="mb-3 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <Mail size={18} />
                <h3 className="text-sm font-bold">Submitting As</h3>
              </div>

              <p className="font-semibold text-slate-900 dark:text-white">
                {user?.name || "Administrator"}
              </p>

              <p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-400">
                {user?.email || "Signed-in account"}
              </p>

              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Account details will be identified from your login session.
              </p>
            </div>
          </div>

          {/* RIGHT CONTACT FORM */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-6 py-6 dark:border-slate-800 sm:px-8">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Write to Support Manager
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Fill in the details below to create a support query.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                {/* ERROR */}
                {error && (
                  <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                  >
                    <AlertCircle size={19} className="shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* SUCCESS */}
                {success && (
                  <div
                    role="status"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                  >
                    <CheckCircle2 size={19} className="shrink-0" />
                    <p>{success}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* SUBJECT */}
                  <div>
                    <label htmlFor="subject" className={labelClass}>
                      Subject <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="e.g. Unable to generate electricity bill"
                      maxLength={150}
                      required
                      className={inputClass}
                    />
                  </div>

                  {/* QUERY TYPE + PRIORITY */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="queryType" className={labelClass}>
                        Query Type
                      </label>

                      <select
                        id="queryType"
                        name="queryType"
                        value={form.queryType}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        {QUERY_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priority" className={labelClass}>
                        Priority
                      </label>

                      <select
                        id="priority"
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        {PRIORITIES.map((priority) => (
                          <option
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* MESSAGE */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label htmlFor="message" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Describe Your Query
                        <span className="text-red-500"> *</span>
                      </label>

                      <span className="text-xs text-slate-400">
                        {form.message.length}/2000
                      </span>
                    </div>

                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Please explain your issue in detail..."
                      rows={7}
                      minLength={10}
                      maxLength={2000}
                      required
                      className={`${inputClass} resize-y`}
                    />

                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Do not include passwords, OTPs, or other sensitive
                      authentication information.
                    </p>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setForm(initialForm);
                      setError("");
                      setSuccess("");
                    }}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Clear Form
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
                  >
                    {saving ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Query
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
