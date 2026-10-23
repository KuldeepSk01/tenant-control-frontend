import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Building2,
  Mail,
  Smartphone,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Users,
  Zap,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import { login } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";

import { getMyAdminProfile } from "../api/adminApi";

export default function Login() {
  const navigate = useNavigate();
  const { loginUser, updateUserProfile } = useAuth();

  const [loginWith, setLoginWith] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("EMAIL");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEmail = loginType === "EMAIL";

  function changeLoginType(type) {
    setLoginType(type);
    setLoginWith("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");

    const identifier = loginWith.trim();

    if (!identifier || !password) {
      setError("Please enter your login details.");
      return;
    }

    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isEmail && !/^[0-9]{10}$/.test(identifier)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const response = await login(identifier, loginType, password);

      if (!response || !response.accessToken) {
        throw new Error("Invalid response from server. Please try again.");
      }

      loginUser(response.accessToken, {
        email: response.email,
        mobile: response.mobile,
        name: response.name,
        role: response.role,
        userId: response.userId,
      });
      // Fetch user profile after successful login
      const profileResponse = await getMyAdminProfile();
      const userProfileData = profileResponse?.data || profileResponse;

      const userProfileDataObj = {
        publicId: userProfileData.publicId,
        userId: userProfileData.userId,
        userName: userProfileData.userName,
        businessName: "Kuldeep Sk's Business",
        businessLogo: null,
        businessEmail: "ksk105200@gmail.com",
        businessMobile: "7827711985",
        businessAddress: "Not provided",
        city: "Not provided",
        state: "Not provided",
        pincode: null,
        about: "Welcome to your business management dashboard.",
      };

      updateUserProfile(userProfileDataObj);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed. Please try again.");
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
      {/* LEFT: BRANDING PANEL */}
      <div className="relative hidden min-h-screen overflow-hidden bg-[#101d3d] lg:flex lg:flex-col lg:justify-between">
        {/* Decorative gradients */}
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
            All-in-one management platform
          </div>

          <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
            Manage properties.
            <br />
            Empower tenants.
            <br />
            <span className="text-indigo-400">Simplify everything.</span>
          </h2>

          <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
            One powerful platform to manage your properties, tenants,
            electricity billing, and payments.
          </p>

          {/* Feature cards */}
          <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">
            <FeatureCard
              icon={Building2}
              title="Property Management"
              description="Organize rooms and properties"
            />
            <FeatureCard
              icon={Users}
              title="Tenant Management"
              description="Keep tenant records organized"
            />
            <FeatureCard
              icon={Zap}
              title="Electricity Billing"
              description="Track readings and bills"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Secure Access"
              description="Role-based account access"
            />
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 px-12 py-6 text-xs text-slate-400 xl:px-16">
          <span>© {new Date().getFullYear()} TenantControl</span>
          <span>Built for better management</span>
        </div>
      </div>

      {/* RIGHT: LOGIN FORM */}
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
            {/* Heading */}
            <div className="mb-9">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <LockKeyhole className="h-6 w-6" />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your credentials to access your TenantControl dashboard.
              </p>
            </div>

            {/* Login type switcher */}
            <div className="mb-7">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Sign in using
              </p>

              <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1.5">
                <button
                  type="button"
                  onClick={() => changeLoginType("EMAIL")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                    isEmail
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>

                <button
                  type="button"
                  onClick={() => changeLoginType("MOBILE")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                    !isEmail
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </button>
              </div>
            </div>

            <ErrorMessage error={error} />

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email / Mobile */}
              <div>
                <label
                  htmlFor="loginWith"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  {isEmail ? "Email address" : "Mobile number"}
                </label>

                <div className="relative">
                  {isEmail ? (
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  ) : (
                    <Smartphone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  )}

                  <input
                    id="loginWith"
                    type={isEmail ? "email" : "tel"}
                    inputMode={isEmail ? "email" : "numeric"}
                    autoComplete={isEmail ? "username" : "tel"}
                    placeholder={
                      isEmail
                        ? "name@example.com"
                        : "Enter 10-digit mobile number"
                    }
                    value={loginWith}
                    onChange={(e) => setLoginWith(e.target.value)}
                    maxLength={isEmail ? undefined : 10}
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
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to dashboard
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Signup */}
            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Create account
              </Link>
            </p>

            {/* Security note */}
            <div className="mt-10 flex items-center justify-center gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Secure account access
            </div>
          </div>
        </div>

        <div className="pb-6 text-center text-xs text-slate-400 lg:hidden">
          © {new Date().getFullYear()} TenantControl
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm transition hover:bg-white/[0.1]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="text-sm font-semibold text-white">{title}</h3>

      <p className="mt-1.5 text-xs leading-5 text-slate-400">{description}</p>
    </div>
  );
}
