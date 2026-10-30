import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Settings,
  ChevronDown,
  UserRound,
  LogOut,
  ShieldCheck,
  IdCard,
  CreditCard,
  Contact,
  CheckCircle,
  NotebookPen,
  Headset,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { ScrollText } from "lucide-react";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SettingsMenu() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const { t, i18n } = useTranslation();

function handleLanguageChange(event) {
  const language = event.target.value;

  i18n.changeLanguage(language);
  localStorage.setItem("appLanguage", language);
}

  const initials = (user?.name || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    setOpen(false);

    await logoutUser();
    navigate("/login", { replace: true });
  }

  return (
    <div ref={menuRef} className="relative">
      {/* SETTINGS BUTTON */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition
          ${
            open
              ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          }`}
      >
        <Settings size={19} />

        <span className="hidden sm:inline">Settings</span>

        <ChevronDown
          size={15}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900"
        >
          {/* USER PROFILE */}
          <Link
            //to="/profile"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 p-4 transition hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-base font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {user?.name || "User"}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email || "Account"}
              </p>
            </div>
          </Link>

          {/* MENU ITEMS */}
          <div className="p-2">
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <IdCard size={18} className="text-slate-500" />
              {t("myProfile")}
            </Link>

            <Link
              to="/subscriptions"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <CreditCard size={18} className="text-yellow-500" />
                {t("mySubscription")}
            </Link>

            <Link
              to="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ShieldCheck size={18} className="text-cyan-500" />
                              {t("accountSettings")}
            </Link>
            <Link
              to="/contact-support"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Headset size={18} className="text-slate-500" />
              {t("contactSupport")}
            </Link>

            <Link
              to="/terms-and-conditions"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ScrollText size={18} className="text-slate-500" />
              {t("termsConditions")}
            </Link>

            
          </div>

{/* LANGUAGE SETTINGS */}
<div className="border-t border-slate-100 p-3 dark:border-slate-800">
  <div className="mb-3 flex items-center gap-2 px-2">
    <Languages
      size={18}
      className="text-indigo-600 dark:text-indigo-400"
    />

    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
      {t("chooseLanguage")}
    </span>
  </div>

  <select
    value={i18n.resolvedLanguage || i18n.language}
    onChange={handleLanguageChange}
    aria-label={t("chooseLanguage")}
    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
  >
    <option value="en">English</option>
    <option value="hi">हिन्दी (Hindi)</option>
  </select>
</div>

          

          {/* LOGOUT */}
          <div className="border-t border-slate-100 p-2 dark:border-slate-800">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
