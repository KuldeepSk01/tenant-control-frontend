
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Building2,
  UserRound,
  Mail,
  Smartphone,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  LoaderCircle,
  Zap,
  Users,
  BadgeCheck,
} from "lucide-react";

import { signup } from "../api/authApi";
import ErrorMessage from "../components/ErrorMessage";

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  password: "",
};

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const passwordStrength =
    Object.values(passwordChecks).filter(Boolean).length;

  const strengthLabel =
    passwordStrength <= 2
      ? "Weak"
      : passwordStrength <= 4
      ? "Medium"
      : "Strong";

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      mobile: form.mobile.trim(),
      password: form.password,
    };

    if (payload.name.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(payload.mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!Object.values(passwordChecks).every(Boolean)) {
      setError(
        "Password must contain at least 8 characters, uppercase, lowercase, number and special character."
      );
      return;
    }

    if (payload.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Send only the four fields expected by Spring Boot.
      await signup(payload);

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setForm(initialForm);
      setConfirmPassword("");

      // Redirect immediately after a successful registration.
      navigate("/login", {
        replace: true,
        state: {
          message: "Registration successful. Please sign in.",
        },
      });
    } catch (err) {
      setError(
        err?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 " +
    "bg-slate-50/70 py-3.5 pl-11 pr-4 " +
    "text-sm text-slate-900 outline-none " +
    "transition-all duration-200 " +
    "placeholder:text-slate-400 " +
    "focus:border-indigo-500 focus:bg-white " +
    "focus:ring-4 focus:ring-indigo-100";

  return (
    <div className="min-h-screen bg-[#f7f9fc] lg:grid lg:grid-cols-2">

      {/* LEFT: BRANDING */}
      <div className="relative hidden min-h-screen overflow-hidden bg-[#101d3d] lg:flex lg:flex-col lg:justify-between">

        <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3 px-12 pt-12 xl:px-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-950/30">
            <Building2 className="h-6 w-6 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              TenantControl
            </h1>
            <p className="text-xs text-slate-400">
              Property Management Platform
            </p>
          </div>
        </div>

        <div className="relative z-10 px-12 py-12 xl:px-16">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-xs font-medium text-indigo-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Your property management journey starts here
          </div>

          <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
            Everything you need.
            <br />
            One smart platform.
            <br />
            <span className="text-indigo-400">
              Zero complexity.
            </span>
          </h2>

          <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
            Join TenantControl and bring your properties,
            tenants, electricity billing and payments
            together in one powerful dashboard.
          </p>

          <div className="mt-10 space-y-5">
            <Benefit
              icon={Building2}
              title="Organize your properties"
              description="Manage properties and rooms in one place."
            />

            <Benefit
              icon={Users}
              title="Simplify tenant management"
              description="Keep important tenant information organized."
            />

            <Benefit
              icon={Zap}
              title="Manage electricity billing"
              description="Track readings, bills and payment records."
            />

            <Benefit
              icon={ShieldCheck}
              title="Secure account access"
              description="Access your workspace with role-based security."
            />
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 px-12 py-6 text-xs text-slate-400 xl:px-16">
          <span>© {new Date().getFullYear()} TenantControl</span>
          <span>Built for better management</span>
        </div>
      </div>

      {/* RIGHT: REGISTRATION FORM */}
      <div className="flex min-h-screen flex-col">

        {/* Mobile logo */}
        <div className="flex items-center gap-3 px-6 pt-8 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">
            TenantControl
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-[440px]">

            <div className="mb-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <UserRound className="h-6 w-6" />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Fill in your details to get started with
                TenantControl.
              </p>
            </div>

            <ErrorMessage error={error} />

            {success && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Full name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    minLength={2}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label
                  htmlFor="mobile"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Mobile number
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
                    maxLength={10}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password strength */}
                {form.password && (
                  <div className="mt-3">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            passwordStrength >= level
                              ? passwordStrength <= 2
                                ? "bg-red-400"
                                : passwordStrength <= 4
                                ? "bg-amber-400"
                                : "bg-emerald-500"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Password strength
                      </span>
                      <span
                        className={`font-semibold ${
                          passwordStrength <= 2
                            ? "text-red-500"
                            : passwordStrength <= 4
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {strengthLabel}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Use 8+ characters, uppercase, lowercase,
                      a number and a special character.
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {confirmPassword && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      confirmPassword === form.password
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {confirmPassword === form.password
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Sign in
              </Link>
            </p>

            <div className="mt-9 flex items-center justify-center gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              Secure account registration
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Benefit({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/15 text-indigo-300">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}
