"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Check,
  AlertCircle,
  Clock,
  ArrowRightLeft,
  Trash2,
  X,
  Pause,
  Play,
  MoreVertical,
} from "./icons";
import {
  getTransferTypeLabel,
  formatBytes,
  formatDate,
  formatRelativeTime,
  cn,
} from "@/lib/utils";
import type { Transfer } from "@/db/schema";

export default function HistoryView() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTransfers = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/transfers");
      const data = await res.json();
      setTransfers(Array.isArray(data) ? data : []);
    } catch {
      // handle error
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchTransfers(false);
    });
    const interval = setInterval(() => fetchTransfers(false), 3000);
    return () => clearInterval(interval);
  }, [fetchTransfers]);

  const handleControl = async (id: string, action: string, priority?: number) => {
    setActionLoading(id);
    try {
      await fetch(`/api/transfers/${id}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, priority }),
      });
      fetchTransfers();
    } catch {
      // handle error
    }
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/transfers/${id}`, { method: "DELETE" });
    setSelectedTransfer(null);
    fetchTransfers();
  };

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch = getTransferTypeLabel(t.transferType)
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort by priority (higher first) then by date
  const sortedTransfers = [...filteredTransfers].sort((a, b) => {
    if (a.status === "in_progress" && b.status !== "in_progress") return -1;
    if (b.status === "in_progress" && a.status !== "in_progress") return 1;
    if (a.status === "queued" && b.status !== "queued") return -1;
    if (b.status === "queued" && a.status !== "queued") return 1;
    return (b.priority || 5) - (a.priority || 5);
  });

  const statusCounts = {
    all: transfers.length,
    in_progress: transfers.filter((t) => t.status === "in_progress").length,
    queued: transfers.filter((t) => t.status === "queued").length,
    paused: transfers.filter((t) => t.status === "paused").length,
    completed: transfers.filter((t) => t.status === "completed").length,
    failed: transfers.filter((t) => t.status === "failed").length,
  };

  const statusTabs = [
    { id: "all", label: "All" },
    { id: "in_progress", label: "Active" },
    { id: "queued", label: "Queued" },
    { id: "paused", label: "Paused" },
    { id: "completed", label: "Done" },
    { id: "failed", label: "Failed" },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Transfer Queue</h2>
          <p className="text-surface-500 text-sm mt-1">
            Monitor, pause, resume, and manage all transfers
          </p>
        </div>
        <button
          onClick={() => fetchTransfers(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-surface-600 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Active transfer summary */}
      {statusCounts.in_progress > 0 && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <RefreshCw size={20} className="animate-spin" />
              </div>
              <div>
                <p className="font-semibold">{statusCounts.in_progress} Active Transfer(s)</p>
                <p className="text-primary-100 text-sm">
                  {statusCounts.queued > 0 && `${statusCounts.queued} queued • `}
                  Processing files...
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                transfers
                  .filter((t) => t.status === "in_progress")
                  .forEach((t) => handleControl(t.id, "pause"));
              }}
              className="px-4 py-2 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30"
            >
              Pause All
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transfers..."
            className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-surface-200 p-1 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap",
                statusFilter === tab.id
                  ? "bg-primary-500 text-white"
                  : "text-surface-500 hover:bg-surface-50"
              )}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">
                {statusCounts[tab.id as keyof typeof statusCounts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Transfer list */}
      {loading && transfers.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sortedTransfers.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <ArrowRightLeft size={32} className="text-surface-300" />
          </div>
          <p className="text-surface-600 font-medium">No transfers found</p>
          <p className="text-surface-400 text-sm mt-1">
            {search ? "Try a different search term" : "Start a new transfer to see it here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTransfers.map((t) => (
            <TransferCard
              key={t.id}
              transfer={t}
              isLoading={actionLoading === t.id}
              onPause={() => handleControl(t.id, "pause")}
              onResume={() => handleControl(t.id, "resume")}
              onCancel={() => handleControl(t.id, "cancel")}
              onRetry={() => handleControl(t.id, "retry")}
              onPriorityChange={(p) => handleControl(t.id, "priority", p)}
              onDelete={() => handleDelete(t.id)}
              onSelect={() => setSelectedTransfer(t)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTransfer && (
        <TransferDetailModal
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
          onDelete={() => handleDelete(selectedTransfer.id)}
          onPause={() => handleControl(selectedTransfer.id, "pause")}
          onResume={() => handleControl(selectedTransfer.id, "resume")}
          onCancel={() => handleControl(selectedTransfer.id, "cancel")}
          onRetry={() => handleControl(selectedTransfer.id, "retry")}
        />
      )}
    </div>
  );
}

function TransferCard({
  transfer: t,
  isLoading,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onPriorityChange,
  onDelete,
  onSelect,
}: {
  transfer: Transfer;
  isLoading: boolean;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onPriorityChange: (p: number) => void;
  onDelete: () => void;
  onSelect: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const progress = t.totalSize ? ((t.transferredSize || 0) / t.totalSize) * 100 : 0;

  return (
    <div
      className="bg-white rounded-2xl border border-surface-100 p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-center gap-4">
        {/* Status indicator */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative",
            t.status === "completed" ? "bg-success-50" :
            t.status === "failed" ? "bg-danger-50" :
            t.status === "in_progress" ? "bg-primary-50" :
            t.status === "paused" ? "bg-warning-50" :
            t.status === "cancelled" ? "bg-surface-100" :
            "bg-surface-100"
          )}
        >
          {t.status === "completed" ? (
            <Check size={20} className="text-success-500" />
          ) : t.status === "failed" ? (
            <AlertCircle size={20} className="text-danger-500" />
          ) : t.status === "in_progress" ? (
            <RefreshCw size={20} className="text-primary-500 animate-spin" />
          ) : t.status === "paused" ? (
            <Pause size={20} className="text-warning-500" />
          ) : t.status === "cancelled" ? (
            <X size={20} className="text-surface-400" />
          ) : (
            <Clock size={20} className="text-surface-400" />
          )}
          
          {/* Priority badge */}
          {t.priority && t.priority > 5 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-500 text-white text-[8px] font-bold flex items-center justify-center">
              !
            </div>
          )}
        </div>

        {/* Transfer info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-surface-900 text-sm">
              {getTransferTypeLabel(t.transferType)}
            </h3>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                t.status === "completed" ? "bg-success-50 text-success-600" :
                t.status === "failed" ? "bg-danger-50 text-danger-600" :
                t.status === "in_progress" ? "bg-primary-50 text-primary-600" :
                t.status === "paused" ? "bg-warning-50 text-warning-600" :
                "bg-surface-100 text-surface-500"
              )}
            >
              {t.status.replace("_", " ")}
            </span>
            {t.currentFile && t.status === "in_progress" && (
              <span className="text-xs text-surface-400 truncate max-w-[150px]">
                {t.currentFile}
              </span>
            )}
          </div>
          <p className="text-xs text-surface-400 mt-0.5 truncate">
            {t.sourcePath} → {t.destinationPath}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6 text-right">
          <div>
            <p className="text-xs text-surface-400">Files</p>
            <p className="text-sm font-semibold text-surface-700">
              {t.transferredFiles}/{t.totalFiles}
            </p>
          </div>
          <div>
            <p className="text-xs text-surface-400">Size</p>
            <p className="text-sm font-semibold text-surface-700">
              {formatBytes(t.transferredSize || 0)}/{formatBytes(t.totalSize || 0)}
            </p>
          </div>
          {t.speed && t.status === "in_progress" && (
            <div>
              <p className="text-xs text-surface-400">Speed</p>
              <p className="text-sm font-semibold text-primary-600">{t.speed}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-surface-400">Time</p>
            <p className="text-sm font-medium text-surface-500">
              {formatRelativeTime(t.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {t.status === "in_progress" && (
            <button
              onClick={onPause}
              disabled={isLoading}
              className="w-8 h-8 rounded-lg bg-surface-100 hover:bg-warning-100 flex items-center justify-center text-surface-500 hover:text-warning-600 transition-colors"
              title="Pause"
            >
              <Pause size={14} />
            </button>
          )}
          {t.status === "paused" && (
            <button
              onClick={onResume}
              disabled={isLoading}
              className="w-8 h-8 rounded-lg bg-surface-100 hover:bg-success-100 flex items-center justify-center text-surface-500 hover:text-success-600 transition-colors"
              title="Resume"
            >
              <Play size={14} />
            </button>
          )}
          {t.status === "failed" && (
            <button
              onClick={onRetry}
              disabled={isLoading}
              className="w-8 h-8 rounded-lg bg-surface-100 hover:bg-primary-100 flex items-center justify-center text-surface-500 hover:text-primary-600 transition-colors"
              title="Retry"
            >
              <RefreshCw size={14} />
            </button>
          )}
          {(t.status === "in_progress" || t.status === "paused" || t.status === "queued") && (
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="w-8 h-8 rounded-lg bg-surface-100 hover:bg-danger-100 flex items-center justify-center text-surface-500 hover:text-danger-600 transition-colors"
              title="Cancel"
            >
              <X size={14} />
            </button>
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center text-surface-400"
            >
              <MoreVertical size={14} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-9 w-40 bg-white rounded-xl shadow-lg border border-surface-100 py-1 z-20">
                  <div className="px-3 py-2">
                    <p className="text-xs text-surface-500 mb-1">Priority</p>
                    <div className="flex gap-1">
                      {[1, 3, 5, 7, 10].map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            onPriorityChange(p);
                            setShowMenu(false);
                          }}
                          className={cn(
                            "w-6 h-6 rounded text-xs font-medium",
                            t.priority === p
                              ? "bg-primary-500 text-white"
                              : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <hr className="my-1 border-surface-100" />
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger-500 hover:bg-danger-50"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {(t.status === "in_progress" || t.status === "paused") && (
        <div className="mt-3 w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              t.status === "paused"
                ? "bg-warning-500"
                : "bg-gradient-to-r from-primary-400 to-primary-600 progress-bar"
            )}
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function TransferDetailModal({
  transfer: t,
  onClose,
  onDelete,
  onPause,
  onResume,
  onCancel,
  onRetry,
}: {
  transfer: Transfer;
  onClose: () => void;
  onDelete: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
          <h3 className="font-bold text-surface-900">Transfer Details</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-surface-50 rounded-xl">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                t.status === "completed" ? "bg-success-50" :
                t.status === "failed" ? "bg-danger-50" :
                "bg-primary-50"
              )}
            >
              {t.status === "completed" ? (
                <Check size={20} className="text-success-500" />
              ) : t.status === "failed" ? (
                <AlertCircle size={20} className="text-danger-500" />
              ) : t.status === "paused" ? (
                <Pause size={20} className="text-warning-500" />
              ) : (
                <RefreshCw size={20} className="text-primary-500 animate-spin" />
              )}
            </div>
            <div>
              <p className="font-semibold text-surface-900">
                {getTransferTypeLabel(t.transferType)}
              </p>
              <p className="text-xs text-surface-400 capitalize">
                Status: {t.status.replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Progress */}
          {(t.status === "in_progress" || t.status === "paused") && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Progress</span>
                <span className="font-semibold text-surface-700">
                  {t.totalSize ? Math.round(((t.transferredSize || 0) / t.totalSize) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    t.status === "paused" ? "bg-warning-500" : "bg-primary-500"
                  )}
                  style={{
                    width: `${t.totalSize ? ((t.transferredSize || 0) / t.totalSize) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Source" value={t.sourcePath} />
            <InfoItem label="Destination" value={t.destinationPath} />
            <InfoItem label="Total Files" value={String(t.totalFiles || 0)} />
            <InfoItem label="Transferred" value={String(t.transferredFiles || 0)} />
            <InfoItem label="Total Size" value={formatBytes(t.totalSize || 0)} />
            <InfoItem label="Speed" value={t.speed || "—"} />
            <InfoItem label="Priority" value={String(t.priority || 5)} />
            <InfoItem label="Retries" value={`${t.retryCount || 0}/${t.maxRetries || 3}`} />
            <InfoItem label="Started" value={formatDate(t.startedAt)} />
            <InfoItem label="Completed" value={formatDate(t.completedAt)} />
          </div>

          {t.errorMessage && (
            <div className="p-3 bg-danger-50 rounded-xl text-sm text-danger-600">
              <strong>Error:</strong> {t.errorMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {t.status === "in_progress" && (
              <button
                onClick={() => { onPause(); onClose(); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-warning-600 bg-warning-50 rounded-xl hover:bg-warning-100"
              >
                <Pause size={14} /> Pause
              </button>
            )}
            {t.status === "paused" && (
              <button
                onClick={() => { onResume(); onClose(); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-success-600 bg-success-50 rounded-xl hover:bg-success-100"
              >
                <Play size={14} /> Resume
              </button>
            )}
            {t.status === "failed" && (
              <button
                onClick={() => { onRetry(); onClose(); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100"
              >
                <RefreshCw size={14} /> Retry
              </button>
            )}
            {(t.status === "in_progress" || t.status === "paused" || t.status === "queued") && (
              <button
                onClick={() => { onCancel(); onClose(); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-600 bg-surface-100 rounded-xl hover:bg-surface-200"
              >
                <X size={14} /> Cancel
              </button>
            )}
            <button
              onClick={() => { onDelete(); onClose(); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-danger-600 border border-danger-200 rounded-xl hover:bg-danger-50"
            >
              <Trash2 size={14} /> Delete
            </button>
            <button
              onClick={onClose}
              className="ml-auto px-5 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-surface-50 rounded-xl">
      <p className="text-xs text-surface-400 font-medium">{label}</p>
      <p className="text-sm font-semibold text-surface-800 mt-0.5 truncate">{value}</p>
    </div>
  );
}
