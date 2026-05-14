"use client";

import { useState } from "react";
import {
  HardDrive,
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Trash2,
  Image,
  Video,
  Music,
  FileArchive,
  FileCode,
  FileText,
} from "./icons";
import { formatBytes, cn } from "@/lib/utils";

interface StorageItem {
  name: string;
  path: string;
  size: number;
  type: "folder" | "file";
  children?: StorageItem[];
  fileType?: string;
}

const mockStorageData: StorageItem[] = [
  {
    name: "Documents",
    path: "/Documents",
    size: 15_678_901_234,
    type: "folder",
    children: [
      { name: "Work", path: "/Documents/Work", size: 8_234_567_890, type: "folder" },
      { name: "Personal", path: "/Documents/Personal", size: 5_123_456_789, type: "folder" },
      { name: "Archive", path: "/Documents/Archive", size: 2_320_876_555, type: "folder" },
    ],
  },
  {
    name: "Media",
    path: "/Media",
    size: 89_234_567_890,
    type: "folder",
    children: [
      { name: "Videos", path: "/Media/Videos", size: 67_890_123_456, type: "folder" },
      { name: "Photos", path: "/Media/Photos", size: 18_234_567_890, type: "folder" },
      { name: "Music", path: "/Media/Music", size: 3_109_876_544, type: "folder" },
    ],
  },
  {
    name: "Backups",
    path: "/Backups",
    size: 45_678_901_234,
    type: "folder",
    children: [
      { name: "2024", path: "/Backups/2024", size: 25_678_901_234, type: "folder" },
      { name: "2023", path: "/Backups/2023", size: 15_000_000_000, type: "folder" },
      { name: "Legacy", path: "/Backups/Legacy", size: 5_000_000_000, type: "folder" },
    ],
  },
  {
    name: "Downloads",
    path: "/Downloads",
    size: 12_345_678_901,
    type: "folder",
  },
  {
    name: "Projects",
    path: "/Projects",
    size: 8_765_432_109,
    type: "folder",
  },
];

const fileTypeBreakdown = [
  { type: "Videos", icon: Video, size: 67_890_123_456, color: "bg-purple-500", percent: 40 },
  { type: "Images", icon: Image, size: 18_234_567_890, color: "bg-pink-500", percent: 11 },
  { type: "Documents", icon: FileText, size: 15_678_901_234, color: "bg-blue-500", percent: 9 },
  { type: "Archives", icon: FileArchive, size: 45_678_901_234, color: "bg-amber-500", percent: 27 },
  { type: "Code", icon: FileCode, size: 8_765_432_109, color: "bg-green-500", percent: 5 },
  { type: "Audio", icon: Music, size: 3_109_876_544, color: "bg-cyan-500", percent: 2 },
  { type: "Other", icon: File, size: 10_345_678_901, color: "bg-gray-400", percent: 6 },
];

