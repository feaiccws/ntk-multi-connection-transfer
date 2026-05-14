"use client";

import { useState } from "react";
import {
  Search,
  File,
  Folder,
  Trash2,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "./icons";
import { formatBytes, cn } from "@/lib/utils";

interface DuplicateFile {
  path: string;
  name: string;
  size: number;
  modified: string;
  connection: string;
}

interface DuplicateGroup {
  hash: string;
  files: DuplicateFile[];
  totalSize: number;
}

const mockDuplicates: DuplicateGroup[] = [
  {
    hash: "abc123",
    files: [
      { path: "/Documents/report.pdf", name: "report.pdf", size: 2456789, modified: "2024-01-15", connection: "Local" },
      { path: "/Backups/old/report.pdf", name: "report.pdf", size: 2456789, modified: "2024-01-10", connection: "Local" },
      { path: "/Google Drive/Work/report.pdf", name: "report.pdf", size: 2456789, modified: "2024-01-12", connection: "Google Drive" },
    ],
    totalSize: 7370367,
  },
  {
    hash: "def456",
    files: [
      { path: "/Images/photo_001.jpg", name: "photo_001.jpg", size: 4567890, modified: "2024-01-14", connection: "Local" },
      { path: "/Dropbox/Photos/photo_001.jpg", name: "photo_001.jpg", size: 4567890, modified: "2024-01-14", connection: "Dropbox" },
    ],
    totalSize: 9135780,
  },
  {
    hash: "ghi789",
    files: [
      { path: "/Downloads/installer.exe", name: "installer.exe", size: 125678901, modified: "2024-01-13", connection: "Local" },
      { path: "/Backups/software/installer.exe", name: "installer.exe", size: 125678901, modified: "2024-01-11", connection: "Local" },
    ],
    totalSize: 251357802,
  },
  {
    hash: "jkl012",
    files: [
      { path: "/Documents/notes.txt", name: "notes.txt", size: 1234, modified: "2024-01-15", connection: "Local" },
      { path: "/S3/archive/notes.txt", name: "notes.txt", size: 1234, modified: "2024-01-10", connection: "S3" },
      { path: "/OneDrive/Documents/notes.txt", name: "notes.txt", size: 1234, modified: "2024-01-08", connection: "OneDrive" },
      { path: "/Backups/notes.txt", name: "notes.txt", size: 1234, modified: "2024-01-05", connection: "Local" },
    ],
    totalSize: 4936,
  },
];

export default function DuplicateFinder() {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>(mockDuplicates);
  const [scanning, setScanning] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(mockDuplicates.map((d) => d.hash)));
  const [scanComplete, setScanComplete] = useState(true);

  const totalDuplicates = duplicates.reduce((a, g) => a + g.files.length - 1, 0);
  const totalWastedSpace = duplicates.reduce((a, g) => a + g.totalSize - g.files[0].size, 0);

  const startScan = () => {
    setScanning(true);
    setScanComplete(false);
    // Simulate scanning
    setTimeout(() => {
      setScanning(false);
      setScanComplete(true);
    }, 3000);
  };

  const toggleGroup = (hash: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(hash)) {
      newExpanded.delete(hash);
    } else {
      newExpanded.add(hash);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleFileSelection = (path: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedFiles(newSelected);
  };

  const selectAllDuplicates = () => {
    const allDuplicates = new Set<string>();
    duplicates.forEach((group) => {
      // Select all except the first (keep original)
      group.files.slice(1).forEach((f) => allDuplicates.add(f.path));
    });
    setSelectedFiles(allDuplicates);
  };

  const deleteSelected = () => {
    // Remove selected files from duplicates
    const newDuplicates = duplicates
      .map((group) => ({
        ...group,
        files: group.files.filter((f) => !selectedFiles.has(f.path)),
      }))
      .filter((group) => group.files.length > 1);
    setDuplicates(newDuplicates);
    setSelectedFiles(new Set());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Duplicate Finder</h2>
          <p className="text-surface-500 text-sm mt-1">
            Find and remove duplicate files across all your connections
          </p>
        </div>
        <button
          onClick={startScan}
          disabled={scanning}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={scanning ? "animate-spin" : ""} />
          {scanning ? "Scanning..." : "Scan for Duplicates"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-surface-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center">
              <AlertCircle size={24} className="text-warning-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{duplicates.length}</p>
              <p className="text-sm text-surface-500">Duplicate Groups</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-danger-50 flex items-center justify-center">
              <File size={24} className="text-danger-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{totalDuplicates}</p>
              <p className="text-sm text-surface-500">Duplicate Files</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center">
              <Trash2 size={24} className="text-accent-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{formatBytes(totalWastedSpace)}</p>
              <p className="text-sm text-surface-500">Potential Savings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      {selectedFiles.size > 0 && (
        <div className="bg-primary-50 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-primary-700">
            {selectedFiles.size} file(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFiles(new Set())}
              className="px-4 py-2 text-sm font-medium text-surface-600 bg-white rounded-lg hover:bg-surface-50"
            >
              Clear Selection
            </button>
            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-danger-500 rounded-lg hover:bg-danger-600"
            >
              <Trash2 size={14} />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={selectAllDuplicates}
          className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
        >
          Select All Duplicates (Keep Originals)
        </button>
        <button
          onClick={() => setExpandedGroups(new Set(duplicates.map((d) => d.hash)))}
          className="px-4 py-2 text-sm font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200"
        >
          Expand All
        </button>
        <button
          onClick={() => setExpandedGroups(new Set())}
          className="px-4 py-2 text-sm font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200"
        >
          Collapse All
        </button>
      </div>

      {/* Duplicate Groups */}
      <div className="space-y-4">
        {duplicates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
            <Check size={48} className="text-success-500 mx-auto mb-4" />
            <p className="text-surface-800 font-semibold">No duplicates found!</p>
            <p className="text-surface-500 text-sm mt-1">Your files are clean and organized.</p>
          </div>
        ) : (
          duplicates.map((group) => (
            <div key={group.hash} className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.hash)}
                className="w-full flex items-center justify-between p-4 hover:bg-surface-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedGroups.has(group.hash) ? (
                    <ChevronDown size={18} className="text-surface-400" />
                  ) : (
                    <ChevronRight size={18} className="text-surface-400" />
                  )}
                  <File size={20} className="text-surface-400" />
                  <div className="text-left">
                    <p className="font-semibold text-surface-900">{group.files[0].name}</p>
                    <p className="text-xs text-surface-400">
                      {group.files.length} copies • {formatBytes(group.files[0].size)} each
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-danger-600">
                    Wasted: {formatBytes(group.totalSize - group.files[0].size)}
                  </p>
                </div>
              </button>

              {/* Group Files */}
              {expandedGroups.has(group.hash) && (
                <div className="border-t border-surface-100">
                  {group.files.map((file, index) => (
                    <div
                      key={file.path}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors",
                        index === 0 && "bg-success-50/50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.path)}
                        onChange={() => toggleFileSelection(file.path)}
                        disabled={index === 0}
                        className="rounded accent-primary-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-surface-800 truncate">{file.path}</p>
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-success-100 text-success-700 text-xs font-medium rounded-full">
                              Original
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                          <span>{file.connection}</span>
                          <span>•</span>
                          <span>{file.modified}</span>
                          <span>•</span>
                          <span>{formatBytes(file.size)}</span>
                        </div>
                      </div>
                      {index !== 0 && (
                        <button
                          onClick={() => {
                            setSelectedFiles(new Set([file.path]));
                            deleteSelected();
                          }}
                          className="p-2 text-surface-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Scanning Overlay */}
      {scanning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
            <RefreshCw size={48} className="text-primary-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-bold text-surface-900">Scanning for Duplicates</h3>
            <p className="text-surface-500 text-sm mt-2">
              Analyzing files across all connections...
            </p>
            <div className="mt-4 h-2 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
