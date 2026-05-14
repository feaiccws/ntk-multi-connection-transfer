"use client";

import { useState } from "react";
import {
  Activity,
  Upload,
  Download,
  Trash2,
  Edit3,
  FolderPlus,
  FolderSync,
  Server,
  Check,
  X,
  AlertCircle,
  Filter,
  Calendar,
  RefreshCw,
} from "./icons";
import { formatRelativeTime, formatBytes, cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "upload" | "download" | "delete" | "rename" | "create_folder" | "sync" | "connect" | "transfer_complete" | "transfer_failed" | "settings";
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  metadata?: Record<string, string | number>;
  status: "success" | "failed" | "warning" | "info";
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "transfer_complete",
    title: "Transfer Completed",
    description: "Backup to S3 completed successfully",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    status: "success",
    metadata: { files: 156, size: 2456789012 },
  },
  {
    id: "2",
    type: "upload",
    title: "Files Uploaded",
    description: "Uploaded 5 files to /Documents",
    timestamp: new Date(Date.now() - 900000).toISOString(),
    status: "success",
    metadata: { files: 5, size: 12345678 },
  },
  {
    id: "3",
    type: "transfer_failed",
    title: "Transfer Failed",
    description: "Connection timeout to FTP server",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: "failed",
  },
  {
    id: "4",
    type: "sync",
    title: "Sync Completed",
    description: "Documents synced with Google Drive",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "success",
    metadata: { files: 45, conflicts: 0 },
  },
  {
    id: "5",
    type: "delete",
    title: "Files Deleted",
    description: "Removed 3 files from /Downloads",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: "warning",
    metadata: { files: 3 },
  },
  {
    id: "6",
    type: "connect",
    title: "New Connection",
    description: "Added Dropbox connection",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    status: "info",
  },
  {
    id: "7",
    type: "create_folder",
    title: "Folder Created",
    description: "Created /Projects/New-App",
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    status: "success",
  },
  {
    id: "8",
    type: "rename",
    title: "File Renamed",
    description: "Renamed report_v1.pdf to report_final.pdf",
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    status: "success",
  },
  {
    id: "9",
    type: "download",
    title: "Files Downloaded",
    description: "Downloaded backup archive",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: "success",
    metadata: { size: 567890123 },
  },
  {
    id: "10",
    type: "settings",
    title: "Settings Changed",
    description: "Updated transfer settings",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: "info",
  },
];

const activityIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  upload: Upload,
  download: Download,
  delete: Trash2,
  rename: Edit3,
  create_folder: FolderPlus,
  sync: FolderSync,
  connect: Server,
  transfer_complete: Check,
  transfer_failed: X,
  settings: Activity,
};

const activityColors: Record<string, { bg: string; text: string }> = {
  success: { bg: "bg-success-50", text: "text-success-600" },
  failed: { bg: "bg-danger-50", text: "text-danger-600" },
  warning: { bg: "bg-warning-50", text: "text-warning-600" },
  info: { bg: "bg-primary-50", text: "text-primary-600" },
};

export default function ActivityTimeline() {
  const [activities] = useState<ActivityItem[]>(mockActivities);
  const [filter, setFilter] = useState<"all" | "success" | "failed" | "warning">("all");
  const [dateRange, setDateRange] = useState("7d");

  const filteredActivities = activities.filter(
    (a) => filter === "all" || a.status === filter
  );

  const groupedByDate = filteredActivities.reduce((acc, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, ActivityItem[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Activity Timeline</h2>
          <p className="text-surface-500 text-sm mt-1">
            Full audit log of all actions across your connections
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50">
            <Calendar size={16} />
            Custom Range
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-surface-500 flex items-center gap-1">
          <Filter size={14} />
          Filter:
        </span>
        {[
          { id: "all", label: "All" },
          { id: "success", label: "Success", color: "success" },
          { id: "failed", label: "Failed", color: "danger" },
          { id: "warning", label: "Warnings", color: "warning" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
              filter === f.id
                ? "bg-primary-500 text-white"
                : "bg-surface-100 text-surface-600 hover:bg-surface-200"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-surface-100 p-4 text-center">
          <p className="text-2xl font-bold text-surface-900">{activities.length}</p>
          <p className="text-sm text-surface-500">Total Actions</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-4 text-center">
          <p className="text-2xl font-bold text-success-600">
            {activities.filter((a) => a.status === "success").length}
          </p>
          <p className="text-sm text-surface-500">Successful</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-4 text-center">
          <p className="text-2xl font-bold text-danger-600">
            {activities.filter((a) => a.status === "failed").length}
          </p>
          <p className="text-sm text-surface-500">Failed</p>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-4 text-center">
          <p className="text-2xl font-bold text-warning-600">
            {activities.filter((a) => a.status === "warning").length}
          </p>
          <p className="text-sm text-surface-500">Warnings</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        {Object.entries(groupedByDate).map(([date, items], dateIndex) => (
          <div key={date}>
            {/* Date Header */}
            <div className="px-6 py-3 bg-surface-50 border-b border-surface-100 sticky top-0">
              <p className="text-sm font-semibold text-surface-700">{date}</p>
            </div>

            {/* Activities for this date */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-surface-100" />

              {items.map((activity, i) => {
                const Icon = activityIcons[activity.type] || Activity;
                const colors = activityColors[activity.status];

                return (
                  <div
                    key={activity.id}
                    className="relative flex gap-4 px-6 py-4 hover:bg-surface-50 transition-colors"
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        colors.bg
                      )}
                    >
                      <Icon size={16} className={colors.text} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-surface-900">{activity.title}</p>
                          <p className="text-sm text-surface-500 mt-0.5">{activity.description}</p>
                          
                          {/* Metadata */}
                          {activity.metadata && (
                            <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                              {activity.metadata.files && (
                                <span>{activity.metadata.files} files</span>
                              )}
                              {activity.metadata.size && (
                                <span>{formatBytes(activity.metadata.size as number)}</span>
                              )}
                              {activity.metadata.conflicts !== undefined && (
                                <span>{activity.metadata.conflicts} conflicts</span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-surface-400 flex-shrink-0">
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="py-16 text-center">
            <Activity size={40} className="text-surface-200 mx-auto mb-3" />
            <p className="text-surface-500">No activities found</p>
          </div>
        )}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="px-6 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-xl">
          Load More Activities
        </button>
      </div>
    </div>
  );
}
