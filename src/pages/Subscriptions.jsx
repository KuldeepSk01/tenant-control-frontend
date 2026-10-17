
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  CreditCard,
  Crown,
  IndianRupee,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import { useRazorpay } from "react-razorpay";

import {
  getMySubscriptionPlan,
  getSubscriptionsPlans,
} from "../api/subscriptionsPlanApi";

import {
  createRazorpayOrder,
  verifyPayment,
} from "../api/paymentApi";

import { useAuth } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";

const formatINR = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

function getPlanId(plan) {
  return (
    plan?.planId ??
    plan?.subscriptionPlanId ??
    plan?.id ??
    plan?._id ??
    plan?.adminSubscriptionId ??
    null
  );
}

function getPlanName(plan) {
  return plan?.plan ?? plan?.name ?? plan?.title ?? "Unknown Plan";
}

function getPlanStatus(plan) {
  return plan?.status ?? plan?.planStatus ?? "ACTIVE";
}

function getPlanPrice(plan) {
  const raw =
    plan?.price ??
    plan?.amount ??
    plan?.monthlyPrice ??
    plan?.amountPaid ??
    null;

  if (raw === null || raw === "") return null;

  const value = Number(raw);

  return Number.isFinite(value) ? value : null;
}

function getOriginalPrice(plan) {
  const raw = plan?.originalPrice ?? plan?.regularPrice ?? null;

  if (raw === null || raw === "") return null;

  const value = Number(raw);

  return Number.isFinite(value) ? value : null;
}

function getDuration(plan) {
  const raw =
    plan?.durationInMonths ??
    plan?.durationMonths ??
    plan?.months ??
    null;

  if (raw !== null && raw !== "") {
    const months = Number(raw);

    if (Number.isFinite(months) && months > 0) {
      return months === 1
        ? "1 month"
        : `${months} months`;
    }
  }

  const name = getPlanName(plan).toUpperCase();

  if (name.includes("YEAR") || name.includes("ANNUAL")) {
    return "12 months";
  }

  if (name.includes("QUARTER")) {
    return "3 months";
  }

  if (name.includes("MONTH")) {
    return "1 month";
  }

  return null;
}

function getDiscountPercent(plan) {
  const original = getOriginalPrice(plan);
  const price = getPlanPrice(plan);

  if (
    original === null ||
    price === null ||
    original <= price ||
    original <= 0
  ) {
    return null;
  }

  return Math.round(((original - price) / original) * 100);
}

function getPlanFeatures(plan) {
  if (Array.isArray(plan?.features)) {
    return plan.features.filter(Boolean).map(String);
  }

  if (typeof plan?.features === "string") {
    return plan.features
      .split(",")
      .map((feature) => feature.trim())
      .filter(Boolean);
  }

  return [
    "Property management",
    "Room and tenant management",
    "Electricity billing",
    "Subscription dashboard access",
  ];
}

function isSamePlan(plan, currentPlan) {
  if (!currentPlan) return false;

  const planId = getPlanId(plan);
  const currentId = getPlanId(currentPlan);

  if (planId != null && currentId != null) {
    return String(planId) === String(currentId);
  }

  return (
    getPlanName(plan).trim().toLowerCase() ===
    getPlanName(currentPlan).trim().toLowerCase()
  );
}

