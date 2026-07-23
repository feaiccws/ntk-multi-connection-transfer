"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Folder,
  File,
  FolderOpen,
  ChevronRight,
  Search,
  RefreshCw,
  Trash2,
  Check,
  X,
  ArrowLeft,
  Home,
  MoreVertical,
  Download,
  Upload,
  Copy,
  Eye,
  Edit3,
  Star,
  Plus,
  ArrowRight,
} from "./icons";
import { getConnectionTypeIcon } from "./icons";
import { formatBytes, formatDate, getConnectionLabel, cn } from "@/lib/utils";
import FilePreviewModal from "./file-preview-modal";
import type { Connection, Bookmark } from "@/db/schema";

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: string;
}

interface OperationResult {
  type: "success" | "error";
  message: string;
}

export default function FileManager() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [currentPath, setCurrentPath] = useState("/");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showZipModal, setShowZipModal] = useState(false);
  const [showUnzipModal, setShowUnzipModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [operationResult, setOperationResult] = useState<OperationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dual pane state
  const [dualPane, setDualPane] = useState(false);
  const [rightPanePath, setRightPanePath] = useState("/");
  const [rightPaneFiles, setRightPaneFiles] = useState<FileItem[]>([]);
  const [rightPaneConnection, setRightPaneConnection] = useState<Connection | null>(null);
  const [activePane, setActivePane] = useState<"left" | "right">("left");

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/connections");
      const data = await res.json();
      setConnections(Array.isArray(data) ? data : []);
    } catch {
      // handle error
    }
  }, []);

  const fetchBookmarks = useCallback(async () => {
    try {
      const res = await fetch("/api/bookmarks");
      const data = await res.json();
      setBookmarks(Array.isArray(data) ? data : []);
    } catch {
      // handle error
    }
  }, []);

  const fetchFiles = useCallback(async (path: string = currentPath, connId?: string, showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const params = new URLSearchParams({
        path,
        ...(connId && { connectionId: connId }),
      });
      const res = await fetch(`/api/files?${params}`);
      const data = await res.json();
      return data.files || [];
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentPath]);

  const loadFiles = useCallback(async (showLoading = false) => {
    const leftFiles = await fetchFiles(currentPath, selectedConnection?.id, showLoading);
    setFiles(leftFiles);
    
    if (dualPane) {
      const rightFiles = await fetchFiles(rightPanePath, rightPaneConnection?.id, showLoading);
      setRightPaneFiles(rightFiles);
    }
  }, [fetchFiles, currentPath, selectedConnection, dualPane, rightPanePath, rightPaneConnection]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchConnections();
      fetchBookmarks();
    });
  }, [fetchConnections, fetchBookmarks]);

  useEffect(() => {
    queueMicrotask(() => {
      loadFiles(false);
    });
  }, [loadFiles]);

  // Add to recent files
  const addToRecent = async (file: FileItem) => {
    try {
      await fetch("/api/recent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId: selectedConnection?.id,
          path: file.path,
          name: file.name,
          isDirectory: file.isDirectory,
          size: file.size,
        }),
      });
    } catch {
      // ignore
    }
  };

  const navigateTo = (path: string, pane: "left" | "right" = "left") => {
    if (pane === "left") {
      setCurrentPath(path);
    } else {
      setRightPanePath(path);
    }
    setSelectedFiles(new Set());
  };

  const toggleSelection = (path: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedFiles(newSelected);
  };

  const selectAll = useCallback(() => {
    const currentFiles = activePane === "left" ? files : rightPaneFiles;
    if (selectedFiles.size === currentFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(currentFiles.map((f) => f.path)));
    }
  }, [activePane, files, rightPaneFiles, selectedFiles.size]);

  const getSelectedItems = (): FileItem[] => {
    const currentFiles = activePane === "left" ? files : rightPaneFiles;
    return currentFiles.filter((f) => selectedFiles.has(f.path));
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const pathParts = currentPath.split("/").filter(Boolean);

  const canUnzip = () => {
    const selected = getSelectedItems();
    if (selected.length !== 1) return false;
    const file = selected[0];
    return (
      !file.isDirectory &&
      [".zip", ".tar", ".tar.gz", ".tgz", ".rar", ".7z", ".gz"].some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      )
    );
  };

  const showResult = (type: "success" | "error", message: string) => {
    setOperationResult({ type, message });
    setTimeout(() => setOperationResult(null), 4000);
  };

  const handlePreview = (file: FileItem) => {
    setPreviewFile(file);
    setShowPreviewModal(true);
    addToRecent(file);
  };

  const handleUpload = async (uploadFiles: FileList | File[]) => {
    const formData = new FormData();
    for (const file of uploadFiles) {
      formData.append("files", file);
    }
    formData.append("path", currentPath);
    if (selectedConnection) {
      formData.append("connectionId", selectedConnection.id);
    }

    try {
      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        showResult("success", data.message);
        loadFiles();
      }
    } catch {
      showResult("error", "Upload failed");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const addBookmark = async () => {
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId: selectedConnection?.id,
          name: currentPath.split("/").pop() || "Root",
          path: currentPath,
        }),
      });
      fetchBookmarks();
      showResult("success", "Bookmark added");
    } catch {
      showResult("error", "Failed to add bookmark");
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key === "a" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        selectAll();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedFiles.size > 0) {
          setShowDeleteModal(true);
        }
      } else if (e.key === "F2") {
        if (selectedFiles.size === 1) {
          setShowRenameModal(true);
        }
      } else if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowNewFolderModal(true);
      } else if (e.key === "u" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        fileInputRef.current?.click();
      } else if (e.key === "Escape") {
        setSelectedFiles(new Set());
        setContextMenu(null);
      } else if (e.key === "d" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        setDualPane(!dualPane);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFiles, dualPane, selectAll]);

  // Close context menu on click outside
  useEffect(() => {
    if (contextMenu) {
      const handleClick = () => setContextMenu(null);
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [contextMenu]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">File Manager</h2>
          <p className="text-surface-500 text-sm mt-1">
            Browse, manage, and transfer files • <span className="kbd">⌘D</span> Dual Pane
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDualPane(!dualPane)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all",
              dualPane
                ? "bg-primary-500 text-white"
                : "bg-surface-100 text-surface-600 hover:bg-surface-200"
            )}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="18" rx="1" />
              <rect x="14" y="3" width="7" height="18" rx="1" />
            </svg>
            Dual Pane
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all"
          >
            <Upload size={16} />
            Upload
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />

      {/* Operation Result Toast */}
      {operationResult && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg animate-slide-down",
            operationResult.type === "success"
              ? "bg-success-500 text-white"
              : "bg-danger-500 text-white"
          )}
        >
          {operationResult.type === "success" ? <Check size={18} /> : <X size={18} />}
          <span className="font-medium">{operationResult.message}</span>
          <button onClick={() => setOperationResult(null)} className="ml-2 hover:bg-white/20 rounded p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 w-48 bg-white rounded-xl shadow-xl border border-surface-100 py-1 animate-fade-in"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              handlePreview(contextMenu.file);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50"
          >
            <Eye size={14} /> Preview
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50">
            <Download size={14} /> Download
          </button>
          <button
            onClick={() => {
              setSelectedFiles(new Set([contextMenu.file.path]));
              setShowRenameModal(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50"
          >
            <Edit3 size={14} /> Rename
          </button>
          <button
            onClick={() => {
              setSelectedFiles(new Set([contextMenu.file.path]));
              setShowCopyModal(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50"
          >
            <Copy size={14} /> Copy
          </button>
          <button
            onClick={() => {
              setSelectedFiles(new Set([contextMenu.file.path]));
              setShowMoveModal(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50"
          >
            <ArrowRight size={14} /> Move
          </button>
          <button
            onClick={() => {
              setSelectedFiles(new Set([contextMenu.file.path]));
              setShowShareModal(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>
          <hr className="my-1 border-surface-100" />
          <button
            onClick={() => {
              setSelectedFiles(new Set([contextMenu.file.path]));
              setShowZipModal(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50"
          >
            <Download size={14} /> Compress
          </button>
          <button
            onClick={() => {
              setSelectedFiles(new Set([contextMenu.file.path]));
              setShowDeleteModal(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-500 hover:bg-danger-50"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      <div className={cn("grid gap-4", dualPane ? "grid-cols-1 lg:grid-cols-5" : "grid-cols-1 lg:grid-cols-4")}>
        {/* Connection Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden sticky top-4">
            <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
              <h3 className="font-semibold text-surface-800 text-sm">Connections</h3>
            </div>
            <div className="p-2 max-h-[250px] overflow-y-auto">
              {/* Local */}
              <button
                onClick={() => {
                  if (activePane === "left") {
                    setSelectedConnection(null);
                    setCurrentPath("/");
                  } else {
                    setRightPaneConnection(null);
                    setRightPanePath("/");
                  }
                  setSelectedFiles(new Set());
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all",
                  !selectedConnection && activePane === "left"
                    ? "bg-primary-50 text-primary-700"
                    : "hover:bg-surface-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  !selectedConnection ? "bg-primary-100" : "bg-surface-100"
                )}>
                  <FolderOpen size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Local Files</p>
                </div>
              </button>

              {connections.map((conn) => {
                const connIcon = getConnectionTypeIcon(conn.type);
                const isSelected = selectedConnection?.id === conn.id;
                return (
                  <button
                    key={conn.id}
                    onClick={() => {
                      if (activePane === "left") {
                        setSelectedConnection(conn);
                        setCurrentPath("/");
                      } else {
                        setRightPaneConnection(conn);
                        setRightPanePath("/");
                      }
                      setSelectedFiles(new Set());
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all",
                      isSelected ? "bg-primary-50 text-primary-700" : "hover:bg-surface-50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-primary-100" : "bg-surface-100"
                    )}>
                      {React.createElement(connIcon, { size: 16 })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conn.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bookmarks */}
            <div className="px-4 py-2 border-t border-surface-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-surface-500 uppercase">Bookmarks</h4>
                <button
                  onClick={addBookmark}
                  className="p-1 hover:bg-surface-100 rounded text-surface-400 hover:text-surface-600"
                  title="Add current folder"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-1 max-h-[120px] overflow-y-auto">
                {bookmarks.length === 0 ? (
                  <p className="text-xs text-surface-400 py-2">No bookmarks yet</p>
                ) : (
                  bookmarks.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => navigateTo(b.path, activePane)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-surface-600 hover:bg-surface-50 text-left"
                    >
                      <Star size={12} className="text-warning-500" />
                      <span className="truncate">{b.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main File Browser */}
        <div className={cn(dualPane ? "lg:col-span-2" : "lg:col-span-3")}>
          <FilePane
            files={filteredFiles}
            path={currentPath}
            pathParts={pathParts}
            connection={selectedConnection}
            loading={loading}
            selectedFiles={selectedFiles}
            search={search}
            viewMode={viewMode}
            isDragging={isDragging}
            isActive={activePane === "left"}
            onNavigate={(p) => navigateTo(p, "left")}
            onToggleSelection={toggleSelection}
            onSelectAll={selectAll}
            onSearch={setSearch}
            onViewModeChange={setViewMode}
            onRefresh={() => loadFiles(true)}
            onContextMenu={handleContextMenu}
            onPreview={handlePreview}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onActivate={() => setActivePane("left")}
            onZip={() => setShowZipModal(true)}
            onUnzip={() => setShowUnzipModal(true)}
            onDelete={() => setShowDeleteModal(true)}
            onRename={() => setShowRenameModal(true)}
            onNewFolder={() => setShowNewFolderModal(true)}
            onMove={() => setShowMoveModal(true)}
            onCopy={() => setShowCopyModal(true)}
            onShare={() => setShowShareModal(true)}
            canUnzip={canUnzip()}
          />
        </div>

        {/* Right Pane (Dual Pane Mode) */}
        {dualPane && (
          <div className="lg:col-span-2">
            <FilePane
              files={rightPaneFiles}
              path={rightPanePath}
              pathParts={rightPanePath.split("/").filter(Boolean)}
              connection={rightPaneConnection}
              loading={loading}
              selectedFiles={selectedFiles}
              search=""
              viewMode={viewMode}
              isDragging={false}
              isActive={activePane === "right"}
              onNavigate={(p) => navigateTo(p, "right")}
              onToggleSelection={toggleSelection}
              onSelectAll={selectAll}
              onSearch={() => {}}
              onViewModeChange={setViewMode}
              onRefresh={() => loadFiles(true)}
              onContextMenu={handleContextMenu}
              onPreview={handlePreview}
              onDragEnter={() => {}}
              onDragLeave={() => {}}
              onDrop={handleDrop}
              onActivate={() => setActivePane("right")}
              onZip={() => setShowZipModal(true)}
              onUnzip={() => setShowUnzipModal(true)}
              onDelete={() => setShowDeleteModal(true)}
              onRename={() => setShowRenameModal(true)}
              onNewFolder={() => setShowNewFolderModal(true)}
              onMove={() => setShowMoveModal(true)}
              onCopy={() => setShowCopyModal(true)}
              onShare={() => setShowShareModal(true)}
              canUnzip={canUnzip()}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showZipModal && (
        <ZipModal
          selectedItems={getSelectedItems()}
          connectionId={selectedConnection?.id}
          currentPath={currentPath}
          onClose={() => setShowZipModal(false)}
          onSuccess={(msg) => {
            showResult("success", msg);
            setShowZipModal(false);
            setSelectedFiles(new Set());
            loadFiles(true);
          }}
        />
      )}

      {showUnzipModal && (
        <UnzipModal
          archiveFile={getSelectedItems()[0]}
          connectionId={selectedConnection?.id}
          currentPath={currentPath}
          onClose={() => setShowUnzipModal(false)}
          onSuccess={(msg) => {
            showResult("success", msg);
            setShowUnzipModal(false);
            setSelectedFiles(new Set());
            loadFiles(true);
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          selectedItems={getSelectedItems()}
          connectionId={selectedConnection?.id}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={(msg) => {
            showResult("success", msg);
            setShowDeleteModal(false);
            setSelectedFiles(new Set());
            loadFiles(true);
          }}
        />
      )}

      {showRenameModal && (
        <RenameModal
          file={getSelectedItems()[0]}
          connectionId={selectedConnection?.id}
          onClose={() => setShowRenameModal(false)}
          onSuccess={(msg) => {
            showResult("success", msg);
            setShowRenameModal(false);
            setSelectedFiles(new Set());
            loadFiles(true);
          }}
        />
      )}

      {showNewFolderModal && (
        <NewFolderModal
          currentPath={currentPath}
          connectionId={selectedConnection?.id}
          onClose={() => setShowNewFolderModal(false)}
          onSuccess={(msg) => {
            showResult("success", msg);
            setShowNewFolderModal(false);
            loadFiles(true);
          }}
        />
      )}

      {showMoveModal && (
        <MoveModal
          selectedItems={getSelectedItems()}
          connectionId={selectedConnection?.id}
          onClose={() => setShowMoveModal(false)}
          onSuccess={(msg) => {
            showResult("success", msg);
            setShowMoveModal(false);
            setSelectedFiles(new Set());
            loadFiles(true);
          }}
        />
      )}

      {showCopyModal && (
        <CopyModal
          selectedItems={getSelectedItems()}
          connectionId={selectedConnection?.id}
          onClose={() => setShowCopyModal(false)}
          onSuccess={(msg) => {
            showResult("success", msg);
            setShowCopyModal(false);
            setSelectedFiles(new Set());
            loadFiles(true);
          }}
        />
      )}

      {showShareModal && (
        <ShareModal
          file={getSelectedItems()[0]}
          connectionId={selectedConnection?.id}
          onClose={() => setShowShareModal(false)}
          onSuccess={(msg) => {
            showResult("success", msg);
            setShowShareModal(false);
          }}
        />
      )}

      {showPreviewModal && previewFile && (
        <FilePreviewModal
          file={previewFile}
          connectionId={selectedConnection?.id}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewFile(null);
          }}
        />
      )}
    </div>
  );
}

// File Pane Component
function FilePane({
  files,
  path,
  pathParts,
  connection,
  loading,
  selectedFiles,
  search,
  viewMode,
  isDragging,
  isActive,
  onNavigate,
  onToggleSelection,
  onSelectAll,
  onSearch,
  onViewModeChange,
  onRefresh,
  onContextMenu,
  onPreview,
  onDragEnter,
  onDragLeave,
  onDrop,
  onActivate,
  onZip,
  onUnzip,
  onDelete,
  onRename,
  onNewFolder,
  onMove,
  onCopy,
  onShare,
  canUnzip,
}: {
  files: FileItem[];
  path: string;
  pathParts: string[];
  connection: Connection | null;
  loading: boolean;
  selectedFiles: Set<string>;
  search: string;
  viewMode: "grid" | "list";
  isDragging: boolean;
  isActive: boolean;
  onNavigate: (path: string) => void;
  onToggleSelection: (path: string) => void;
  onSelectAll: () => void;
  onSearch: (search: string) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onRefresh: () => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem) => void;
  onPreview: (file: FileItem) => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onActivate: () => void;
  onZip: () => void;
  onUnzip: () => void;
  onDelete: () => void;
  onRename: () => void;
  onNewFolder: () => void;
  onMove: () => void;
  onCopy: () => void;
  onShare: () => void;
  canUnzip: boolean;
}) {
  const hasSelection = selectedFiles.size > 0;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border overflow-hidden transition-all",
        isActive ? "border-primary-300 ring-2 ring-primary-100" : "border-surface-100",
        isDragging && "border-primary-500 bg-primary-50/50"
      )}
      onClick={onActivate}
      onDragEnter={(e) => { e.preventDefault(); onDragEnter(); }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Toolbar */}
      <div className="px-3 py-2 border-b border-surface-100 space-y-2">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm overflow-x-auto">
          <button
            onClick={() => onNavigate("/")}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-surface-100 text-surface-600 flex-shrink-0"
          >
            <Home size={14} />
            <span className="font-medium text-xs">{connection?.name || "Local"}</span>
          </button>
          {pathParts.map((part, i) => (
            <div key={i} className="flex items-center gap-1 flex-shrink-0">
              <ChevronRight size={14} className="text-surface-300" />
              <button
                onClick={() => onNavigate("/" + pathParts.slice(0, i + 1).join("/"))}
                className="px-2 py-1 rounded-lg hover:bg-surface-100 text-surface-600 font-medium text-xs"
              >
                {part}
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          {path !== "/" && (
            <button
              onClick={() => onNavigate("/" + pathParts.slice(0, -1).join("/") || "/")}
              className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500"
              title="Back"
            >
              <ArrowLeft size={14} />
            </button>
          )}
          <button onClick={onRefresh} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500" title="Refresh">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={onNewFolder} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500" title="New Folder">
            <Plus size={14} />
          </button>

          <div className="flex-1" />

          {hasSelection && (
            <>
              <span className="text-[10px] text-surface-400 px-1">{selectedFiles.size} selected</span>
              <button onClick={onZip} className="px-2 py-1 text-[10px] font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600">
                Zip
              </button>
              {canUnzip && (
                <button onClick={onUnzip} className="px-2 py-1 text-[10px] font-semibold text-white bg-accent-500 rounded-lg hover:bg-accent-600">
                  Unzip
                </button>
              )}
              <button onClick={onMove} className="px-2 py-1 text-[10px] font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200">
                Move
              </button>
              <button onClick={onCopy} className="px-2 py-1 text-[10px] font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200">
                Copy
              </button>
              <button onClick={onDelete} className="px-2 py-1 text-[10px] font-semibold text-white bg-danger-500 rounded-lg hover:bg-danger-600">
                Delete
              </button>
            </>
          )}

          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Filter..."
              className="w-24 pl-6 pr-2 py-1 bg-surface-50 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-primary-200"
            />
          </div>

          {/* View toggle */}
          <div className="flex bg-surface-100 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange("list")}
              className={cn("p-1 rounded", viewMode === "list" ? "bg-white shadow-sm" : "")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn("p-1 rounded", viewMode === "grid" ? "bg-white shadow-sm" : "")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Drop zone overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary-500/10 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <Upload size={32} className="text-primary-500 mx-auto mb-2" />
            <p className="font-semibold text-surface-800">Drop files to upload</p>
          </div>
        </div>
      )}

      {/* File List */}
      <div className="min-h-[300px] max-h-[500px] overflow-y-auto relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={20} className="animate-spin text-surface-300" />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Folder size={40} className="text-surface-200 mb-2" />
            <p className="text-surface-400 text-sm">Empty folder</p>
          </div>
        ) : viewMode === "list" ? (
          <table className="w-full text-xs">
            <thead className="bg-surface-50 sticky top-0">
              <tr>
                <th className="px-3 py-1.5 text-left w-6">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === files.length && files.length > 0}
                    onChange={onSelectAll}
                    className="rounded text-primary-500 w-3 h-3"
                  />
                </th>
                <th className="px-3 py-1.5 text-left font-medium text-surface-500">Name</th>
                <th className="px-3 py-1.5 text-left font-medium text-surface-500 hidden sm:table-cell">Size</th>
                <th className="px-3 py-1.5 text-left font-medium text-surface-500 hidden md:table-cell">Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {files.map((file) => (
                <tr
                  key={file.path}
                  className={cn(
                    "hover:bg-surface-50 transition-colors cursor-pointer",
                    selectedFiles.has(file.path) && "bg-primary-50"
                  )}
                  onClick={() => onToggleSelection(file.path)}
                  onDoubleClick={() => file.isDirectory ? onNavigate(file.path) : onPreview(file)}
                  onContextMenu={(e) => onContextMenu(e, file)}
                >
                  <td className="px-3 py-1.5">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.path)}
                      onChange={() => onToggleSelection(file.path)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded text-primary-500 w-3 h-3"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      {file.isDirectory ? (
                        <Folder size={14} className="text-warning-500 flex-shrink-0" />
                      ) : (
                        <File size={14} className="text-surface-400 flex-shrink-0" />
                      )}
                      <span className={cn("truncate max-w-[150px]", file.isDirectory && "font-medium")}>
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-surface-400 hidden sm:table-cell">
                    {file.isDirectory ? "—" : formatBytes(file.size)}
                  </td>
                  <td className="px-3 py-1.5 text-surface-400 hidden md:table-cell">
                    {formatDate(file.modified)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
            {files.map((file) => (
              <div
                key={file.path}
                onClick={() => onToggleSelection(file.path)}
                onDoubleClick={() => file.isDirectory ? onNavigate(file.path) : onPreview(file)}
                onContextMenu={(e) => onContextMenu(e, file)}
                className={cn(
                  "p-2 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm",
                  selectedFiles.has(file.path)
                    ? "border-primary-400 bg-primary-50"
                    : "border-transparent bg-surface-50 hover:border-surface-200"
                )}
              >
                <div className="flex flex-col items-center text-center">
                  {file.isDirectory ? (
                    <Folder size={28} className="text-warning-500 mb-1" />
                  ) : (
                    <File size={28} className="text-surface-400 mb-1" />
                  )}
                  <p className="text-[10px] font-medium text-surface-700 truncate w-full">{file.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-surface-100 bg-surface-50 text-[10px] text-surface-400">
        {files.length} items {selectedFiles.size > 0 && `• ${selectedFiles.size} selected`}
      </div>
    </div>
  );
}

// Modal Components
function ZipModal({ selectedItems, connectionId, currentPath, onClose, onSuccess }: {
  selectedItems: FileItem[];
  connectionId?: string;
  currentPath: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [archiveName, setArchiveName] = useState("archive");
  const [outputPath, setOutputPath] = useState(currentPath);
  const [loading, setLoading] = useState(false);

  const handleZip = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files/zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, paths: selectedItems.map((f) => f.path), outputPath, archiveName }),
      });
      const data = await res.json();
      if (data.success) onSuccess(data.message);
    } catch { /* error */ }
    setLoading(false);
  };

  return (
    <Modal title="Create ZIP Archive" icon={<Download size={20} className="text-primary-500" />} onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-surface-50 rounded-xl p-3 max-h-32 overflow-y-auto">
          {selectedItems.map((item) => (
            <div key={item.path} className="flex items-center gap-2 py-1 text-xs">
              {item.isDirectory ? <Folder size={14} className="text-warning-500" /> : <File size={14} className="text-surface-400" />}
              <span className="text-surface-600 truncate">{item.name}</span>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">Archive Name</label>
          <div className="flex">
            <input type="text" value={archiveName} onChange={(e) => setArchiveName(e.target.value)} className="flex-1 px-4 py-2.5 rounded-l-xl border border-r-0 border-surface-200 focus:border-primary-400 outline-none text-sm" />
            <div className="px-4 py-2.5 bg-surface-100 rounded-r-xl border border-surface-200 text-sm text-surface-500">.zip</div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">Save To</label>
          <input type="text" value={outputPath} onChange={(e) => setOutputPath(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 outline-none text-sm" />
        </div>
        <ModalActions onClose={onClose} onSubmit={handleZip} loading={loading} submitLabel="Create ZIP" />
      </div>
    </Modal>
  );
}

function UnzipModal({ archiveFile, connectionId, currentPath, onClose, onSuccess }: {
  archiveFile: FileItem;
  connectionId?: string;
  currentPath: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [extractTo, setExtractTo] = useState(currentPath);
  const [loading, setLoading] = useState(false);

  const handleUnzip = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files/unzip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, archivePath: archiveFile.path, extractTo }),
      });
      const data = await res.json();
      if (data.success) onSuccess(data.message);
    } catch { /* error */ }
    setLoading(false);
  };

  return (
    <Modal title="Extract Archive" icon={<Upload size={20} className="text-accent-500" />} onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-surface-50 rounded-xl p-4 flex items-center gap-3">
          <File size={24} className="text-surface-400" />
          <div>
            <p className="text-sm font-medium text-surface-800">{archiveFile.name}</p>
            <p className="text-xs text-surface-400">{formatBytes(archiveFile.size)}</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">Extract To</label>
          <input type="text" value={extractTo} onChange={(e) => setExtractTo(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 outline-none text-sm" />
        </div>
        <ModalActions onClose={onClose} onSubmit={handleUnzip} loading={loading} submitLabel="Extract" variant="accent" />
      </div>
    </Modal>
  );
}

function DeleteModal({ selectedItems, connectionId, onClose, onSuccess }: {
  selectedItems: FileItem[];
  connectionId?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, paths: selectedItems.map((f) => f.path) }),
      });
      const data = await res.json();
      if (data.success) onSuccess(data.message);
    } catch { /* error */ }
    setLoading(false);
  };

  return (
    <Modal title="Delete Files" icon={<Trash2 size={20} className="text-danger-500" />} onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-danger-50 rounded-xl p-4 text-center">
          <p className="text-danger-700 font-medium">Delete {selectedItems.length} item(s)? This cannot be undone.</p>
        </div>
        <div className="bg-surface-50 rounded-xl p-3 max-h-40 overflow-y-auto">
          {selectedItems.map((item) => (
            <div key={item.path} className="flex items-center gap-2 py-1 text-xs">
              {item.isDirectory ? <Folder size={14} className="text-warning-500" /> : <File size={14} className="text-surface-400" />}
              <span className="text-surface-600 truncate">{item.path}</span>
            </div>
          ))}
        </div>
        <ModalActions onClose={onClose} onSubmit={handleDelete} loading={loading} submitLabel="Delete" variant="danger" />
      </div>
    </Modal>
  );
}

function RenameModal({ file, connectionId, onClose, onSuccess }: {
  file: FileItem;
  connectionId?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [newName, setNewName] = useState(file.name);
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "rename", connectionId, path: file.path, newName }),
      });
      const data = await res.json();
      if (data.success) onSuccess(data.message);
    } catch { /* error */ }
    setLoading(false);
  };

  return (
    <Modal title="Rename" icon={<Edit3 size={20} className="text-primary-500" />} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">New Name</label>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 outline-none text-sm" autoFocus />
        </div>
        <ModalActions onClose={onClose} onSubmit={handleRename} loading={loading} disabled={!newName || newName === file.name} submitLabel="Rename" />
      </div>
    </Modal>
  );
}

function NewFolderModal({ currentPath, connectionId, onClose, onSuccess }: {
  currentPath: string;
  connectionId?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "createFolder", connectionId, path: currentPath, newName: folderName }),
      });
      const data = await res.json();
      if (data.success) onSuccess(data.message);
    } catch { /* error */ }
    setLoading(false);
  };

  return (
    <Modal title="New Folder" icon={<Plus size={20} className="text-primary-500" />} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">Folder Name</label>
          <input type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="New Folder" className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 outline-none text-sm" autoFocus />
        </div>
        <ModalActions onClose={onClose} onSubmit={handleCreate} loading={loading} disabled={!folderName} submitLabel="Create" />
      </div>
    </Modal>
  );
}

function MoveModal({ selectedItems, connectionId, onClose, onSuccess }: {
  selectedItems: FileItem[];
  connectionId?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [destination, setDestination] = useState("/");
  const [loading, setLoading] = useState(false);

  const handleMove = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "move", connectionId, paths: selectedItems.map((f) => f.path), destination }),
      });
      const data = await res.json();
      if (data.success) onSuccess(data.message);
    } catch { /* error */ }
    setLoading(false);
  };

  return (
    <Modal title="Move Files" icon={<ArrowRight size={20} className="text-primary-500" />} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-surface-600">Moving {selectedItems.length} item(s)</p>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">Destination Path</label>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 outline-none text-sm" />
        </div>
        <ModalActions onClose={onClose} onSubmit={handleMove} loading={loading} submitLabel="Move" />
      </div>
    </Modal>
  );
}

function CopyModal({ selectedItems, connectionId, onClose, onSuccess }: {
  selectedItems: FileItem[];
  connectionId?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [destination, setDestination] = useState("/");
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "copy", connectionId, paths: selectedItems.map((f) => f.path), destination }),
      });
      const data = await res.json();
      if (data.success) onSuccess(data.message);
    } catch { /* error */ }
    setLoading(false);
  };

  return (
    <Modal title="Copy Files" icon={<Copy size={20} className="text-primary-500" />} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-surface-600">Copying {selectedItems.length} item(s)</p>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">Destination Path</label>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 outline-none text-sm" />
        </div>
        <ModalActions onClose={onClose} onSubmit={handleCopy} loading={loading} submitLabel="Copy" />
      </div>
    </Modal>
  );
}

