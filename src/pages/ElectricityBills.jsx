
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  Filter,
  IndianRupee,
  LoaderCircle,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import {
  generateElectricityBill,
  getElectricityReadings,
  getElectricityBills,
} from "../api/electricityApi";

import { getAssignments } from "../api/tenantAssignmentsApi";
import ErrorMessage from "../components/ErrorMessage";

const PAGE_SIZE = 8;

const EMPTY_FORM = {
  readingId: "",
  assignmentId: "",
  dueDate: "",
};

const EMPTY_FILTERS = {
  meterNumber: "",
  roomNumber: "",
  readingMonth: "",
  status: "",
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

function getBillId(bill) {
  return bill.publicId || bill.billPublicId || bill.id;
}

function getReadingId(reading) {
  return reading.publicId || reading.readingPublicId || reading.id;
}

function getAssignmentId(assignment) {
  return assignment.publicId || assignment.id;
}

function toAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function currency(value) {
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

function number(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const amount = Number(value);

  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
      }).format(amount)
    : "—";
}

function dateLabel(value) {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function escapeHtml(value) {
  return String(value ?? "—").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]
  );
}

function billStatus(status) {
  return String(status || "UNKNOWN").toUpperCase();
}

function StatusBadge({ status }) {
  const normalized = billStatus(status);

  const styles = {
    PAID:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    UNPAID:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
    PARTIALLY_PAID:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
    PENDING:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[normalized] ||
        "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          normalized === "PAID"
            ? "bg-emerald-500"
            : normalized === "UNPAID"
              ? "bg-red-500"
              : "bg-amber-500"
        }`}
      />
      {normalized.replaceAll("_", " ")}
    </span>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
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
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
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

function BillDetails({ bill }) {
  const details = [
    ["Tenant Name", bill.tenantName],
    ["Tenant Mobile", bill.tenantMobile],
    ["Room Number", bill.roomNumber],
    ["Meter Number", bill.meterNumber],
    ["Previous Reading", number(bill.previousReading)],
    ["Current Reading", number(bill.currentReading)],
    ["Units Consumed", number(bill.units)],
    ["Reading Month", dateLabel(bill.readingMonth)],
    ["Due Date", dateLabel(bill.dueDate)],
  ];

  return (
    <>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"
          >
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {label}
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">
              {value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/70 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/10">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Total Amount
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {currency(bill.totalAmount)}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Paid Amount
          </span>
          <span className="font-semibold text-emerald-600">
            {currency(bill.paidAmount)}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-indigo-100 pt-4 dark:border-indigo-500/20">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Remaining Amount
          </span>
          <span className="text-lg font-bold text-red-600 dark:text-red-400">
            {currency(bill.remainingAmount)}
          </span>
        </div>
      </div>
    </>
  );
}

function handlePrint(bill) {
  const printWindow = window.open(
    "",
    "_blank",
    "width=850,height=700"
  );

  if (!printWindow) {
    return false;
  }

  const rows = [
    ["Previous Reading", number(bill.previousReading)],
    ["Current Reading", number(bill.currentReading)],
    ["Units Consumed", number(bill.units)],
    ["Reading Month", dateLabel(bill.readingMonth)],
    ["Due Date", dateLabel(bill.dueDate)],
  ]
    .map(
      ([label, value]) => `
        <tr>
          <th>${escapeHtml(label)}</th>
          <td>${escapeHtml(value)}</td>
        </tr>
      `
    )
    .join("");

  const status = billStatus(bill.status);

  const statusColor =
    status === "PAID"
      ? "#047857"
      : status === "UNPAID"
        ? "#b91c1c"
        : "#92400e";

  printWindow.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Electricity Bill</title>
        <style>
          * { box-sizing: border-box; }

          body {
            margin: 0;
            padding: 30px;
            background: #f1f5f9;
            color: #0f172a;
            font-family: Arial, Helvetica, sans-serif;
          }

          .bill {
            max-width: 760px;
            margin: auto;
            padding: 36px;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(15,23,42,.08);
          }

          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            padding-bottom: 24px;
            border-bottom: 3px solid #4f46e5;
          }

          .brand {
            color: #4f46e5;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          h1 {
            margin: 10px 0 6px;
            font-size: 27px;
          }

          .muted {
            color: #64748b;
            font-size: 13px;
          }

          .status {
            padding: 8px 14px;
            border-radius: 30px;
            background: #f8fafc;
            color: ${statusColor};
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 25px 0;
          }

          .card {
            padding: 17px;
            border-radius: 10px;
            background: #f8fafc;
          }

          .label {
            display: block;
            margin-bottom: 7px;
            color: #64748b;
            font-size: 12px;
          }

          .value {
            font-size: 15px;
            font-weight: 700;
            overflow-wrap: anywhere;
          }

          h2 {
            margin: 28px 0 12px;
            font-size: 16px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            padding: 13px 10px;
            border-bottom: 1px solid #e2e8f0;
            text-align: left;
            font-size: 13px;
          }

          th {
            width: 55%;
            color: #64748b;
            font-weight: 500;
          }

          td {
            font-weight: 700;
            text-align: right;
          }

          .summary {
            margin-top: 26px;
            padding: 22px;
            border-radius: 12px;
            background: #eef2ff;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 15px;
            font-size: 14px;
          }

          .summary-row:last-child {
            margin-bottom: 0;
            padding-top: 15px;
            border-top: 1px solid #c7d2fe;
            font-weight: 700;
          }

          .footer {
            margin-top: 30px;
            padding-top: 18px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 12px;
            line-height: 1.8;
            text-align: center;
          }

          @media (max-width: 600px) {
            body { padding: 10px; }
            .bill { padding: 20px; }
            .grid { grid-template-columns: 1fr; }
            h1 { font-size: 22px; }
          }

          @media print {
            @page { size: A4; margin: 12mm; }
            body { padding: 0; background: #fff; }
            .bill {
              max-width: 100%;
              padding: 0;
              border-radius: 0;
              box-shadow: none;
            }
            .grid { grid-template-columns: 1fr 1fr; }
            .card, .summary {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>

      <body>
        <main class="bill">
          <div class="header">
            <div>
              <div class="brand">TenantControl</div>
              <h1>Electricity Bill</h1>
              <div class="muted">
                Bill Reference:
                ${escapeHtml(getBillId(bill) || "—")}
              </div>
            </div>
            <span class="status">
              ${escapeHtml(status.replaceAll("_", " "))}
            </span>
          </div>

          <div class="grid">
            <div class="card">
              <span class="label">Tenant Name</span>
              <span class="value">
                ${escapeHtml(bill.tenantName)}
              </span>
            </div>
            <div class="card">
              <span class="label">Tenant Mobile</span>
              <span class="value">
                ${escapeHtml(bill.tenantMobile)}
              </span>
            </div>
            <div class="card">
              <span class="label">Room Number</span>
              <span class="value">
                ${escapeHtml(bill.roomNumber)}
              </span>
            </div>
            <div class="card">
              <span class="label">Meter Number</span>
              <span class="value">
                ${escapeHtml(bill.meterNumber)}
              </span>
            </div>
          </div>

          <h2>Electricity Consumption</h2>
          <table>
            <tbody>${rows}</tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>Total Amount</span>
              <strong>${escapeHtml(currency(bill.totalAmount))}</strong>
            </div>
            <div class="summary-row">
              <span>Paid Amount</span>
              <strong>${escapeHtml(currency(bill.paidAmount))}</strong>
            </div>
            <div class="summary-row">
              <span>Remaining Amount</span>
              <strong>${escapeHtml(currency(bill.remainingAmount))}</strong>
            </div>
          </div>

          <div class="footer">
            Please pay any outstanding amount before the due date.
            <div>Thank you for using TenantControl.</div>
          </div>
        </main>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  printWindow.onload = () => {
    printWindow.print();
  };

  // Fallback for browsers that do not fire load for document.write().
  setTimeout(() => {
    if (!printWindow.closed) {
      printWindow.print();
    }
  }, 500);

  return true;
}

export default function ElectricityBills() {
  const [bills, setBills] = useState([]);
  const [readings, setReadings] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  const [selectedBill, setSelectedBill] = useState(null);
  const [page, setPage] = useState(0);

  const loadBills = useCallback(
    async (activeFilters = EMPTY_FILTERS, refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await getElectricityBills(activeFilters);
        setBills(getItems(response));
      } catch (fetchError) {
        setError(fetchError);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  const loadBillOptions = useCallback(async () => {
    setOptionsLoading(true);

    try {
      const [readingsResponse, assignmentsResponse] =
        await Promise.all([
          getElectricityReadings({ size: 1000 }),
          getAssignments(),
        ]);

      setReadings(getItems(readingsResponse));
      setAssignments(getItems(assignmentsResponse));
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBills(EMPTY_FILTERS);
    loadBillOptions();
  }, [loadBills, loadBillOptions]);

  const activeAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          !assignment.moveOutDate &&
          !assignment.movedOutAt &&
          assignment.status !== "MOVED_OUT"
      ),
    [assignments]
  );

  const selectedReading = useMemo(
    () =>
      readings.find(
        (reading) =>
          String(getReadingId(reading)) === String(form.readingId)
      ),
    [readings, form.readingId]
  );

  const selectedAssignment = useMemo(
    () =>
      activeAssignments.find(
        (assignment) =>
          String(getAssignmentId(assignment)) ===
          String(form.assignmentId)
      ),
    [activeAssignments, form.assignmentId]
  );

  const stats = useMemo(() => {
    const totalAmount = bills.reduce(
      (sum, bill) => sum + toAmount(bill.totalAmount),
      0
    );

    const paidAmount = bills.reduce(
      (sum, bill) => sum + toAmount(bill.paidAmount),
      0
    );

    const remainingAmount = bills.reduce(
      (sum, bill) => {
        if (
          bill.remainingAmount !== null &&
          bill.remainingAmount !== undefined
        ) {
          return sum + toAmount(bill.remainingAmount);
        }

        if (
          bill.totalAmount !== null &&
          bill.totalAmount !== undefined &&
          bill.paidAmount !== null &&
          bill.paidAmount !== undefined
        ) {
          return (
            sum +
            Math.max(
              0,
              toAmount(bill.totalAmount) - toAmount(bill.paidAmount)
            )
          );
        }

        return sum;
      },
      0
    );

    return {
      count: bills.length,
      totalAmount,
      paidAmount,
      remainingAmount,
    };
  }, [bills]);

  const totalPages = Math.ceil(bills.length / PAGE_SIZE);

  const paginatedBills = useMemo(() => {
    const start = page * PAGE_SIZE;
    return bills.slice(start, start + PAGE_SIZE);
  }, [bills, page]);

  const visiblePages = useMemo(() => {
    const start = Math.max(
      0,
      Math.min(page - 2, totalPages - 5)
    );

    return Array.from(
      { length: Math.min(5, totalPages) },
      (_, index) => start + index
    );
  }, [page, totalPages]);

  const startItem = bills.length ? page * PAGE_SIZE + 1 : 0;
  const endItem = Math.min((page + 1) * PAGE_SIZE, bills.length);

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

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setError(null);
    setSuccess("");

    if (
      !form.readingId ||
      !form.assignmentId ||
      !form.dueDate
    ) {
      setError(new Error("Please complete all required fields."));
      return;
    }

    setSubmitting(true);

    try {
      await generateElectricityBill({
        readingId: form.readingId,
        assignmentId: form.assignmentId,
        dueDate: form.dueDate,
      });

      setForm(EMPTY_FORM);
      setPage(0);

      await loadBills(appliedFilters, true);

      setSuccess("Electricity bill generated successfully.");
    } catch (submitError) {
      setError(submitError);
    } finally {
      setSubmitting(false);
    }
  }

  function applyFilters(event) {
    event.preventDefault();

    const nextFilters = {
      meterNumber: filters.meterNumber.trim(),
      roomNumber: filters.roomNumber.trim(),
      readingMonth: filters.readingMonth,
      status: filters.status,
    };

    setAppliedFilters(nextFilters);
    setPage(0);
    loadBills(nextFilters);
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(0);
    loadBills(EMPTY_FILTERS);
  }

  function refreshAll() {
    loadBills(appliedFilters, true);
    loadBillOptions();
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
                Electricity Bills
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Electricity Bill Management
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Generate bills, track payments, and manage electricity charges.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshAll}
            disabled={loading || refreshing || submitting}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        <ErrorMessage error={error} />

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
              aria-label="Dismiss message"
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Bills"
            value={stats.count}
            subtitle="Bills in the current result set"
            icon={FileText}
            color="indigo"
          />

          <StatCard
            title="Total Billed"
            value={currency(stats.totalAmount)}
            subtitle="Combined bill amounts"
            icon={IndianRupee}
            color="blue"
          />

          <StatCard
            title="Amount Collected"
            value={currency(stats.paidAmount)}
            subtitle="Payments recorded"
            icon={CheckCircle2}
            color="emerald"
          />

          <StatCard
            title="Outstanding Amount"
            value={currency(stats.remainingAmount)}
            subtitle="Remaining balance"
            icon={Wallet}
            color="amber"
          />
        </div>

        {/* GENERATE BILL */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <Plus className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Generate New Electricity Bill
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Select a meter reading, tenant assignment, and payment due date.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              {/* READING */}
              <div>
                <label htmlFor="readingId" className={labelClass}>
                  Electricity Reading <span className="text-red-500">*</span>
                </label>

                <select
                  id="readingId"
                  name="readingId"
                  value={form.readingId}
                  onChange={updateForm}
                  required
                  disabled={optionsLoading || submitting}
                  className={inputClass}
                >
                  <option value="">
                    {optionsLoading
                      ? "Loading readings..."
                      : "Select a reading"}
                  </option>

                  {readings.map((reading) => {
                    const readingId = getReadingId(reading);

                    if (!readingId) return null;

                    return (
                      <option key={readingId} value={readingId}>
                        {reading.meterNumber ||
                          `Meter ${reading.meterId || readingId}`}
                        {" - "}
                        {reading.readingMonth || "Unknown date"}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* ASSIGNMENT */}
              <div>
                <label htmlFor="assignmentId" className={labelClass}>
                  Tenant Assignment <span className="text-red-500">*</span>
                </label>

                <select
                  id="assignmentId"
                  name="assignmentId"
                  value={form.assignmentId}
                  onChange={updateForm}
                  required
                  disabled={optionsLoading || submitting}
                  className={inputClass}
                >
                  <option value="">
                    {optionsLoading
                      ? "Loading assignments..."
                      : "Select an active assignment"}
                  </option>

                  {activeAssignments.map((assignment) => {
                    const assignmentId = getAssignmentId(assignment);

                    if (!assignmentId) return null;

                    const room =
                      assignment.roomNumber ||
                      assignment.room?.roomNumber ||
                      assignmentId;

                    const tenant =
                      assignment.tenantName ||
                      assignment.tenant?.name ||
                      "Tenant";

                    return (
                      <option
                        key={assignmentId}
                        value={assignmentId}
                      >
                        Room {room} - {tenant}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* DUE DATE */}
              <div>
                <label htmlFor="dueDate" className={labelClass}>
                  Payment Due Date <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={updateForm}
                    required
                    disabled={submitting}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </div>

            {/* SELECTED DETAILS */}
            {(selectedReading || selectedAssignment) && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {selectedReading && (
                  <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-500/10">
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      Selected Reading
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedReading.meterNumber || "Meter"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Current: {number(selectedReading.currentReading)}
                      {" · "}
                      Month: {dateLabel(selectedReading.readingMonth)}
                    </p>
                  </div>
                )}

                {selectedAssignment && (
                  <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Selected Assignment
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedAssignment.tenantName ||
                        selectedAssignment.tenant?.name ||
                        "Tenant"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Room{" "}
                      {selectedAssignment.roomNumber ||
                        selectedAssignment.room?.roomNumber ||
                        "—"}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All fields are required. The backend calculates the bill amount.
              </p>

              <button
                type="submit"
                disabled={
                  submitting ||
                  optionsLoading ||
                  readings.length === 0 ||
                  activeAssignments.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Generate Bill
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* BILL HISTORY */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Electricity Bill History
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {bills.length} bills in the current result set
            </p>

            <form
              onSubmit={applyFilters}
              className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
            >
              <div className="relative">
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

              <input
                name="roomNumber"
                value={filters.roomNumber}
                onChange={updateFilters}
                placeholder="Room number"
                aria-label="Filter by room number"
                className={inputClass}
              />

              <input
                name="readingMonth"
                type="date"
                value={filters.readingMonth}
                onChange={updateFilters}
                aria-label="Filter by reading month"
                className={inputClass}
              />

              <select
                name="status"
                value={filters.status}
                onChange={updateFilters}
                aria-label="Filter by payment status"
                className={inputClass}
              >
                <option value="">All Statuses</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Paid</option>
              </select>

              <button
                type="submit"
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Filter className="h-4 w-4" />
                Apply Filters
              </button>

              <button
                type="button"
                onClick={clearFilters}
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </form>

            {hasFilters && (
              <p className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                Filters are currently applied.
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
          ) : paginatedBills.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
                <FileText className="h-9 w-9" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No electricity bills found
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                {hasFilters
                  ? "No bills match the selected filters."
                  : "Generate your first electricity bill to start tracking payments."}
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
                    <th className="whitespace-nowrap px-5 py-4">Tenant</th>
                    <th className="whitespace-nowrap px-5 py-4">Room / Meter</th>
                    <th className="whitespace-nowrap px-5 py-4">Units</th>
                    <th className="whitespace-nowrap px-5 py-4">Total</th>
                    <th className="whitespace-nowrap px-5 py-4">Paid</th>
                    <th className="whitespace-nowrap px-5 py-4">Remaining</th>
                    <th className="whitespace-nowrap px-5 py-4">Due Date</th>
                    <th className="whitespace-nowrap px-5 py-4">Status</th>
                    <th className="whitespace-nowrap px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedBills.map((bill, index) => (
                    <tr
                      key={getBillId(bill) || index}
                      className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                            <FileText className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {bill.tenantName || "—"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {bill.tenantMobile || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                          Room {bill.roomNumber || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {bill.meterNumber || "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-300">
                        {number(bill.units)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900 dark:text-white">
                        {currency(bill.totalAmount)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {currency(bill.paidAmount)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-red-600 dark:text-red-400">
                        {currency(bill.remainingAmount)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-300">
                        {dateLabel(bill.dueDate)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge status={bill.status} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBill(bill)}
                            title="View bill"
                            aria-label="View bill"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-500/10"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!handlePrint(bill)) {
                                setError(
                                  new Error(
                                    "Please allow pop-ups to print this bill."
                                  )
                                );
                              }
                            }}
                            title="Print bill"
                            aria-label="Print bill"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-500/10"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && (
            <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {startItem}–{endItem} of {bills.length} bills
              </span>

              <span>
                Total billed: {currency(stats.totalAmount)}
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

        {/* BILL DETAILS MODAL */}
        {selectedBill && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedBill(null);
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="bill-details-title"
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                    TenantControl
                  </p>

                  <h3
                    id="bill-details-title"
                    className="text-xl font-bold text-slate-900 dark:text-white"
                  >
                    Electricity Bill Details
                  </h3>

                  <div className="mt-3">
                    <StatusBadge status={selectedBill.status} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBill(null)}
                  aria-label="Close bill details"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <BillDetails bill={selectedBill} />

              <div className="mt-7 flex flex-col justify-end gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setSelectedBill(null)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!handlePrint(selectedBill)) {
                      setError(
                        new Error(
                          "Please allow pop-ups to print this bill."
                        )
                      );
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Printer className="h-4 w-4" />
                  Print Bill
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
