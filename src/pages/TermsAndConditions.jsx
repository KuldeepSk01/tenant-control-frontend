
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Database,
  FileText,
  Headset,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Zap,
} from "lucide-react";


const LAST_UPDATED = "24 October 2026";

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    icon: BookOpen,
    paragraphs: [
      "Welcome to Tenant Control. These Terms and Conditions govern your access to and use of our property management platform, including its website, dashboards, and related services.",
      "By creating an account or using the platform, you agree to comply with these Terms and Conditions. If you do not agree, please discontinue using the service.",
    ],
  },
  {
    id: "eligibility",
    title: "Account Registration & Eligibility",
    icon: ShieldCheck,
    paragraphs: [
      "Users must provide accurate, complete, and up-to-date information during registration and while using the platform.",
      "Account holders are responsible for maintaining the confidentiality of their login credentials and for activities performed through their accounts.",
      "Administrators must ensure that their use of the platform complies with applicable laws and that they have authority to manage the properties and records they enter.",
    ],
  },
  {
    id: "services",
    title: "Platform Services",
    icon: Building2,
    paragraphs: [
      "Tenant Control provides tools for managing properties, rooms, tenants, occupancy records, electricity readings, bills, and related administrative operations.",
      "Available functionality may vary according to the user's role, subscription plan, property type, and enabled features.",
      "The platform is a management tool and does not automatically act as a landlord, property owner, utility provider, or party to agreements between administrators and tenants.",
    ],
  },
  {
    id: "responsibilities",
    title: "User Responsibilities",
    icon: CheckCircle2,
    bullets: [
      "Provide accurate property, tenant, and billing information.",
      "Use the platform only for lawful and authorized purposes.",
      "Obtain necessary permissions before entering another person's personal information.",
      "Maintain the security of account credentials.",
      "Review bills and payment records before sharing them with tenants.",
      "Avoid uploading malicious, misleading, or unauthorized content.",
    ],
  },
  {
    id: "billing",
    title: "Electricity Billing & Meter Readings",
    icon: Zap,
    paragraphs: [
      "The platform may calculate electricity bills using meter readings, consumption units, rates, and other information entered or configured by authorized users.",
      "Property administrators are responsible for verifying meter readings, applicable charges, billing periods, and amounts before issuing bills.",
      "Automatically generated bills should be reviewed for accuracy. The platform does not guarantee that user-entered data or configured rates are correct.",
      "Any billing dispute between a tenant and property administrator should be resolved by the relevant parties in accordance with applicable agreements and law.",
    ],
  },
  {
    id: "subscriptions",
    title: "Subscriptions & Payments",
    icon: CreditCard,
    paragraphs: [
      "Some features may require a paid subscription. Applicable prices, billing periods, taxes, and payment terms will be displayed before purchase.",
      "Payments may be processed through an authorized third-party payment provider. Additional terms of that provider may apply.",
      "Subscription activation, renewal, cancellation, and refund eligibility are subject to the terms presented during purchase and any separately published refund policy.",
      "We may change subscription pricing or features prospectively, subject to applicable notice requirements.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy & Data Protection",
    icon: Database,
    paragraphs: [
      "The platform may process account details, tenant records, property information, contact details, and billing data to provide its services.",
      "Users who upload or manage personal data must ensure they have a lawful basis to do so and must comply with applicable privacy and data protection requirements.",
      "Personal data handling, retention, sharing, and user rights should be described in the platform's separate Privacy Policy.",
    ],
  },
  {
    id: "security",
    title: "Security & Account Access",
    icon: LockKeyhole,
    paragraphs: [
      "We may use authentication, authorization, and other safeguards to protect accounts and platform information.",
      "Users must not attempt unauthorized access, interfere with the platform's operation, or bypass security controls.",
      "We may restrict or suspend access when reasonably necessary to address security risks, suspected misuse, or violations of these terms.",
    ],
  },
  {
    id: "availability",
    title: "Service Availability",
    icon: FileText,
    paragraphs: [
      "We aim to maintain reliable platform availability, but uninterrupted or error-free operation is not guaranteed.",
      "Features may occasionally be unavailable due to maintenance, updates, technical failures, or circumstances outside our reasonable control.",
      "Where appropriate, we may modify, suspend, or discontinue features, subject to applicable contractual and legal obligations.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    icon: Scale,
    paragraphs: [
      "To the extent permitted by applicable law, the platform operator is not responsible for losses caused by inaccurate information entered by users, unauthorized account activity attributable to a user's failure to protect credentials, or disputes between property administrators and tenants.",
      "Nothing in these terms excludes or limits liability that cannot legally be excluded or limited.",
    ],
  },
  {
    id: "termination",
    title: "Account Suspension & Termination",
    icon: ShieldCheck,
    paragraphs: [
      "Accounts may be suspended or terminated for serious violations of these terms, unlawful activity, security threats, or other grounds permitted by applicable law.",
      "Users may request account closure through the available support channels. Data retention or deletion after closure will be governed by applicable law and the Privacy Policy.",
    ],
  },
  {
    id: "changes",
    title: "Changes to These Terms",
    icon: BookOpen,
    paragraphs: [
      "These Terms and Conditions may be updated to reflect changes in the platform, business operations, or legal requirements.",
      "Material changes will be communicated where required by law. The effective or last-updated date will be displayed on this page.",
    ],
  },
  {
    id: "contact",
    title: "Contact & Support",
    icon: Headset,
    paragraphs: [
      "If you have questions about these Terms and Conditions, please contact our support team through the Contact Support page.",
    ],
  },
];

export default function TermsAndConditions() {

  const [activeSection, setActiveSection] = useState(
    "introduction"
  );

  function scrollToSection(id) {
    setActiveSection(id);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc] dark:bg-slate-950">

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* BACK LINK */}
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        {/* HERO */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-7 text-white shadow-lg shadow-indigo-500/10 sm:p-10">
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 right-24 h-32 w-32 rounded-full bg-violet-300/10 blur-2xl" />

          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
              <Scale size={15} />
              Legal Information
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Terms & Conditions
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">
              Please read these terms carefully to understand
              your rights and responsibilities while using
              the Tenant Control platform.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold">
                Last Updated: {LAST_UPDATED}
              </span>

              <span className="rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold">
                Tenant Control Platform
              </span>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* LEFT NAVIGATION */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <BookOpen
                    size={18}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  Table of Contents
                </h2>
              </div>

              <nav
                aria-label="Terms sections"
                className="max-h-[65vh] space-y-1 overflow-y-auto p-3"
              >
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  const active = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() =>
                        scrollToSection(section.id)
                      }
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold transition ${
                        active
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                          : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon size={17} className="shrink-0" />

                      <span className="min-w-0 flex-1">
                        {index + 1}. {section.title}
                      </span>

                      <ChevronRight
                        size={15}
                        className="shrink-0 opacity-60"
                      />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* SUPPORT CARD */}
            <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/10">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                <Headset size={21} />
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Need Clarification?
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-400">
                Have a question about our policies?
                Our support team is here to help.
              </p>

              <Link
                to="/contact-support"
                className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Contact Support
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </aside>

          {/* TERMS CONTENT */}
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-6 py-6 dark:border-slate-800 sm:px-9">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck
                  size={19}
                  className="text-emerald-600"
                />

                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Platform Usage Agreement
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Understanding Your Agreement
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                These terms explain how Tenant Control may be used,
                the responsibilities of account holders,
                and important conditions relating to billing,
                subscriptions, and data management.
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sections.map((section, index) => {
                const Icon = section.icon;

                return (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28 px-6 py-8 sm:px-9"
                  >
                    <div className="mb-5 flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <Icon size={21} />
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Section {String(index + 1).padStart(2, "0")}
                        </p>

                        <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                          {section.title}
                        </h2>
                      </div>
                    </div>

                    {section.paragraphs?.map((paragraph, i) => (
                      <p
                        key={i}
                        className="mb-4 text-sm leading-8 text-slate-600 last:mb-0 dark:text-slate-400"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {section.bullets && (
                      <ul className="space-y-3">
                        {section.bullets.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm leading-7 text-slate-600 dark:text-slate-400"
                          >
                            <CheckCircle2
                              size={17}
                              className="mt-1 shrink-0 text-emerald-500"
                            />

                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.id === "contact" && (
                      <Link
                        to="/contact-support"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        <Headset size={17} />
                        Contact Support Manager
                        <ArrowUpRight size={16} />
                      </Link>
                    )}
                  </section>
                );
              })}
            </div>

            {/* FINAL NOTICE */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-7 dark:border-slate-800 dark:bg-slate-800/40 sm:px-9">
              <div className="flex items-start gap-3">
                <FileText
                  size={21}
                  className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                />

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Important Notice
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                    By continuing to use Tenant Control, you
                    acknowledge these terms, subject to applicable
                    laws and any additional agreements governing
                    your account or subscription.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* BOTTOM CONTACT STRIP */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Still have questions?
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Reach out to our support team for assistance.
            </p>
          </div>

          <Link
            to="/contact-support"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Headset size={17} />
            Get Support
          </Link>
        </div>
      </main>
    </div>
    );
}
