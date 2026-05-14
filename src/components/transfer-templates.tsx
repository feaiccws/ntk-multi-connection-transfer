"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  Play,
  Trash2,
  Edit3,
  Copy,
  Check,
  X,
  Star,
  Clock,
  ArrowRight,
} from "./icons";
import { getConnectionTypeIcon } from "./icons";
import { formatRelativeTime, cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  transferType: string;
  sourceType: string;
  destType: string;
  sourcePath: string;
  destPath: string;
  options: {
    overwrite: boolean;
    preserveTimestamps: boolean;
    verifyChecksum: boolean;
    compress: boolean;
  };
  usageCount: number;
  lastUsed: string | null;
  isFavorite: boolean;
}

const defaultTemplates: Template[] = [
  {
    id: "1",
    name: "Daily Website Backup",
    description: "Backup website files to cloud storage daily",
    icon: "🌐",
    color: "from-blue-500 to-indigo-500",
    transferType: "remote_to_cloud",
    sourceType: "sftp",
    destType: "s3",
    sourcePath: "/var/www/html",
    destPath: "/backups/website/{date}",
    options: { overwrite: true, preserveTimestamps: true, verifyChecksum: true, compress: true },
    usageCount: 145,
    lastUsed: new Date(Date.now() - 86400000).toISOString(),
    isFavorite: true,
  },
  {
    id: "2",
    name: "Database Dump Export",
    description: "Export database dumps to secure storage",
    icon: "🗄️",
    color: "from-emerald-500 to-teal-500",
    transferType: "local_to_cloud",
    sourceType: "local",
    destType: "azure_blob",
    sourcePath: "/backups/db",
    destPath: "/database-backups",
    options: { overwrite: false, preserveTimestamps: true, verifyChecksum: true, compress: true },
    usageCount: 89,
    lastUsed: new Date(Date.now() - 3600000).toISOString(),
    isFavorite: true,
  },
  {
    id: "3",
    name: "Media Sync",
    description: "Sync media files between cloud providers",
    icon: "🎬",
    color: "from-purple-500 to-pink-500",
    transferType: "cloud_to_cloud",
    sourceType: "google_drive",
    destType: "dropbox",
    sourcePath: "/Media",
    destPath: "/Shared Media",
    options: { overwrite: true, preserveTimestamps: true, verifyChecksum: false, compress: false },
    usageCount: 34,
    lastUsed: new Date(Date.now() - 172800000).toISOString(),
    isFavorite: false,
  },
  {
    id: "4",
    name: "Log Rotation Archive",
    description: "Archive old logs to cold storage",
    icon: "📋",
    color: "from-amber-500 to-orange-500",
    transferType: "remote_to_cloud",
    sourceType: "ftp",
    destType: "s3",
    sourcePath: "/var/log/archive",
    destPath: "/logs/{year}/{month}",
    options: { overwrite: false, preserveTimestamps: true, verifyChecksum: true, compress: true },
    usageCount: 267,
    lastUsed: new Date(Date.now() - 7200000).toISOString(),
    isFavorite: false,
  },
  {
    id: "5",
    name: "Development Deploy",
    description: "Deploy code to development server",
    icon: "🚀",
    color: "from-cyan-500 to-blue-500",
    transferType: "local_to_remote",
    sourceType: "local",
    destType: "sftp",
    sourcePath: "./dist",
    destPath: "/var/www/dev",
    options: { overwrite: true, preserveTimestamps: false, verifyChecksum: true, compress: false },
    usageCount: 512,
    lastUsed: new Date(Date.now() - 1800000).toISOString(),
    isFavorite: true,
  },
];

