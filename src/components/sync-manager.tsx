"use client";

import React, { useState, useEffect } from "react";
import {
  FolderSync,
  Plus,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  Check,
  X,
  Clock,
  AlertCircle,
  ArrowRightLeft,
  Settings,
  ChevronRight,
} from "./icons";
import { getConnectionTypeIcon } from "./icons";
import { formatRelativeTime, getConnectionLabel, cn } from "@/lib/utils";
import type { Connection } from "@/db/schema";

interface SyncJob {
  id: string;
  name: string;
  sourceConnection: { id: string; name: string; type: string } | null;
  destConnection: { id: string; name: string; type: string } | null;
  sourcePath: string;
  destPath: string;
  mode: "mirror" | "two-way" | "backup";
  status: "active" | "paused" | "syncing" | "error";
  lastSync: string | null;
  nextSync: string | null;
  schedule: string;
  filesTotal: number;
  filesSync: number;
  conflicts: number;
}

const mockSyncJobs: SyncJob[] = [
  {
    id: "1",
    name: "Documents Backup",
    sourceConnection: { id: "1", name: "Local Files", type: "local" },
    destConnection: { id: "2", name: "Google Drive", type: "google_drive" },
    sourcePath: "/Documents",
    destPath: "/Backups/Documents",
    mode: "mirror",
    status: "active",
    lastSync: new Date(Date.now() - 3600000).toISOString(),
    nextSync: new Date(Date.now() + 3600000).toISOString(),
    schedule: "Every hour",
    filesTotal: 1234,
    filesSync: 1234,
    conflicts: 0,
  },
  {
    id: "2",
    name: "Project Sync",
    sourceConnection: { id: "3", name: "Dev Server", type: "sftp" },
    destConnection: { id: "4", name: "Production S3", type: "s3" },
    sourcePath: "/var/www/project",
    destPath: "/deployments/latest",
    mode: "two-way",
    status: "syncing",
    lastSync: new Date(Date.now() - 300000).toISOString(),
    nextSync: null,
    schedule: "Real-time",
    filesTotal: 567,
    filesSync: 342,
    conflicts: 3,
  },
  {
    id: "3",
    name: "Media Archive",
    sourceConnection: { id: "5", name: "NAS Storage", type: "webdav" },
    destConnection: { id: "6", name: "Azure Blob", type: "azure_blob" },
    sourcePath: "/media",
    destPath: "/archive/media",
    mode: "backup",
    status: "paused",
    lastSync: new Date(Date.now() - 86400000).toISOString(),
    nextSync: null,
    schedule: "Daily at 3 AM",
    filesTotal: 8921,
    filesSync: 8921,
    conflicts: 0,
  },
];

