"use client";

import { useState } from "react";
import {
  BarChart3,
  ArrowRightLeft,
  HardDrive,
  Cloud,
  Activity,
  ArrowUp,
  ArrowDown,
  Clock,
  Zap,
  Globe,
  Server,
} from "./icons";
import { formatBytes, cn } from "@/lib/utils";

type TimeRange = "24h" | "7d" | "30d" | "90d";

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  // Simulated data
  const stats = {
    totalTransfers: 1247,
    totalData: 892_000_000_000,
    avgSpeed: 45.2,
    successRate: 99.2,
    activeConnections: 8,
    peakHour: "2:00 AM",
  };

  const transfersByDay = [
    { day: "Mon", uploads: 45, downloads: 32 },
    { day: "Tue", uploads: 52, downloads: 41 },
    { day: "Wed", uploads: 38, downloads: 29 },
    { day: "Thu", uploads: 65, downloads: 48 },
    { day: "Fri", uploads: 71, downloads: 55 },
    { day: "Sat", uploads: 28, downloads: 19 },
    { day: "Sun", uploads: 22, downloads: 15 },
  ];

  const bandwidthByHour = [
    12, 8, 5, 3, 2, 4, 15, 45, 78, 92, 85, 72,
    68, 75, 82, 88, 95, 76, 54, 42, 35, 28, 22, 18,
  ];

  const storageByType = [
    { type: "Documents", size: 125_000_000_000, color: "bg-primary-500" },
    { type: "Images", size: 89_000_000_000, color: "bg-accent-500" },
    { type: "Videos", size: 245_000_000_000, color: "bg-warning-500" },
    { type: "Archives", size: 67_000_000_000, color: "bg-success-500" },
    { type: "Other", size: 34_000_000_000, color: "bg-surface-400" },
  ];

  const topConnections = [
    { name: "Production S3", type: "s3", transfers: 423, data: 245_000_000_000 },
    { name: "Backup SFTP", type: "sftp", transfers: 312, data: 189_000_000_000 },
    { name: "Google Drive", type: "google_drive", transfers: 198, data: 78_000_000_000 },
    { name: "Dev Server", type: "ftp", transfers: 156, data: 45_000_000_000 },
    { name: "Archive Storage", type: "azure_blob", transfers: 89, data: 234_000_000_000 },
  ];

  const recentActivity = [
    { action: "Transfer completed", target: "backup_2024.zip", time: "2 min ago", status: "success" },
    { action: "Sync finished", target: "/Documents → S3", time: "15 min ago", status: "success" },
    { action: "Upload failed", target: "large_video.mp4", time: "1 hour ago", status: "error" },
    { action: "New connection", target: "Azure Blob Storage", time: "3 hours ago", status: "info" },
    { action: "Scheduled transfer", target: "Daily Backup", time: "5 hours ago", status: "success" },
  ];

  const totalStorage = storageByType.reduce((a, b) => a + b.size, 0);
  const maxBandwidth = Math.max(...bandwidthByHour);
  const maxTransfers = Math.max(...transfersByDay.map(d => d.uploads + d.downloads));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Analytics</h2>
          <p className="text-surface-500 text-sm mt-1">
            Monitor your transfer activity and storage usage
          </p>
        </div>
        <div className="flex bg-white rounded-xl border border-surface-200 p-1">
          {(["24h", "7d", "30d", "90d"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                timeRange === range
                  ? "bg-primary-500 text-white"
                  : "text-surface-600 hover:bg-surface-50"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Transfers"
          value={stats.totalTransfers.toLocaleString()}
          change="+12%"
          positive
          icon={ArrowRightLeft}
        />
        <StatCard
          label="Data Transferred"
          value={formatBytes(stats.totalData)}
          change="+8%"
          positive
          icon={HardDrive}
        />
        <StatCard
          label="Avg Speed"
          value={`${stats.avgSpeed} MB/s`}
          change="+15%"
          positive
          icon={Zap}
        />
        <StatCard
          label="Success Rate"
          value={`${stats.successRate}%`}
          change="+0.5%"
          positive
          icon={Activity}
        />
        <StatCard
          label="Connections"
          value={stats.activeConnections.toString()}
          change="+2"
          positive
          icon={Globe}
        />
        <StatCard
          label="Peak Hour"
          value={stats.peakHour}
          icon={Clock}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Activity Chart */}
        <div className="bg-white rounded-2xl border border-surface-100 p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-surface-900">Transfer Activity</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary-500" />
                <span className="text-surface-500">Uploads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-accent-500" />
                <span className="text-surface-500">Downloads</span>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {transfersByDay.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-1 items-center">
                  <div
                    className="w-full max-w-8 bg-primary-500 rounded-t-md transition-all hover:bg-primary-600"
                    style={{ height: `${(day.uploads / maxTransfers) * 140}px` }}
                  />
                  <div
                    className="w-full max-w-8 bg-accent-500 rounded-t-md transition-all hover:bg-accent-600"
                    style={{ height: `${(day.downloads / maxTransfers) * 140}px` }}
                  />
                </div>
                <span className="text-xs text-surface-400 mt-2">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bandwidth Chart */}
        <div className="bg-white rounded-2xl border border-surface-100 p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-surface-900">Bandwidth Usage (24h)</h3>
            <span className="text-xs text-surface-400">MB/s</span>
          </div>
          <div className="h-48 flex items-end gap-1">
            {bandwidthByHour.map((value, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-sm transition-all hover:from-primary-600 hover:to-primary-400 cursor-pointer group relative"
                style={{ height: `${(value / maxBandwidth) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {value} MB/s
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-surface-400">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>12 AM</span>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Breakdown */}
        <div className="bg-white rounded-2xl border border-surface-100 p-5">
          <h3 className="font-semibold text-surface-900 mb-4">Storage Breakdown</h3>
          <div className="space-y-3">
            {storageByType.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-surface-600">{item.type}</span>
                  <span className="font-medium text-surface-800">{formatBytes(item.size)}</span>
                </div>
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", item.color)}
                    style={{ width: `${(item.size / totalStorage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between">
            <span className="text-sm text-surface-500">Total Storage</span>
            <span className="font-bold text-surface-900">{formatBytes(totalStorage)}</span>
          </div>
        </div>

        {/* Top Connections */}
        <div className="bg-white rounded-2xl border border-surface-100 p-5">
          <h3 className="font-semibold text-surface-900 mb-4">Top Connections</h3>
          <div className="space-y-3">
            {topConnections.map((conn, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-sm">
                  {conn.type === "s3" ? "☁️" : conn.type === "sftp" ? "🔒" : conn.type === "google_drive" ? "📁" : conn.type === "ftp" ? "🔗" : "🔷"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800 truncate">{conn.name}</p>
                  <p className="text-xs text-surface-400">{conn.transfers} transfers</p>
                </div>
                <span className="text-xs font-medium text-surface-600">{formatBytes(conn.data)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-surface-100 p-5">
          <h3 className="font-semibold text-surface-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    item.status === "success" ? "bg-success-500" :
                    item.status === "error" ? "bg-danger-500" :
                    "bg-primary-500"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-800">{item.action}</p>
                  <p className="text-xs text-surface-400 truncate">{item.target}</p>
                </div>
                <span className="text-xs text-surface-400 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-br from-surface-900 to-surface-800 rounded-2xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-4">⚡ Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            title="Peak Performance"
            description="Your transfers are 23% faster than last week"
            icon="📈"
          />
          <InsightCard
            title="Storage Optimization"
            description="15 duplicate files detected (2.3 GB potential savings)"
            icon="💾"
          />
          <InsightCard
            title="Schedule Suggestion"
            description="Move large transfers to 2-4 AM for better speeds"
            icon="⏰"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  positive,
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="bg-white rounded-2xl border border-surface-100 p-4 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-2">
        <Icon size={20} className="text-surface-400" />
        {change && (
          <span
            className={cn(
              "text-xs font-medium flex items-center gap-0.5",
              positive ? "text-success-600" : "text-danger-600"
            )}
          >
            {positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-surface-900">{value}</p>
      <p className="text-xs text-surface-500 mt-1">{label}</p>
    </div>
  );
}

function InsightCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h4 className="font-semibold">{title}</h4>
      </div>
      <p className="text-sm text-surface-300">{description}</p>
    </div>
  );
}