function PlanCard({
  plan,
  currentPlan,
  onSubscribe,
  busy,
  paymentPlanId,
  checkoutReady,
}) {
  const planId = getPlanId(plan);
  const name = getPlanName(plan);
  const price = getPlanPrice(plan);
  const originalPrice = getOriginalPrice(plan);
  const discount = getDiscountPercent(plan);
  const duration = getDuration(plan);
  const features = getPlanFeatures(plan);

  const current = isSamePlan(plan, currentPlan);

  const isProcessing =
    busy && String(paymentPlanId) === String(planId);

  const status = String(getPlanStatus(plan)).toUpperCase();
  const inactive = status === "INACTIVE";

  const highlighted =
    current ||
    plan?.isPopular === true ||
    plan?.popular === true ||
    plan?.recommended === true;

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900 ${
        highlighted
          ? "border-indigo-500 ring-1 ring-indigo-500/30"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {highlighted && (
        <div className="bg-indigo-600 px-4 py-2 text-center text-xs font-bold uppercase tracking-wider text-white">
          {current ? "Your Current Plan" : "Recommended Plan"}
        </div>
      )}

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            {highlighted ? (
              <Crown className="h-6 w-6" />
            ) : (
              <Zap className="h-6 w-6" />
            )}
          </div>

          {discount !== null && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              Save {discount}%
            </span>
          )}
        </div>

        <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
          {name}
        </h3>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {plan?.description ||
            "Manage your rental properties with TenantControl."}
        </p>

        <div className="mt-7">
          {originalPrice !== null &&
            price !== null &&
            originalPrice > price && (
              <div className="mb-2 flex items-center gap-3">
                <span className="text-sm text-slate-400 line-through">
                  {formatINR(originalPrice)}
                </span>

                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatINR(originalPrice - price)} off
                </span>
              </div>
            )}

          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {price === null ? "Contact us" : formatINR(price)}
            </span>
          </div>

          {duration && (
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <CalendarDays className="h-4 w-4" />
              {duration} plan
            </p>
          )}
        </div>

        <div className="my-7 h-px bg-slate-100 dark:bg-slate-800" />

        <p className="mb-4 text-sm font-bold text-slate-900 dark:text-white">
          Plan Features
        </p>

        <ul className="flex-1 space-y-3">
          {features.map((feature, index) => (
            <li
              key={`${feature}-${index}`}
              className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" />
              </span>

              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onSubscribe(plan)}
          disabled={
            current ||
            inactive ||
            busy ||
            !checkoutReady ||
            planId == null
          }
          className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            current
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {current ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Current Plan
            </>
          ) : isProcessing ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : inactive ? (
            "Unavailable"
          ) : !checkoutReady ? (
            "Checkout Unavailable"
          ) : (
            <>
              Subscribe Now
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="mt-3 text-center text-xs text-slate-400">
          {current
            ? "This plan is assigned to your account."
            : "Secure checkout powered by Razorpay"}
        </p>
      </div>
    </article>
  );
}

export default function Subscriptions() {
  const {
    Razorpay,
    isLoading: isRazorpayLoading,
    error: razorpayError,
  } = useRazorpay();

  const { user } = useAuth();

  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [paymentPlanId, setPaymentPlanId] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  const checkoutBusyRef = useRef(false);

  const checkoutReady =
    !isRazorpayLoading &&
    !razorpayError &&
    typeof Razorpay === "function";

  const loadSubscriptions = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const [allPlansResponse, myPlanResponse] = await Promise.all([
        getSubscriptionsPlans(),
        getMySubscriptionPlan(),
      ]);

      const plansData = allPlansResponse?.data ?? allPlansResponse;

      const availablePlans = Array.isArray(plansData)
        ? plansData
        : Array.isArray(plansData?.content)
          ? plansData.content
          : Array.isArray(plansData?.plans)
            ? plansData.plans
            : [];

      const myPlan =
        myPlanResponse?.data ??
        myPlanResponse?.plan ??
        (myPlanResponse?.data === null
          ? null
          : myPlanResponse);

      setPlans(availablePlans);
      setCurrentPlan(myPlan);
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const activePlanName = useMemo(
    () =>
      currentPlan
        ? getPlanName(currentPlan)
        : "No Active Subscription",
    [currentPlan]
  );

  async function handleSubscription(plan) {
    if (checkoutBusyRef.current) return;

    checkoutBusyRef.current = true;

    const planId = getPlanId(plan);

    setPaymentPlanId(planId);
    setError(null);
    setSuccessMessage("");

    try {
      if (!checkoutReady) {
        throw new Error(
          "Razorpay Checkout is unavailable. Please refresh and try again."
        );
      }

      if (planId == null) {
        throw new Error("This subscription plan has no valid ID.");
      }

      // Preserve your existing API contract.
      const orderResponse = await createRazorpayOrder(plan.plan);

      const order = orderResponse?.data ?? orderResponse;

      const amount =
        order?.amountInPaise != null
          ? Number(order.amountInPaise)
          : Number(order?.amount) * 100;

      if (
        !order?.keyId ||
        !order?.orderId ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        throw new Error(
          "The server returned incomplete payment order details."
        );
      }

      const checkout = new Razorpay({
        key: order.keyId,
        amount,
        currency: order.currency || "INR",
        name: "TenantControl",
        description: `${getPlanName(plan)} Subscription`,
        order_id: order.orderId,

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.mobile || "",
        },

        theme: {
          color: "#4F46E5",
        },

        handler: async (paymentResponse) => {
          setVerifyingPayment(true);

          try {
            await verifyPayment({
              razorpayOrderId:
                paymentResponse.razorpay_order_id,
              razorpayPaymentId:
                paymentResponse.razorpay_payment_id,
              razorpaySignature:
                paymentResponse.razorpay_signature,
            });

            const updatedResponse =
              await getMySubscriptionPlan();

            const updatedPlan =
              updatedResponse?.data ??
              updatedResponse?.plan ??
              updatedResponse ??
              null;

            setCurrentPlan(updatedPlan);

            setSuccessMessage(
              "Payment verified successfully. Your subscription is now active."
            );
          } catch (verificationError) {
            setError(verificationError);
          } finally {
            setVerifyingPayment(false);
            setPaymentPlanId(null);
            checkoutBusyRef.current = false;
          }
        },

        modal: {
          ondismiss: () => {
            // Do not release the lock while verification is running.
            if (!checkoutBusyRef.current) return;

            // The checkout was dismissed without completing payment.
            // Verification, when invoked, owns the lock release.
            if (!verificationStartedRef.current) {
              setPaymentPlanId(null);
              checkoutBusyRef.current = false;
            }
          },
        },
      });

      checkout.on("payment.failed", (failure) => {
        setError(
          new Error(
            failure?.error?.description ||
              "Payment failed. Please try again."
          )
        );

        setPaymentPlanId(null);
        checkoutBusyRef.current = false;
      });

      checkout.open();
    } catch (paymentError) {
      setError(paymentError);
      setPaymentPlanId(null);
      checkoutBusyRef.current = false;
    }
  }

  // Tracks whether Razorpay's success handler has begun verification.
  const verificationStartedRef = useRef(false);

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
                Billing & Subscriptions
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Subscription Plans
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Choose the right plan to manage your properties,
              rooms, tenants and billing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadSubscriptions(true)}
            disabled={loading || refreshing || paymentPlanId !== null}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh Plans
          </button>
        </div>

        <ErrorMessage error={error || razorpayError} />

        {/* SUCCESS */}
        {successMessage && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{successMessage}</span>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss notification"
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* PAYMENT VERIFICATION */}
        {verifyingPayment && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
          >
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Verifying your payment. Please wait...
          </div>
        )}

        {/* CURRENT SUBSCRIPTION */}
        <section className="relative mb-8 overflow-hidden rounded-2xl bg-[#101d3d] p-6 text-white shadow-xl shadow-slate-200 dark:shadow-none sm:p-8">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-2 text-indigo-200">
                <Crown className="h-5 w-5" />

                <span className="text-xs font-bold uppercase tracking-[0.15em]">
                  Current Subscription
                </span>
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                {loading ? "Loading..." : activePlanName}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                {currentPlan
                  ? "Your current subscription details are shown below. Choose another available plan to change your subscription."
                  : "You don't have a subscription assigned to your account yet. Explore the plans below to get started."}
              </p>
            </div>

            <div className="w-fit rounded-xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
                Plan Status
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-sm font-bold">
                  {currentPlan
                    ? getPlanStatus(currentPlan)
                    : "Not Subscribed"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION TITLE */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />

              <span className="text-xs font-bold uppercase tracking-widest">
                Choose Your Plan
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Simple, Transparent Pricing
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Compare available subscriptions and select the best fit.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Secure payments
          </div>
        </div>

        {/* PLAN GRID */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[440px] animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Wallet className="mx-auto h-12 w-12 text-slate-300" />

            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              No Subscription Plans Available
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Subscription plans are not available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan, index) => (
              <PlanCard
                key={getPlanId(plan) ?? index}
                plan={plan}
                currentPlan={currentPlan}
                onSubscribe={handleSubscription}
                busy={paymentPlanId !== null}
                paymentPlanId={paymentPlanId}
                checkoutReady={checkoutReady}
              />
            ))}
          </div>
        )}

        {/* PAYMENT TRUST FOOTER */}
        <div className="mt-10 grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Secure Checkout
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Payments are processed through Razorpay.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Multiple Payment Options
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Available payment methods are shown during checkout.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Payment Verification
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Your backend verifies payment details before activation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
