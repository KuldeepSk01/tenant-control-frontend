
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  LockKeyhole,
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { resentOTP, verifyOTP } from "../api/authApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:2027";
const OTP_LENGTH = 6;
const OTP_EXPIRY = 300;
const RESEND_COOLDOWN = 60;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [expirySeconds, setExpirySeconds] = useState(OTP_EXPIRY);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/signup", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (expirySeconds <= 0) return;

    const timer = setInterval(() => {
      setExpirySeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [expirySeconds]);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = setInterval(() => {
      setResendSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendSeconds]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  const handleChange = (index, value) => {
    const clean = value.replace(/\D/g, "");

    if (!clean) {
      setOtp((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    if (clean.length > 1) {
      fillOtp(clean, index);
      return;
    }

    setOtp((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });

    setError("");

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const fillOtp = (value, startIndex = 0) => {
    const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH - startIndex);

    setOtp((prev) => {
      const next = [...prev];

      digits.split("").forEach((digit, offset) => {
        next[startIndex + offset] = digit;
      });

      return next;
    });

    const nextIndex = Math.min(startIndex + digits.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
    setError("");
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text");
    fillOtp(pasted);
  };

  const getErrorMessage = async (response, fallback) => {
    try {
      const data = await response.json();
      return typeof data.message === "string" ? data.message : fallback;
    } catch {
      return fallback;
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    const code = otp.join("");

    if (code.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    if (expirySeconds <= 0) {
      setError("Your OTP has expired. Please request a new one.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await verifyOTP({
        email,
        otp: code,
      });

      if (!response.status) {
        throw new Error(
          await getErrorMessage(response, "Invalid or expired OTP.")
        );
      }

      setSuccess("Your email has been verified successfully!");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || loading) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      

      const resendResponse = await resentOTP({email});

      if (!resendResponse.status) {
        throw new Error(
          await getErrorMessage(response, "Unable to resend OTP.")
        );
      }

      setOtp(Array(OTP_LENGTH).fill(""));
      setExpirySeconds(OTP_EXPIRY);
      setResendSeconds(RESEND_COOLDOWN);
      setSuccess("A new verification code has been requested.");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "Unable to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />

          <div className="p-7 sm:p-9">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center">
                  <MailCheck className="w-10 h-10 text-blue-600" />
                </div>

                <span className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
              Verify your email
            </h1>

            <p className="text-slate-500 text-sm text-center mt-3 leading-relaxed">
              We've sent a 6-digit verification code to
            </p>

            <p className="text-blue-600 font-semibold text-center mt-1 break-all">
              {email}
            </p>

            <form onSubmit={handleVerify} className="mt-8">
              <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">
                Enter verification code
              </label>

              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={6}
                    value={digit}
                    onChange={(event) => handleChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    disabled={loading }
                    aria-label={`OTP digit ${index + 1}`}
                    className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 outline-none transition-all
                      ${
                        error
                          ? "border-red-300 bg-red-50"
                          : digit
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-slate-50 text-slate-800"
                      }
                      focus:border-blue-600 focus:ring-4 focus:ring-blue-100
                      disabled:opacity-60`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 mt-5">
                <Clock3 className={`w-4 h-4 ${expirySeconds === 0 ? "text-red-500" : "text-slate-400"}`} />
                <span className={`text-sm font-medium ${expirySeconds === 0 ? "text-red-500" : "text-slate-500"}`}>
                  {expirySeconds === 0
                    ? "Verification code expired"
                    : `Code expires in ${formatTime(expirySeconds)}`}
                </span>
              </div>

              {error && (
                <div role="alert" className="mt-5 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              {success && (
                <div role="status" className="mt-5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.join("").length !== OTP_LENGTH || expirySeconds === 0}
                className="w-full mt-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Verified
                  </>
                ) : (
                  <>
                    <LockKeyhole className="w-5 h-5" />
                    Verify Email
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 text-center">
              <p className="text-sm text-slate-500">
                Didn't receive the code?
              </p>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendSeconds > 0 || loading}
                className="mt-2 inline-flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {loading
                  ? "Sending..."
                  : resendSeconds > 0
                  ? `Resend OTP in ${resendSeconds}s`
                  : "Resend OTP"}
              </button>
            </div>

            <div className="border-t border-slate-100 mt-8 pt-6">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mx-auto transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-slate-400 text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure verification powered by Tenant Control</span>
        </div>
      </div>
    </div>
  );
}
