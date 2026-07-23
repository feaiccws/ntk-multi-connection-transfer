"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowRight,
  Upload,
  Download,
  Cloud,
  HardDrive,
  Server,
  Globe,
  Check,
  AlertCircle,
  Plus,
  FolderOpen,
  File,
  ChevronRight,
} from "./icons";
import { getConnectionTypeIcon } from "./icons";
import {
  getConnectionLabel,
  getTransferTypeLabel,
  cn,
} from "@/lib/utils";
import type { Connection } from "@/db/schema";

const transferTypes = [
  {
    id: "local_to_remote",
    label: "Local → Remote",
    desc: "Upload files from your device to a remote server",
    icon: Upload,
    srcLabel: "Local",
    dstLabel: "Remote",
    srcTypes: ["local"],
    dstTypes: ["ftp", "sftp", "ftps", "webdav"],
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    id: "remote_to_local",
    label: "Remote → Local",
    desc: "Download files from remote server to your device",
    icon: Download,
    srcLabel: "Remote",
    dstLabel: "Local",
    srcTypes: ["ftp", "sftp", "ftps", "webdav"],
    dstTypes: ["local"],
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "remote_to_remote",
    label: "Remote → Remote",
    desc: "Transfer files between two remote servers",
    icon: Server,
    srcLabel: "Source Server",
    dstLabel: "Destination Server",
    srcTypes: ["ftp", "sftp", "ftps", "webdav"],
    dstTypes: ["ftp", "sftp", "ftps", "webdav"],
    gradient: "from-violet-500 to-purple-500",
  },
  {
    id: "cloud_to_cloud",
    label: "Cloud → Cloud",
    desc: "Sync between cloud storage providers",
    icon: Cloud,
    srcLabel: "Source Cloud",
    dstLabel: "Destination Cloud",
    srcTypes: ["s3", "google_drive", "dropbox", "onedrive", "azure_blob"],
    dstTypes: ["s3", "google_drive", "dropbox", "onedrive", "azure_blob"],
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "cloud_to_remote",
    label: "Cloud → Remote",
    desc: "Transfer from cloud storage to a remote server",
    icon: Globe,
    srcLabel: "Cloud Storage",
    dstLabel: "Remote Server",
    srcTypes: ["s3", "google_drive", "dropbox", "onedrive", "azure_blob"],
    dstTypes: ["ftp", "sftp", "ftps", "webdav"],
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "cloud_to_local",
    label: "Cloud → Local",
    desc: "Download from cloud storage to your device",
    icon: Download,
    srcLabel: "Cloud Storage",
    dstLabel: "Local",
    srcTypes: ["s3", "google_drive", "dropbox", "onedrive", "azure_blob"],
    dstTypes: ["local"],
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "local_to_cloud",
    label: "Local → Cloud",
    desc: "Upload files to cloud storage",
    icon: Upload,
    srcLabel: "Local",
    dstLabel: "Cloud Storage",
    srcTypes: ["local"],
    dstTypes: ["s3", "google_drive", "dropbox", "onedrive", "azure_blob"],
    gradient: "from-lime-500 to-green-500",
  },
  {
    id: "local_to_local",
    label: "Local → Local",
    desc: "Copy files between local directories",
    icon: HardDrive,
    srcLabel: "Source Folder",
    dstLabel: "Destination Folder",
    srcTypes: ["local"],
    dstTypes: ["local"],
    gradient: "from-stone-500 to-zinc-600",
  },
  {
    id: "remote_to_cloud",
    label: "Remote → Cloud",
    desc: "Backup remote server files to cloud",
    icon: Cloud,
    srcLabel: "Remote Server",
    dstLabel: "Cloud Storage",
    srcTypes: ["ftp", "sftp", "ftps", "webdav"],
    dstTypes: ["s3", "google_drive", "dropbox", "onedrive", "azure_blob"],
    gradient: "from-fuchsia-500 to-pink-500",
  },
];

interface TransferViewProps {
  onTransferCreated: () => void;
}

