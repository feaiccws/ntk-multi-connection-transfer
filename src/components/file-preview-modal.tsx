"use client";

import { useEffect, useState } from "react";
import { X, Download, RefreshCw, Edit3, Check, Copy } from "./icons";
import { formatBytes, cn } from "@/lib/utils";

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: string;
}

interface PreviewData {
  fileType: string;
  content: string | null;
  previewUrl: string | null;
  extension: string;
}

interface FilePreviewModalProps {
  file: FileItem;
  connectionId?: string;
  onClose: () => void;
}

export default function FilePreviewModal({
  file,
  connectionId,
  onClose,
}: FilePreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          path: file.path,
          ...(connectionId && { connectionId }),
        });
        const res = await fetch(`/api/files/preview?${params}`);
        const data = await res.json();
        setPreview(data);
        if (data.content) {
          setEditContent(data.content);
        }
      } catch {
        // handle error
      }
      setLoading(false);
    };
    fetchPreview();
  }, [file, connectionId]);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 1000));
    setIsEditing(false);
    setSaving(false);
  };

  const handleCopy = () => {
    if (preview?.content) {
      navigator.clipboard.writeText(preview.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLanguage = (ext: string): string => {
    const langMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      rb: "ruby",
      go: "go",
      rs: "rust",
      java: "java",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      php: "php",
      swift: "swift",
      kt: "kotlin",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      xml: "xml",
      yaml: "yaml",
      yml: "yaml",
      md: "markdown",
      sql: "sql",
      sh: "bash",
      bash: "bash",
    };
    return langMap[ext] || "plaintext";
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
              <FileIcon ext={preview?.extension || ""} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-surface-900 truncate">{file.name}</h3>
              <p className="text-xs text-surface-400">
                {formatBytes(file.size)} • {preview?.fileType || "Loading..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {preview?.fileType === "text" && !isEditing && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
              </>
            )}
            {isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Save
                </button>
              </>
            )}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200"
            >
              <Download size={14} />
              Download
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-surface-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw size={32} className="animate-spin text-surface-300" />
            </div>
          ) : preview?.fileType === "image" ? (
            <div className="flex items-center justify-center h-full p-8">
              <img
                src={preview.previewUrl || ""}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : preview?.fileType === "video" ? (
            <div className="flex items-center justify-center h-full p-8">
              <video
                src={preview.previewUrl || ""}
                controls
                className="max-w-full max-h-full rounded-lg shadow-lg"
              >
                Your browser does not support video playback.
              </video>
            </div>
          ) : preview?.fileType === "audio" ? (
            <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-lg">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-surface-800">{file.name}</p>
              <audio
                src={preview.previewUrl || ""}
                controls
                className="w-full max-w-md"
              >
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : preview?.fileType === "pdf" ? (
            <iframe
              src={preview.previewUrl || ""}
              className="w-full h-full min-h-[500px]"
              title={file.name}
            />
          ) : preview?.fileType === "text" ? (
            <div className="h-full flex flex-col">
              {/* Code header */}
              <div className="flex items-center justify-between px-4 py-2 bg-surface-800 text-surface-300 text-xs">
                <span>{getLanguage(preview.extension || "")}</span>
                <span>{preview.content?.split("\n").length || 0} lines</span>
              </div>
              {/* Code content */}
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 w-full p-4 bg-surface-900 text-surface-100 font-mono text-sm resize-none outline-none code-preview"
                  spellCheck={false}
                />
              ) : (
                <pre className="flex-1 p-4 bg-surface-900 text-surface-100 overflow-auto code-preview">
                  <code>{preview.content}</code>
                </pre>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
              <div className="w-24 h-24 rounded-2xl bg-surface-200 flex items-center justify-center">
                <FileIcon ext={preview?.extension || ""} size={48} />
              </div>
              <p className="text-lg font-semibold text-surface-800">
                {file.name}
              </p>
              <p className="text-sm text-surface-500">
                Preview not available for this file type
              </p>
              <button className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-semibold text-sm rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/25">
                <Download size={16} />
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FileIcon({ ext, size = 24 }: { ext: string; size?: number }) {
  const getColor = () => {
    const colors: Record<string, string> = {
      // Code
      js: "text-yellow-500",
      ts: "text-blue-500",
      jsx: "text-cyan-500",
      tsx: "text-cyan-600",
      py: "text-green-500",
      rb: "text-red-500",
      go: "text-cyan-400",
      rs: "text-orange-500",
      java: "text-red-600",
      // Data
      json: "text-yellow-600",
      xml: "text-orange-400",
      yaml: "text-pink-500",
      csv: "text-green-600",
      // Web
      html: "text-orange-500",
      css: "text-blue-400",
      scss: "text-pink-400",
      // Images
      jpg: "text-green-500",
      jpeg: "text-green-500",
      png: "text-blue-500",
      gif: "text-purple-500",
      svg: "text-orange-500",
      // Documents
      pdf: "text-red-500",
      doc: "text-blue-600",
      docx: "text-blue-600",
      xls: "text-green-600",
      xlsx: "text-green-600",
      ppt: "text-orange-500",
      pptx: "text-orange-500",
      // Archives
      zip: "text-yellow-600",
      rar: "text-purple-500",
      tar: "text-amber-600",
      gz: "text-amber-500",
      // Media
      mp4: "text-purple-500",
      mp3: "text-pink-500",
      wav: "text-blue-500",
    };
    return colors[ext] || "text-surface-400";
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={getColor()}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      {ext && (
        <text
          x="12"
          y="17"
          fontSize="6"
          fill="currentColor"
          textAnchor="middle"
          fontWeight="bold"
          stroke="none"
        >
          {ext.toUpperCase().slice(0, 4)}
        </text>
      )}
    </svg>
  );
}