export default function StorageAnalyzer() {
  const [selectedConnection, setSelectedConnection] = useState("all");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/Documents", "/Media"]));
  const [analyzing, setAnalyzing] = useState(false);

  const totalStorage = mockStorageData.reduce((a, b) => a + b.size, 0);
  const usedStorage = totalStorage;
  const freeStorage = 500_000_000_000 - usedStorage; // Assume 500GB total
  const usagePercent = (usedStorage / 500_000_000_000) * 100;

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Storage Analyzer</h2>
          <p className="text-surface-500 text-sm mt-1">
            Visualize and optimize your storage usage
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedConnection}
            onChange={(e) => setSelectedConnection(e.target.value)}
            className="px-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm"
          >
            <option value="all">All Connections</option>
            <option value="local">Local Storage</option>
            <option value="s3">Amazon S3</option>
            <option value="gdrive">Google Drive</option>
          </select>
          <button
            onClick={analyze}
            disabled={analyzing}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={analyzing ? "animate-spin" : ""} />
            {analyzing ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="bg-white rounded-2xl border border-surface-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-surface-900">Storage Overview</h3>
          <span className="text-sm text-surface-500">
            {formatBytes(usedStorage)} of {formatBytes(500_000_000_000)} used
          </span>
        </div>
        
        {/* Usage Bar */}
        <div className="h-8 bg-surface-100 rounded-full overflow-hidden flex">
          {fileTypeBreakdown.map((type, i) => (
            <div
              key={i}
              className={cn("h-full transition-all hover:opacity-80 cursor-pointer", type.color)}
              style={{ width: `${type.percent}%` }}
              title={`${type.type}: ${formatBytes(type.size)}`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {fileTypeBreakdown.map((type, i) => {
            const Icon = type.icon;
            return (
              <div key={i} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", type.color)} />
                <Icon size={14} className="text-surface-400" />
                <span className="text-sm text-surface-600">{type.type}</span>
                <span className="text-xs text-surface-400">({type.percent}%)</span>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-surface-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-surface-900">{formatBytes(usedStorage)}</p>
            <p className="text-sm text-surface-500">Used Space</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">{formatBytes(freeStorage)}</p>
            <p className="text-sm text-surface-500">Free Space</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-surface-900">{usagePercent.toFixed(1)}%</p>
            <p className="text-sm text-surface-500">Usage</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Folder Tree */}
        <div className="bg-white rounded-2xl border border-surface-100 p-5">
          <h3 className="font-semibold text-surface-900 mb-4">Folder Breakdown</h3>
          <div className="space-y-1">
            {mockStorageData.map((item) => (
              <FolderItem
                key={item.path}
                item={item}
                totalSize={totalStorage}
                expanded={expandedFolders.has(item.path)}
                onToggle={() => toggleFolder(item.path)}
                depth={0}
              />
            ))}
          </div>
        </div>

        {/* Largest Files/Folders */}
        <div className="bg-white rounded-2xl border border-surface-100 p-5">
          <h3 className="font-semibold text-surface-900 mb-4">Largest Items</h3>
          <div className="space-y-3">
            {[...mockStorageData]
              .sort((a, b) => b.size - a.size)
              .slice(0, 5)
              .map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-surface-600">#{i + 1}</span>
                  </div>
                  <Folder size={20} className="text-warning-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-800 truncate">{item.name}</p>
                    <p className="text-xs text-surface-400">{item.path}</p>
                  </div>
                  <span className="font-semibold text-surface-700">{formatBytes(item.size)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-4">💡 Optimization Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="font-semibold">Clean Old Backups</p>
            <p className="text-sm text-primary-100 mt-1">
              Backups from 2023 could free up {formatBytes(15_000_000_000)}
            </p>
            <button className="mt-3 px-4 py-2 bg-white text-primary-600 font-semibold text-sm rounded-lg hover:bg-primary-50">
              Review Backups
            </button>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="font-semibold">Remove Duplicates</p>
            <p className="text-sm text-primary-100 mt-1">
              15 duplicate files found ({formatBytes(267_864_949)})
            </p>
            <button className="mt-3 px-4 py-2 bg-white text-primary-600 font-semibold text-sm rounded-lg hover:bg-primary-50">
              Find Duplicates
            </button>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="font-semibold">Compress Videos</p>
            <p className="text-sm text-primary-100 mt-1">
              Large videos could save ~{formatBytes(20_000_000_000)}
            </p>
            <button className="mt-3 px-4 py-2 bg-white text-primary-600 font-semibold text-sm rounded-lg hover:bg-primary-50">
              Optimize Media
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderItem({
  item,
  totalSize,
  expanded,
  onToggle,
  depth,
}: {
  item: StorageItem;
  totalSize: number;
  expanded: boolean;
  onToggle: () => void;
  depth: number;
}) {
  const percent = (item.size / totalSize) * 100;

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface-50 transition-colors"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {item.children ? (
          expanded ? (
            <ChevronDown size={16} className="text-surface-400" />
          ) : (
            <ChevronRight size={16} className="text-surface-400" />
          )
        ) : (
          <div className="w-4" />
        )}
        <Folder size={18} className="text-warning-500" />
        <span className="text-sm font-medium text-surface-800 flex-1 text-left">{item.name}</span>
        <div className="w-24 h-2 bg-surface-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${Math.max(percent, 2)}%` }}
          />
        </div>
        <span className="text-xs text-surface-500 w-20 text-right">{formatBytes(item.size)}</span>
      </button>
      {expanded && item.children && (
        <div>
          {item.children.map((child) => (
            <FolderItem
              key={child.path}
              item={child}
              totalSize={totalSize}
              expanded={false}
              onToggle={() => {}}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
