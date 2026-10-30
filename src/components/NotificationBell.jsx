
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  X,
  CheckCheck,
  WifiOff,
  Clock3,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import useNotifications from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell() {
  const { token } = useAuth();
  const { notifications, connected } = useNotifications(token);
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [readIds, setReadIds] = useState(new Set());

  const dropdownRef = useRef(null);
  const seenNotifications = useRef(new Set());
  const timeouts = useRef(new Map());
  const nextToastId = useRef(0);

  // Temporary client-side identity for notifications
  // Prefer notification.id from your database.
  const getNotificationId = (notification) =>
    notification.id ??
    `${notification.title}|${notification.message}|${notification.createdAt}`;

  const unreadCount = notifications.filter(
    (notification) => !readIds.has(getNotificationId(notification))
  ).length;

  // Display a toast for each new notification.
  useEffect(() => {
    const newNotifications = notifications.filter((notification) => {
      const id = getNotificationId(notification);

      if (seenNotifications.current.has(id)) return false;

      seenNotifications.current.add(id);
      return true;
    });

    if (newNotifications.length === 0) return;

    const newToasts = newNotifications.map((notification) => ({
      id: nextToastId.current++,
      title: notification.title || t("Notification"),
      message: notification.message || "",
    }));

    setToasts((current) => [...newToasts, ...current]);

    newToasts.forEach(({ id }) => {
      const timeout = window.setTimeout(() => {
        setToasts((current) =>
          current.filter((toast) => toast.id !== id)
        );
        timeouts.current.delete(id);
      }, 5000);

      timeouts.current.set(id, timeout);
    });
  }, [notifications, t]);

  // Close dropdown when clicking outside.
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Clear toast timers on unmount.
  useEffect(() => {
    return () => {
      timeouts.current.forEach((timeout) =>
        window.clearTimeout(timeout)
      );
      timeouts.current.clear();
    };
  }, []);

  function dismissToast(id) {
    const timeout = timeouts.current.get(id);

    if (timeout !== undefined) {
      window.clearTimeout(timeout);
    }

    timeouts.current.delete(id);

    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  }

  function markAsRead(notification) {
    const id = getNotificationId(notification);

    setReadIds((current) => {
      const updated = new Set(current);
      updated.add(id);
      return updated;
    });
  }

  function markAllAsRead() {
    setReadIds(
      new Set(notifications.map(getNotificationId))
    );
  }

  function formatTime(date) {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "";

    return parsed.toLocaleString();
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Notification bell */}
        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-label={t("Notifications")}
          aria-expanded={isOpen}
          title={t("Notifications")}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Notification dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-12 z-[110] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {t("Notifications")}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {unreadCount} unread
                </p>
              </div>

              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                title={t("Mark all as read")}
                className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 dark:hover:bg-slate-800"
              >
                <CheckCheck className="h-5 w-5" />
              </button>
            </div>

            {/* Connection status */}
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2 text-xs dark:border-slate-800">
              <span
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-emerald-500" : "bg-red-500"
                }`}
              />

              <span className="text-slate-500 dark:text-slate-400">
                {connected
                  ? "Real-time notifications connected"
                  : "Real-time notifications disconnected"}
              </span>
            </div>

            {/* Notification list */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                  <Bell className="h-10 w-10 text-slate-300" />

                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    No notifications yet
                  </p>

                  <p className="text-sm text-slate-500">
                    Your subscription updates will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification, index) => {
                  const id = getNotificationId(notification);
                  const isUnread = !readIds.has(id);

                  return (
                    <button
                      key={`${id}-${index}`}
                      type="button"
                      onClick={() => markAsRead(notification)}
                      className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                        isUnread
                          ? "bg-indigo-50/60 dark:bg-indigo-950/20"
                          : ""
                      }`}
                    >
                      <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/40">
                        <Bell className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {notification.title}
                        </h4>

                        <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">
                          {notification.message}
                        </p>

                        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                          <Clock3 className="h-3 w-3" />
                          {formatTime(notification.createdAt)}
                        </div>
                      </div>

                      {isUnread && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {!connected && (
              <div className="flex items-center justify-center gap-2 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                <WifiOff className="h-4 w-4" />
                Waiting for WebSocket connection...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating toast notifications */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed right-4 top-24 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {toast.title}
                </h4>

                {toast.message && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                aria-label={t("Dismiss notification")}
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
