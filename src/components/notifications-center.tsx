"use client";

import { useState } from "react";
import {
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  ArrowRightLeft,
  FolderSync,
  Settings,
  Trash2,
} from "./icons";
import { formatRelativeTime, cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Transfer Completed",
    message: "Daily backup to S3 completed successfully (2.4 GB)",
    time: new Date(Date.now() - 300000).toISOString(),
    read: false,
    action: { label: "View Details", href: "#" },
  },
  {
    id: "2",
    type: "error",
    title: "Sync Failed",
    message: "Project Sync encountered an error: Connection timeout",
    time: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    action: { label: "Retry", href: "#" },
  },
  {
    id: "3",
    type: "warning",
    title: "Storage Warning",
    message: "Azure Blob storage is 85% full. Consider cleanup.",
    time: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    action: { label: "Manage Storage", href: "#" },
  },
  {
    id: "4",
    type: "info",
    title: "Scheduled Transfer",
    message: "Weekly archive backup is scheduled for 3:00 AM",
    time: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
  {
    id: "5",
    type: "success",
    title: "New Connection Added",
    message: "Google Drive connection configured successfully",
    time: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
  {
    id: "6",
    type: "success",
    title: "Sync Completed",
    message: "Documents folder synced with Dropbox (156 files)",
    time: new Date(Date.now() - 172800000).toISOString(),
    read: true,
  },
];

interface NotificationsCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsCenter({
  isOpen,
  onClose,
}: NotificationsCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const markAsRead = (id: string) => {
    setNotifications((ns) =>
      ns.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((ns) => ns.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-16 right-4 w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-surface-100 z-50 overflow-hidden animate-slide-down">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-surface-600" />
            <h3 className="font-semibold text-surface-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-surface-100 bg-surface-50">
          <div className="flex gap-1">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                filter === "all" ? "bg-white shadow-sm text-surface-900" : "text-surface-500"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                filter === "unread" ? "bg-white shadow-sm text-surface-900" : "text-surface-500"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
          <div className="flex gap-1">
            <button
              onClick={markAllAsRead}
              className="px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              Mark all read
            </button>
            <button
              onClick={clearAll}
              className="px-2 py-1 text-xs text-danger-600 hover:bg-danger-50 rounded-lg"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell size={40} className="text-surface-200 mx-auto mb-3" />
              <p className="text-surface-500 font-medium">No notifications</p>
              <p className="text-surface-400 text-sm">
                {filter === "unread" ? "All caught up!" : "Nothing to see here"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-surface-100 bg-surface-50">
          <button className="w-full text-sm text-primary-600 font-medium hover:text-primary-700">
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const icons = {
    success: Check,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };
  const colors = {
    success: "bg-success-50 text-success-600",
    error: "bg-danger-50 text-danger-600",
    warning: "bg-warning-50 text-warning-600",
    info: "bg-primary-50 text-primary-600",
  };

  const Icon = icons[notification.type];

  return (
    <div
      className={cn(
        "px-4 py-3 hover:bg-surface-50 transition-colors group",
        !notification.read && "bg-primary-50/30"
      )}
    >
      <div className="flex gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", colors[notification.type])}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={cn("text-sm font-medium", !notification.read ? "text-surface-900" : "text-surface-700")}>
                {notification.title}
              </p>
              <p className="text-xs text-surface-500 mt-0.5">{notification.message}</p>
            </div>
            <button
              onClick={onDelete}
              className="w-6 h-6 rounded hover:bg-surface-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <X size={12} className="text-surface-400" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-surface-400">
              {formatRelativeTime(notification.time)}
            </span>
            <div className="flex items-center gap-2">
              {!notification.read && (
                <button
                  onClick={onMarkRead}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Mark read
                </button>
              )}
              {notification.action && (
                <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  {notification.action.label}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification Bell Button Component
export function NotificationBell({ onClick, unreadCount }: { onClick: () => void; unreadCount: number }) {
  return (
    <button
      onClick={onClick}
      className="relative w-10 h-10 rounded-xl bg-surface-50 hover:bg-surface-100 flex items-center justify-center transition-colors"
    >
      <Bell size={18} className="text-surface-500" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