export default function SyncManager() {
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>(mockSyncJobs);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState<SyncJob | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    fetch("/api/connections")
      .then((r) => r.json())
      .then((data) => setConnections(Array.isArray(data) ? data : []));
  }, []);

  const toggleSync = (id: string) => {
    setSyncJobs((jobs) =>
      jobs.map((j) =>
        j.id === id
          ? { ...j, status: j.status === "active" ? "paused" : "active" }
          : j
      )
    );
  };

  const deleteSync = (id: string) => {
    setSyncJobs((jobs) => jobs.filter((j) => j.id !== id));
  };

  const triggerSync = (id: string) => {
    setSyncJobs((jobs) =>
      jobs.map((j) =>
        j.id === id ? { ...j, status: "syncing" } : j
      )
    );
    // Simulate sync completion
    setTimeout(() => {
      setSyncJobs((jobs) =>
        jobs.map((j) =>
          j.id === id
            ? { ...j, status: "active", lastSync: new Date().toISOString(), filesSync: j.filesTotal }
            : j
        )
      );
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Sync Manager</h2>
          <p className="text-surface-500 text-sm mt-1">
            Two-way sync and real-time folder synchronization
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all"
        >
          <Plus size={16} />
          New Sync Job
        </button>
      </div>

      {/* Sync Modes Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModeCard
          icon="🔄"
          title="Two-Way Sync"
          description="Changes on either side are synced to both locations"
          color="from-primary-500 to-primary-600"
        />
        <ModeCard
          icon="🪞"
          title="Mirror Sync"
          description="Destination always matches source exactly"
          color="from-accent-500 to-accent-600"
        />
        <ModeCard
          icon="💾"
          title="Backup Sync"
          description="One-way copy, never deletes from destination"
          color="from-success-500 to-success-600"
        />
      </div>

      {/* Sync Jobs List */}
      <div className="space-y-4">
        {syncJobs.map((job) => (
          <SyncJobCard
            key={job.id}
            job={job}
            onToggle={() => toggleSync(job.id)}
            onDelete={() => deleteSync(job.id)}
            onSync={() => triggerSync(job.id)}
            onConflicts={() => setShowConflictModal(job)}
          />
        ))}

        {syncJobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
            <FolderSync size={48} className="text-surface-300 mx-auto mb-4" />
            <p className="text-surface-600 font-medium">No sync jobs configured</p>
            <p className="text-surface-400 text-sm mt-1">
              Create your first sync job to keep folders synchronized
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-5 py-2.5 bg-primary-500 text-white font-semibold text-sm rounded-xl"
            >
              Create Sync Job
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateSyncModal
          connections={connections}
          onClose={() => setShowCreateModal(false)}
          onCreate={(job) => {
            setSyncJobs([...syncJobs, job]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Conflict Resolution Modal */}
      {showConflictModal && (
        <ConflictModal
          job={showConflictModal}
          onClose={() => setShowConflictModal(null)}
        />
      )}
    </div>
  );
}

function ModeCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-surface-100 p-4 hover:shadow-lg transition-all">
      <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl mb-3", color)}>
        {icon}
      </div>
      <h3 className="font-semibold text-surface-900">{title}</h3>
      <p className="text-xs text-surface-500 mt-1">{description}</p>
    </div>
  );
}

function SyncJobCard({
  job,
  onToggle,
  onDelete,
  onSync,
  onConflicts,
}: {
  job: SyncJob;
  onToggle: () => void;
  onDelete: () => void;
  onSync: () => void;
  onConflicts: () => void;
}) {
  const srcIconComponent = job.sourceConnection ? getConnectionTypeIcon(job.sourceConnection.type) : FolderSync;
  const destIconComponent = job.destConnection ? getConnectionTypeIcon(job.destConnection.type) : FolderSync;
  const progress = job.filesTotal ? (job.filesSync / job.filesTotal) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-surface-100 p-5 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            job.status === "syncing" ? "bg-primary-50" :
            job.status === "active" ? "bg-success-50" :
            job.status === "error" ? "bg-danger-50" :
            "bg-surface-100"
          )}
        >
          {job.status === "syncing" ? (
            <RefreshCw size={24} className="text-primary-500 animate-spin" />
          ) : job.status === "active" ? (
            <Check size={24} className="text-success-500" />
          ) : job.status === "error" ? (
            <AlertCircle size={24} className="text-danger-500" />
          ) : (
            <Pause size={24} className="text-surface-400" />
          )}
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-surface-900">{job.name}</h3>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                job.mode === "two-way" ? "bg-primary-50 text-primary-600" :
                job.mode === "mirror" ? "bg-accent-50 text-accent-600" :
                "bg-success-50 text-success-600"
              )}
            >
              {job.mode.replace("-", " ")}
            </span>
            {job.conflicts > 0 && (
              <button
                onClick={onConflicts}
                className="text-xs px-2 py-0.5 rounded-full bg-warning-50 text-warning-600 font-medium flex items-center gap-1"
              >
                <AlertCircle size={10} />
                {job.conflicts} conflicts
              </button>
            )}
          </div>

          {/* Connection Flow */}
          <div className="flex items-center gap-2 mt-2 text-sm text-surface-500">
            <div className="flex items-center gap-1.5">
              {React.createElement(srcIconComponent, { size: 14 })}
              <span className="truncate max-w-[100px]">{job.sourceConnection?.name || "Local"}</span>
            </div>
            <ArrowRightLeft size={14} className="text-surface-300 flex-shrink-0" />
            <div className="flex items-center gap-1.5">
              {React.createElement(destIconComponent, { size: 14 })}
              <span className="truncate max-w-[100px]">{job.destConnection?.name || "Remote"}</span>
            </div>
          </div>

          {/* Paths */}
          <div className="flex items-center gap-2 mt-1 text-xs text-surface-400">
            <span className="truncate">{job.sourcePath}</span>
            <ChevronRight size={12} />
            <span className="truncate">{job.destPath}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-xs text-surface-500">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{job.schedule}</span>
            </div>
            {job.lastSync && (
              <span>Last: {formatRelativeTime(job.lastSync)}</span>
            )}
            <span>{job.filesSync.toLocaleString()} / {job.filesTotal.toLocaleString()} files</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onSync}
            disabled={job.status === "syncing"}
            className="w-9 h-9 rounded-xl bg-surface-100 hover:bg-primary-100 flex items-center justify-center text-surface-500 hover:text-primary-600 transition-colors disabled:opacity-50"
            title="Sync Now"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onToggle}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
              job.status === "active" || job.status === "syncing"
                ? "bg-warning-100 text-warning-600 hover:bg-warning-200"
                : "bg-success-100 text-success-600 hover:bg-success-200"
            )}
            title={job.status === "active" ? "Pause" : "Resume"}
          >
            {job.status === "active" || job.status === "syncing" ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={onDelete}
            className="w-9 h-9 rounded-xl bg-surface-100 hover:bg-danger-100 flex items-center justify-center text-surface-500 hover:text-danger-600 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {job.status === "syncing" && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-surface-500 mb-1">
            <span>Syncing files...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CreateSyncModal({
  connections,
  onClose,
  onCreate,
}: {
  connections: Connection[];
  onClose: () => void;
  onCreate: (job: SyncJob) => void;
}) {
  const [name, setName] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [destId, setDestId] = useState("");
  const [sourcePath, setSourcePath] = useState("/");
  const [destPath, setDestPath] = useState("/");
  const [mode, setMode] = useState<"two-way" | "mirror" | "backup">("two-way");
  const [schedule, setSchedule] = useState("hourly");

  const handleCreate = () => {
    const srcConn = connections.find((c) => c.id === sourceId);
    const destConn = connections.find((c) => c.id === destId);
    
    onCreate({
      id: Date.now().toString(),
      name: name || "New Sync Job",
      sourceConnection: srcConn ? { id: srcConn.id, name: srcConn.name, type: srcConn.type } : null,
      destConnection: destConn ? { id: destConn.id, name: destConn.name, type: destConn.type } : null,
      sourcePath,
      destPath,
      mode,
      status: "active",
      lastSync: null,
      nextSync: new Date(Date.now() + 3600000).toISOString(),
      schedule: schedule === "realtime" ? "Real-time" : schedule === "hourly" ? "Every hour" : schedule === "daily" ? "Daily" : "Weekly",
      filesTotal: 0,
      filesSync: 0,
      conflicts: 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <FolderSync size={20} className="text-primary-500" />
            </div>
            <h3 className="font-bold text-surface-900">Create Sync Job</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Job Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Sync Job"
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Sync Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(["two-way", "mirror", "backup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-center transition-all",
                    mode === m ? "border-primary-500 bg-primary-50" : "border-surface-200 hover:border-surface-300"
                  )}
                >
                  <span className="text-lg">{m === "two-way" ? "🔄" : m === "mirror" ? "🪞" : "💾"}</span>
                  <p className="text-xs font-medium mt-1 capitalize">{m.replace("-", " ")}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Source</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white"
              >
                <option value="">Local</option>
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Destination</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white"
              >
                <option value="">Local</option>
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Source Path</label>
              <input
                type="text"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Dest Path</label>
              <input
                type="text"
                value={destPath}
                onChange={(e) => setDestPath(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Schedule</label>
            <select
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white"
            >
              <option value="realtime">Real-time (instant)</option>
              <option value="hourly">Every hour</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="ml-auto flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-xl shadow-lg shadow-primary-500/25"
            >
              <Check size={14} />
              Create Sync Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConflictModal({ job, onClose }: { job: SyncJob; onClose: () => void }) {
  const conflicts = [
    { file: "document.pdf", source: "Modified 2 hours ago", dest: "Modified 1 hour ago", size: { src: "2.4 MB", dest: "2.1 MB" } },
    { file: "config.json", source: "Modified yesterday", dest: "Modified 3 hours ago", size: { src: "12 KB", dest: "15 KB" } },
    { file: "data.xlsx", source: "Modified 5 hours ago", dest: "Modified 4 hours ago", size: { src: "890 KB", dest: "920 KB" } },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
          <div>
            <h3 className="font-bold text-surface-900">Resolve Conflicts</h3>
            <p className="text-sm text-surface-500">{job.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {conflicts.map((c, i) => (
            <div key={i} className="bg-surface-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-surface-800">{c.file}</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium bg-primary-500 text-white rounded-lg">
                    Keep Source
                  </button>
                  <button className="px-3 py-1.5 text-xs font-medium bg-accent-500 text-white rounded-lg">
                    Keep Dest
                  </button>
                  <button className="px-3 py-1.5 text-xs font-medium bg-surface-200 text-surface-700 rounded-lg">
                    Keep Both
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-2 bg-white rounded-lg">
                  <p className="text-surface-500">Source</p>
                  <p className="font-medium text-surface-700">{c.source}</p>
                  <p className="text-surface-400">{c.size.src}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <p className="text-surface-500">Destination</p>
                  <p className="font-medium text-surface-700">{c.dest}</p>
                  <p className="text-surface-400">{c.size.dest}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl">
              Cancel
            </button>
            <button className="ml-auto px-6 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-xl">
              Apply Resolutions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