function ShareModal({ file, connectionId, onClose, onSuccess }: {
  file: FileItem;
  connectionId?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [expiresIn, setExpiresIn] = useState(24);
  const [password, setPassword] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, path: file.path, name: file.name, expiresIn, password: password || null }),
      });
      const data = await res.json();
      if (data.shareUrl) {
        setShareUrl(data.shareUrl);
        onSuccess("Share link created!");
      }
    } catch { /* error */ }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <Modal title="Share File" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-500"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>} onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-surface-50 rounded-xl p-4 flex items-center gap-3">
          <File size={24} className="text-surface-400" />
          <div>
            <p className="text-sm font-medium text-surface-800">{file.name}</p>
            <p className="text-xs text-surface-400">{formatBytes(file.size)}</p>
          </div>
        </div>

        {shareUrl ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Share Link</label>
              <div className="flex gap-2">
                <input type="text" value={shareUrl} readOnly className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-sm" />
                <button onClick={copyToClipboard} className="px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600">
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <button onClick={onClose} className="w-full py-2.5 bg-surface-100 text-surface-700 font-medium rounded-xl hover:bg-surface-200">Done</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Expires In</label>
                <select value={expiresIn} onChange={(e) => setExpiresIn(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white">
                  <option value={1}>1 hour</option>
                  <option value={24}>24 hours</option>
                  <option value={168}>7 days</option>
                  <option value={720}>30 days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Password (optional)</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="None" className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm" />
              </div>
            </div>
            <ModalActions onClose={onClose} onSubmit={handleShare} loading={loading} submitLabel="Create Link" />
          </>
        )}
      </div>
    </Modal>
  );
}

// Shared Modal Components
function Modal({ title, icon, children, onClose }: { title: string; icon: React.ReactNode; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center">{icon}</div>
            <h3 className="font-bold text-surface-900">{title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onClose, onSubmit, loading, disabled, submitLabel, variant = "primary" }: {
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  disabled?: boolean;
  submitLabel: string;
  variant?: "primary" | "danger" | "accent";
}) {
  const colors = {
    primary: "bg-primary-500 hover:bg-primary-600 shadow-primary-500/25",
    danger: "bg-danger-500 hover:bg-danger-600 shadow-danger-500/25",
    accent: "bg-accent-500 hover:bg-accent-600 shadow-accent-500/25",
  };

  return (
    <div className="flex items-center gap-3 pt-2">
      <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl transition-colors">Cancel</button>
      <button onClick={onSubmit} disabled={loading || disabled} className={cn("ml-auto flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg transition-all disabled:opacity-50", colors[variant])}>
        {loading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
        {loading ? "Processing..." : submitLabel}
      </button>
    </div>
  );
}
