"use client";

import { useState } from "react";
import {
  CalendarClock,
  Plus,
  Clock,
  Play,
  Pause,
  Trash2,
  Check,
  X,
  ArrowRight,
  RefreshCw,
} from "./icons";
import { cn } from "@/lib/utils";

interface ScheduledItem {
  id: string;
  name: string;
  type: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  active: boolean;
  source: string;
  dest: string;
}

const demoSchedules: ScheduledItem[] = [
  {
    id: "1",
    name: "Daily Backup",
    type: "local_to_cloud",
    schedule: "Every day at 2:00 AM",
    lastRun: "2024-01-15 02:00",
    nextRun: "2024-01-16 02:00",
    active: true,
    source: "/var/www/data",
    dest: "s3://backups/daily",
  },
  {
    id: "2",
    name: "Weekly Sync",
    type: "cloud_to_cloud",
    schedule: "Every Sunday at 12:00 AM",
    lastRun: "2024-01-14 00:00",
    nextRun: "2024-01-21 00:00",
    active: true,
    source: "Google Drive /Documents",
    dest: "Dropbox /Archive",
  },
  {
    id: "3",
    name: "Hourly Mirror",
    type: "remote_to_remote",
    schedule: "Every hour",
    lastRun: "2024-01-15 14:00",
    nextRun: "2024-01-15 15:00",
    active: false,
    source: "ftp://primary.server.com",
    dest: "sftp://mirror.server.com",
  },
];

export default function ScheduledView() {
  const [schedules, setSchedules] = useState(demoSchedules);
  const [showForm, setShowForm] = useState(false);

  const toggleActive = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">
            Scheduled Transfers
          </h2>
          <p className="text-surface-500 text-sm mt-1">
            Automate your file transfers with schedules
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all"
        >
          <Plus size={16} />
          New Schedule
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-5 border border-primary-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
            <CalendarClock size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">
              Automate Your Workflows
            </h3>
            <p className="text-sm text-surface-600 mt-1">
              Set up recurring file transfers between any of your connected
              services. Schedule backups, syncs, and migrations to run
              automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule list */}
      <div className="space-y-3">
        {schedules.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-surface-100 p-5 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                  s.active ? "bg-success-50" : "bg-surface-100"
                )}
              >
                {s.active ? (
                  <Play size={20} className="text-success-500" />
                ) : (
                  <Pause size={20} className="text-surface-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-surface-900">{s.name}</h3>
                  <span
                    className={cn(
                      "text-xs px-2.5 py-0.5 rounded-full font-medium",
                      s.active
                        ? "bg-success-50 text-success-600"
                        : "bg-surface-100 text-surface-500"
                    )}
                  >
                    {s.active ? "Active" : "Paused"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-surface-500">
                  <Clock size={12} />
                  <span>{s.schedule}</span>
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs text-surface-400">
                  <span className="truncate max-w-[150px]">{s.source}</span>
                  <ArrowRight size={12} className="flex-shrink-0" />
                  <span className="truncate max-w-[150px]">{s.dest}</span>
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-surface-400">
                  <span>
                    Last run:{" "}
                    <span className="text-surface-600 font-medium">
                      {s.lastRun}
                    </span>
                  </span>
                  <span>
                    Next run:{" "}
                    <span className="text-surface-600 font-medium">
                      {s.nextRun}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(s.id)}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    s.active
                      ? "hover:bg-warning-50 text-warning-500"
                      : "hover:bg-success-50 text-success-500"
                  )}
                  title={s.active ? "Pause" : "Resume"}
                >
                  {s.active ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={() => deleteSchedule(s.id)}
                  className="w-8 h-8 rounded-lg hover:bg-danger-50 text-danger-500 flex items-center justify-center transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {schedules.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <CalendarClock size={32} className="text-surface-300" />
          </div>
          <p className="text-surface-600 font-medium">
            No scheduled transfers
          </p>
          <p className="text-surface-400 text-sm mt-1">
            Create your first automated transfer schedule
          </p>
        </div>
      )}

      {/* New Schedule Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
              <h3 className="font-bold text-surface-900">
                New Scheduled Transfer
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Schedule Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Daily Backup"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Frequency
                </label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm bg-white">
                  <option>Every hour</option>
                  <option>Every 6 hours</option>
                  <option>Every day</option>
                  <option>Every week</option>
                  <option>Every month</option>
                  <option>Custom (cron expression)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Source Path
                  </label>
                  <input
                    type="text"
                    placeholder="/data/files"
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Destination Path
                  </label>
                  <input
                    type="text"
                    placeholder="/backup/"
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSchedules((prev) => [
                      ...prev,
                      {
                        id: String(Date.now()),
                        name: "New Schedule",
                        type: "local_to_cloud",
                        schedule: "Every day",
                        lastRun: "—",
                        nextRun: "Pending",
                        active: true,
                        source: "/data/files",
                        dest: "/backup",
                      },
                    ]);
                    setShowForm(false);
                  }}
                  className="ml-auto flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-lg shadow-primary-500/25 transition-all"
                >
                  <Check size={14} />
                  Create Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
