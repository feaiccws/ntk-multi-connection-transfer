"use client";

import { useEffect, useState } from "react";
import {
  Server,
  ArrowRightLeft,
  Check,
  AlertCircle,
  Activity,
  Zap,
  Upload,
  Download,
  Cloud,
  HardDrive,
} from "./icons";
import { formatBytes, formatRelativeTime, getTransferTypeLabel } from "@/lib/utils";
import type { Connection, Transfer } from "@/db/schema";

interface Stats {
  totalConnections: number;
  totalTransfers: number;
  completedTransfers: number;
  failedTransfers: number;
  totalDataTransferred: number;
}

interface DashboardProps {
  onViewChange: (view: string) => void;
}

export default function Dashboard({ onViewChange }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTransfers, setRecentTransfers] = useState<Transfer[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/transfers").then((r) => r.json()),
      fetch("/api/connections").then((r) => r.json()),
    ]).then(([s, t, c]) => {
      setStats(s);
      setRecentTransfers(Array.isArray(t) ? t.slice(0, 5) : []);
      setConnections(Array.isArray(c) ? c : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-surface-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Connections",
      value: stats?.totalConnections || 0,
      icon: Server,
      color: "from-primary-500 to-primary-600",
      shadow: "shadow-primary-500/20",
      change: "+2 this week",
    },
    {
      label: "Total Transfers",
      value: stats?.totalTransfers || 0,
      icon: ArrowRightLeft,
      color: "from-accent-500 to-accent-600",
      shadow: "shadow-accent-500/20",
      change: "+5 today",
    },
    {
      label: "Completed",
      value: stats?.completedTransfers || 0,
      icon: Check,
      color: "from-success-500 to-success-600",
      shadow: "shadow-success-500/20",
      change: "99.5% success",
    },
    {
      label: "Data Transferred",
      value: formatBytes(stats?.totalDataTransferred || 0),
      icon: Activity,
      color: "from-warning-500 to-warning-600",
      shadow: "shadow-warning-500/20",
      change: "+2.4 GB today",
      isString: true,
    },
  ];

  const quickActions = [
    {
      label: "Local → Remote",
      desc: "Upload files to server",
      icon: Upload,
      type: "local_to_remote",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      label: "Remote → Local",
      desc: "Download from server",
      icon: Download,
      type: "remote_to_local",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Cloud → Cloud",
      desc: "Sync cloud storage",
      icon: Cloud,
      type: "cloud_to_cloud",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Local → Local",
      desc: "Copy between folders",
      icon: HardDrive,
      type: "local_to_local",
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-surface-900">
          Welcome back 👋
        </h2>
        <p className="text-surface-500 mt-1">
          Here&apos;s an overview of your file transfer activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-5 border border-surface-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-surface-500 font-medium">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-surface-900 mt-1">
                    {card.isString ? card.value : card.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-surface-400 mt-1">{card.change}</p>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.shadow} group-hover:scale-110 transition-transform`}
                >
                  <Icon size={20} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-surface-900 mb-3">
          Quick Transfer
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.type}
                onClick={() => onViewChange("transfer")}
                className="bg-white rounded-2xl p-4 border border-surface-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left group"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={18} className="text-white" />
                </div>
                <p className="font-semibold text-sm text-surface-900">
                  {action.label}
                </p>
                <p className="text-xs text-surface-400 mt-0.5">
                  {action.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Transfers */}
        <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <h3 className="font-semibold text-surface-900">
              Recent Transfers
            </h3>
            <button
              onClick={() => onViewChange("history")}
              className="text-xs text-primary-500 font-semibold hover:text-primary-700"
            >
              View All
            </button>
          </div>
          {recentTransfers.length === 0 ? (
            <div className="p-8 text-center">
              <ArrowRightLeft
                size={40}
                className="text-surface-300 mx-auto mb-3"
              />
              <p className="text-surface-500 text-sm">No transfers yet</p>
              <button
                onClick={() => onViewChange("transfer")}
                className="text-primary-500 text-sm font-semibold mt-2 hover:text-primary-700"
              >
                Start your first transfer
              </button>
            </div>
          ) : (
            <div className="divide-y divide-surface-50">
              {recentTransfers.map((t) => (
                <div
                  key={t.id}
                  className="px-5 py-3 hover:bg-surface-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          t.status === "completed"
                            ? "bg-success-500"
                            : t.status === "failed"
                            ? "bg-danger-500"
                            : t.status === "in_progress"
                            ? "bg-primary-500 animate-pulse"
                            : "bg-warning-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-surface-800">
                          {getTransferTypeLabel(t.transferType)}
                        </p>
                        <p className="text-xs text-surface-400">
                          {formatBytes(t.totalSize || 0)} •{" "}
                          {t.totalFiles} files
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-surface-400">
                      {formatRelativeTime(t.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Connections */}
        <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <h3 className="font-semibold text-surface-900">
              Your Connections
            </h3>
            <button
              onClick={() => onViewChange("connections")}
              className="text-xs text-primary-500 font-semibold hover:text-primary-700"
            >
              Manage
            </button>
          </div>
          {connections.length === 0 ? (
            <div className="p-8 text-center">
              <Server size={40} className="text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500 text-sm">
                No connections configured
              </p>
              <button
                onClick={() => onViewChange("connections")}
                className="text-primary-500 text-sm font-semibold mt-2 hover:text-primary-700"
              >
                Add your first connection
              </button>
            </div>
          ) : (
            <div className="divide-y divide-surface-50">
              {connections.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="px-5 py-3 hover:bg-surface-50 transition-colors flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center text-lg">
                    {c.type === "ftp"
                      ? "🔗"
                      : c.type === "sftp"
                      ? "🔒"
                      : c.type === "s3"
                      ? "☁️"
                      : c.type === "local"
                      ? "💻"
                      : c.type === "google_drive"
                      ? "📁"
                      : c.type === "dropbox"
                      ? "💧"
                      : "🌐"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-surface-400 truncate">
                      {c.host || c.type.toUpperCase()}
                    </p>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      c.isActive ? "bg-success-500" : "bg-surface-300"
                    }`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-gradient-to-br from-surface-900 to-surface-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center flex-shrink-0">
            <Zap size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">
              Multi-Protocol File Transfers
            </h3>
            <p className="text-surface-300 text-sm mt-1">
              FTP, SFTP, FTPS, S3, Google Drive, Dropbox, OneDrive, Azure Blob,
              WebDAV and more — all in one place.
            </p>
          </div>
          <button
            onClick={() => onViewChange("transfer")}
            className="bg-white text-surface-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-surface-100 transition-colors flex-shrink-0"
          >
            Start Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