export default function TransferTemplates() {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || t.isFavorite;
    return matchesSearch && matchesFilter;
  });

  const toggleFavorite = (id: string) => {
    setTemplates((ts) =>
      ts.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  const deleteTemplate = (id: string) => {
    setTemplates((ts) => ts.filter((t) => t.id !== id));
  };

  const duplicateTemplate = (template: Template) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      usageCount: 0,
      lastUsed: null,
    };
    setTemplates([newTemplate, ...templates]);
  };

  const runTemplate = (template: Template) => {
    // Simulate running the template
    setTemplates((ts) =>
      ts.map((t) =>
        t.id === template.id
          ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date().toISOString() }
          : t
      )
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Transfer Templates</h2>
          <p className="text-surface-500 text-sm mt-1">
            Save and reuse your transfer configurations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all"
        >
          <Plus size={16} />
          Create Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-surface-200 focus:border-primary-400 outline-none text-sm"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex bg-white rounded-xl border border-surface-200 p-1">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all",
              filter === "all" ? "bg-primary-500 text-white" : "text-surface-600 hover:bg-surface-50"
            )}
          >
            All Templates
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5",
              filter === "favorites" ? "bg-primary-500 text-white" : "text-surface-600 hover:bg-surface-50"
            )}
          >
            <Star size={14} />
            Favorites
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onRun={() => runTemplate(template)}
            onEdit={() => setEditingTemplate(template)}
            onDuplicate={() => duplicateTemplate(template)}
            onDelete={() => deleteTemplate(template.id)}
            onToggleFavorite={() => toggleFavorite(template.id)}
          />
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-surface-100">
            <Layers size={48} className="text-surface-300 mx-auto mb-4" />
            <p className="text-surface-600 font-medium">No templates found</p>
            <p className="text-surface-400 text-sm mt-1">
              {searchQuery ? "Try a different search" : "Create your first template to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-br from-surface-800 to-surface-900 rounded-2xl p-6 text-white">
        <h3 className="font-semibold mb-4">📊 Template Usage Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-2xl font-bold">{templates.length}</p>
            <p className="text-sm text-surface-300">Total Templates</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-2xl font-bold">{templates.filter((t) => t.isFavorite).length}</p>
            <p className="text-sm text-surface-300">Favorites</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-2xl font-bold">{templates.reduce((a, t) => a + t.usageCount, 0)}</p>
            <p className="text-sm text-surface-300">Total Runs</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-2xl font-bold">
              {Math.round(templates.reduce((a, t) => a + t.usageCount, 0) / templates.length)}
            </p>
            <p className="text-sm text-surface-300">Avg. Uses/Template</p>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTemplate) && (
        <TemplateModal
          template={editingTemplate}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTemplate(null);
          }}
          onSave={(template) => {
            if (editingTemplate) {
              setTemplates((ts) => ts.map((t) => (t.id === template.id ? template : t)));
            } else {
              setTemplates([template, ...templates]);
            }
            setShowCreateModal(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
}

function TemplateCard({
  template,
  onRun,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}: {
  template: Template;
  onRun: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-lg transition-all group">
      {/* Header */}
      <div className={cn("h-2 bg-gradient-to-r", template.color)} />
      
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl", template.color)}>
              {template.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-surface-900">{template.name}</h3>
                {template.isFavorite && (
                  <Star size={14} className="text-warning-500 fill-warning-500" />
                )}
              </div>
              <p className="text-xs text-surface-500 mt-0.5">{template.description}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4 text-surface-400" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-9 w-40 bg-white rounded-xl shadow-lg border border-surface-100 py-1 z-20">
                  <button onClick={() => { onToggleFavorite(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50">
                    <Star size={14} className={template.isFavorite ? "text-warning-500 fill-warning-500" : ""} />
                    {template.isFavorite ? "Unfavorite" : "Favorite"}
                  </button>
                  <button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50">
                    <Edit3 size={14} /> Edit
                  </button>
                  <button onClick={() => { onDuplicate(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50">
                    <Copy size={14} /> Duplicate
                  </button>
                  <hr className="my-1 border-surface-100" />
                  <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-500 hover:bg-danger-50">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Transfer Flow */}
        <div className="flex items-center gap-2 mt-4 text-xs text-surface-500">
          <span className="px-2 py-1 bg-surface-100 rounded-lg uppercase">{template.sourceType}</span>
          <ArrowRight size={12} className="text-surface-300" />
          <span className="px-2 py-1 bg-surface-100 rounded-lg uppercase">{template.destType}</span>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-1 mt-3">
          {template.options.overwrite && <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-[10px] rounded-full">Overwrite</span>}
          {template.options.compress && <span className="px-2 py-0.5 bg-success-50 text-success-600 text-[10px] rounded-full">Compress</span>}
          {template.options.verifyChecksum && <span className="px-2 py-0.5 bg-warning-50 text-warning-600 text-[10px] rounded-full">Verify</span>}
        </div>

        {/* Stats & Run */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-100">
          <div className="flex items-center gap-3 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <Play size={10} /> {template.usageCount} runs
            </span>
            {template.lastUsed && (
              <span className="flex items-center gap-1">
                <Clock size={10} /> {formatRelativeTime(template.lastUsed)}
              </span>
            )}
          </div>
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors"
          >
            <Play size={14} />
            Run
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateModal({
  template,
  onClose,
  onSave,
}: {
  template: Template | null;
  onClose: () => void;
  onSave: (template: Template) => void;
}) {
  const [name, setName] = useState(template?.name || "");
  const [description, setDescription] = useState(template?.description || "");
  const [icon, setIcon] = useState(template?.icon || "📁");
  const [sourcePath, setSourcePath] = useState(template?.sourcePath || "/");
  const [destPath, setDestPath] = useState(template?.destPath || "/");
  const [options, setOptions] = useState(template?.options || {
    overwrite: true,
    preserveTimestamps: true,
    verifyChecksum: true,
    compress: false,
  });

  const icons = ["📁", "🌐", "🗄️", "🎬", "📋", "🚀", "💾", "📦", "🔒", "⚡"];

  const handleSave = () => {
    onSave({
      id: template?.id || Date.now().toString(),
      name,
      description,
      icon,
      color: "from-primary-500 to-primary-600",
      transferType: template?.transferType || "local_to_remote",
      sourceType: template?.sourceType || "local",
      destType: template?.destType || "sftp",
      sourcePath,
      destPath,
      options,
      usageCount: template?.usageCount || 0,
      lastUsed: template?.lastUsed || null,
      isFavorite: template?.isFavorite || false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100 sticky top-0 bg-white">
          <h3 className="font-bold text-surface-900">
            {template ? "Edit Template" : "Create Template"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {icons.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={cn(
                    "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all",
                    icon === i ? "bg-primary-100 ring-2 ring-primary-500" : "bg-surface-100 hover:bg-surface-200"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Transfer Template"
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this template does..."
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm"
            />
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
            <label className="block text-sm font-medium text-surface-700 mb-2">Options</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(options).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 p-3 bg-surface-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                    className="rounded accent-primary-500"
                  />
                  <span className="text-sm text-surface-700 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name}
              className="ml-auto flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-xl disabled:opacity-50"
            >
              <Check size={14} />
              {template ? "Save Changes" : "Create Template"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