export default function TransferView({ onTransferCreated }: TransferViewProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<(typeof transferTypes)[0] | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [destId, setDestId] = useState("");
  const [sourcePath, setSourcePath] = useState("/");
  const [destPath, setDestPath] = useState("/");
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/connections");
      const data = await res.json();
      setConnections(Array.isArray(data) ? data : []);
    } catch {
      // handle error
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchConnections();
    });
  }, [fetchConnections]);

  const sourceConnections = selectedType
    ? connections.filter((c) => selectedType.srcTypes.includes(c.type))
    : [];
  const destConnections = selectedType
    ? connections.filter((c) => selectedType.dstTypes.includes(c.type))
    : [];

  const handleCreate = async () => {
    if (!selectedType) return;
    setCreating(true);
    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceConnectionId: sourceId || null,
          destinationConnectionId: destId || null,
          transferType: selectedType.id,
          sourcePath,
          destinationPath: destPath,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        onTransferCreated();
        setTimeout(() => {
          setSuccess(false);
          setStep(1);
          setSelectedType(null);
          setSourceId("");
          setDestId("");
          setSourcePath("/");
          setDestPath("/");
        }, 3000);
      }
    } catch {
      // handle error
    }
    setCreating(false);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-success-500" />
          </div>
          <h3 className="text-xl font-bold text-surface-900">
            Transfer Started!
          </h3>
          <p className="text-surface-500 mt-2">
            Your file transfer is now in progress
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-surface-900">New Transfer</h2>
        <p className="text-surface-500 text-sm mt-1">
          Select transfer type and configure your file transfer
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                step >= s
                  ? "bg-primary-500 text-white"
                  : "bg-surface-100 text-surface-400"
              )}
            >
              {step > s ? <Check size={16} /> : s}
            </div>
            <span
              className={cn(
                "text-xs font-medium hidden sm:block",
                step >= s ? "text-surface-900" : "text-surface-400"
              )}
            >
              {s === 1 ? "Transfer Type" : s === 2 ? "Select Endpoints" : "Configure & Start"}
            </span>
            {s < 3 && (
              <div
                className={cn(
                  "flex-1 h-0.5 rounded",
                  step > s ? "bg-primary-500" : "bg-surface-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Transfer Type */}
      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {transferTypes.map((tt) => {
            const Icon = tt.icon;
            return (
              <button
                key={tt.id}
                onClick={() => {
                  setSelectedType(tt);
                  setStep(2);
                }}
                className="bg-white rounded-2xl border border-surface-100 p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tt.gradient} flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-surface-900">{tt.label}</h3>
                <p className="text-xs text-surface-400 mt-1">{tt.desc}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2: Select Endpoints */}
      {step === 2 && selectedType && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-surface-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedType.gradient} flex items-center justify-center shadow-md`}
              >
                <selectedType.icon size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">
                  {selectedType.label}
                </h3>
                <p className="text-xs text-surface-400">{selectedType.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-3">
                  📤 {selectedType.srcLabel}
                </label>
                {sourceConnections.length === 0 ? (
                  <div className="border-2 border-dashed border-surface-200 rounded-xl p-6 text-center">
                    <AlertCircle
                      size={24}
                      className="text-surface-300 mx-auto mb-2"
                    />
                    <p className="text-sm text-surface-500">
                      No matching connections
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      Add a {selectedType.srcTypes.join(" / ")} connection first
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sourceConnections.map((c) => {
                      const CIcon = getConnectionTypeIcon(c.type);
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSourceId(c.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                            sourceId === c.id
                              ? "border-primary-400 bg-primary-50"
                              : "border-surface-100 hover:border-surface-300"
                          )}
                        >
                          <CIcon size={20} className="text-surface-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {c.name}
                            </p>
                            <p className="text-xs text-surface-400">
                              {getConnectionLabel(c.type)}
                            </p>
                          </div>
                          {sourceId === c.id && (
                            <Check
                              size={16}
                              className="text-primary-500 flex-shrink-0"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-3">
                  📥 {selectedType.dstLabel}
                </label>
                {destConnections.length === 0 ? (
                  <div className="border-2 border-dashed border-surface-200 rounded-xl p-6 text-center">
                    <AlertCircle
                      size={24}
                      className="text-surface-300 mx-auto mb-2"
                    />
                    <p className="text-sm text-surface-500">
                      No matching connections
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      Add a {selectedType.dstTypes.join(" / ")} connection first
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {destConnections.map((c) => {
                      const CIcon = getConnectionTypeIcon(c.type);
                      return (
                        <button
                          key={c.id}
                          onClick={() => setDestId(c.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                            destId === c.id
                              ? "border-primary-400 bg-primary-50"
                              : "border-surface-100 hover:border-surface-300"
                          )}
                        >
                          <CIcon size={20} className="text-surface-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {c.name}
                            </p>
                            <p className="text-xs text-surface-400">
                              {getConnectionLabel(c.type)}
                            </p>
                          </div>
                          {destId === c.id && (
                            <Check
                              size={16}
                              className="text-primary-500 flex-shrink-0"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setStep(1);
                setSelectedType(null);
              }}
              className="px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!sourceId && sourceConnections.length > 0}
              className="ml-auto flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50"
            >
              Continue
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Configure & Start */}
      {step === 3 && selectedType && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-surface-100 p-6">
            {/* Visual source -> dest */}
            <div className="flex items-center justify-center gap-4 mb-8 py-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-2">
                  <FolderOpen size={28} className="text-surface-500" />
                </div>
                <p className="text-sm font-medium text-surface-700">
                  {selectedType.srcLabel}
                </p>
              </div>
              <div className="flex items-center gap-1 text-primary-400">
                <div className="w-12 h-0.5 bg-primary-300" />
                <ArrowRight size={20} />
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-2">
                  <File size={28} className="text-primary-500" />
                </div>
                <p className="text-sm font-medium text-surface-700">
                  {selectedType.dstLabel}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Source Path
                </label>
                <input
                  type="text"
                  value={sourcePath}
                  onChange={(e) => setSourcePath(e.target.value)}
                  placeholder="/home/user/files"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Destination Path
                </label>
                <input
                  type="text"
                  value={destPath}
                  onChange={(e) => setDestPath(e.target.value)}
                  placeholder="/backup/2024"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Transfer Options */}
            <div className="mt-6 p-4 bg-surface-50 rounded-xl">
              <h4 className="text-sm font-semibold text-surface-700 mb-3">
                Transfer Options
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-sm transition-all">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded accent-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-surface-700">
                      Overwrite existing
                    </p>
                    <p className="text-xs text-surface-400">
                      Replace files that already exist
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-sm transition-all">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-surface-700">
                      Preserve timestamps
                    </p>
                    <p className="text-xs text-surface-400">
                      Keep original modification dates
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-sm transition-all">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-surface-700">
                      Verify checksums
                    </p>
                    <p className="text-xs text-surface-400">
                      Verify file integrity after transfer
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-sm transition-all">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-surface-700">
                      Compress files
                    </p>
                    <p className="text-xs text-surface-400">
                      Compress before transfer for speed
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="ml-auto flex items-center gap-2 px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting Transfer...
                </>
              ) : (
                <>
                  <ArrowRight size={18} />
                  Start Transfer
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
