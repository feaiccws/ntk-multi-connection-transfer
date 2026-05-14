"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowRightLeft,
  Server,
  FolderOpen,
  Activity,
  Settings,
  Plus,
  Upload,
  Download,
  Home,
  BarChart3,
  FolderSync,
  Layers,
  CalendarClock,
  RefreshCw,
  Command,
  ArrowRight,
} from "./icons";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
  shortcut?: string;
  category: "navigation" | "actions" | "transfers" | "settings";
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Navigation
    { id: "dashboard", title: "Go to Dashboard", icon: Home, action: () => onNavigate("dashboard"), shortcut: "G D", category: "navigation" },
    { id: "transfers", title: "New Transfer", icon: ArrowRightLeft, action: () => onNavigate("transfer"), shortcut: "G T", category: "navigation" },
    { id: "files", title: "File Manager", icon: FolderOpen, action: () => onNavigate("files"), shortcut: "G F", category: "navigation" },
    { id: "connections", title: "Connections", icon: Server, action: () => onNavigate("connections"), shortcut: "G C", category: "navigation" },
    { id: "history", title: "Transfer History", icon: Activity, action: () => onNavigate("history"), shortcut: "G H", category: "navigation" },
    { id: "analytics", title: "Analytics Dashboard", icon: BarChart3, action: () => onNavigate("analytics"), shortcut: "G A", category: "navigation" },
    { id: "sync", title: "Sync Manager", icon: FolderSync, action: () => onNavigate("sync"), shortcut: "G S", category: "navigation" },
    { id: "templates", title: "Transfer Templates", icon: Layers, action: () => onNavigate("templates"), shortcut: "G L", category: "navigation" },
    { id: "scheduled", title: "Scheduled Transfers", icon: CalendarClock, action: () => onNavigate("scheduled"), category: "navigation" },
    { id: "settings", title: "Settings", icon: Settings, action: () => onNavigate("settings"), shortcut: "G ,", category: "navigation" },

    // Actions
    { id: "new-connection", title: "Add New Connection", subtitle: "Create FTP, SFTP, S3, or cloud connection", icon: Plus, action: () => onNavigate("connections"), category: "actions" },
    { id: "upload", title: "Upload Files", subtitle: "Upload files to current location", icon: Upload, action: () => onNavigate("files"), shortcut: "⌘ U", category: "actions" },
    { id: "download", title: "Download Files", subtitle: "Download selected files", icon: Download, action: () => {}, category: "actions" },
    { id: "new-sync", title: "Create Sync Job", subtitle: "Set up folder synchronization", icon: FolderSync, action: () => onNavigate("sync"), category: "actions" },
    { id: "new-template", title: "Create Template", subtitle: "Save transfer configuration", icon: Layers, action: () => onNavigate("templates"), category: "actions" },
    { id: "refresh", title: "Refresh", subtitle: "Reload current view", icon: RefreshCw, action: () => window.location.reload(), shortcut: "⌘ R", category: "actions" },

    // Quick Transfers
    { id: "local-remote", title: "Local → Remote Transfer", icon: ArrowRightLeft, action: () => onNavigate("transfer"), category: "transfers" },
    { id: "cloud-cloud", title: "Cloud → Cloud Transfer", icon: ArrowRightLeft, action: () => onNavigate("transfer"), category: "transfers" },
    { id: "backup", title: "Quick Backup", subtitle: "Backup to cloud storage", icon: Download, action: () => onNavigate("transfer"), category: "transfers" },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.subtitle?.toLowerCase().includes(query.toLowerCase())
  );

  const groupedCommands = {
    navigation: filteredCommands.filter((c) => c.category === "navigation"),
    actions: filteredCommands.filter((c) => c.category === "actions"),
    transfers: filteredCommands.filter((c) => c.category === "transfers"),
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-down">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-100">
          <Command size={20} className="text-surface-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 outline-none text-lg placeholder:text-surface-400"
          />
          <kbd className="px-2 py-1 bg-surface-100 rounded text-xs text-surface-500">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-surface-400">
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
            </div>
          ) : (
            <>
              {groupedCommands.navigation.length > 0 && (
                <CommandGroup title="Navigation" commands={groupedCommands.navigation} selectedIndex={selectedIndex} allCommands={filteredCommands} onSelect={(cmd) => { cmd.action(); onClose(); }} />
              )}
              {groupedCommands.actions.length > 0 && (
                <CommandGroup title="Actions" commands={groupedCommands.actions} selectedIndex={selectedIndex} allCommands={filteredCommands} onSelect={(cmd) => { cmd.action(); onClose(); }} />
              )}
              {groupedCommands.transfers.length > 0 && (
                <CommandGroup title="Quick Transfers" commands={groupedCommands.transfers} selectedIndex={selectedIndex} allCommands={filteredCommands} onSelect={(cmd) => { cmd.action(); onClose(); }} />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100 bg-surface-50 text-xs text-surface-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-surface-200">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-surface-200">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-surface-200">↵</kbd>
              select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-surface-200">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-surface-200">K</kbd>
            to open
          </span>
        </div>
      </div>
    </div>
  );
}

function CommandGroup({
  title,
  commands,
  selectedIndex,
  allCommands,
  onSelect,
}: {
  title: string;
  commands: CommandItem[];
  selectedIndex: number;
  allCommands: CommandItem[];
  onSelect: (cmd: CommandItem) => void;
}) {
  return (
    <div className="mb-2">
      <p className="px-3 py-1.5 text-xs font-semibold text-surface-400 uppercase tracking-wider">
        {title}
      </p>
      {commands.map((cmd) => {
        const globalIndex = allCommands.findIndex((c) => c.id === cmd.id);
        const isSelected = globalIndex === selectedIndex;
        const Icon = cmd.icon;

        return (
          <button
            key={cmd.id}
            onClick={() => onSelect(cmd)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
              isSelected ? "bg-primary-50 text-primary-700" : "hover:bg-surface-50"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              isSelected ? "bg-primary-100" : "bg-surface-100"
            )}>
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{cmd.title}</p>
              {cmd.subtitle && (
                <p className="text-xs text-surface-400 truncate">{cmd.subtitle}</p>
              )}
            </div>
            {cmd.shortcut && (
              <div className="flex gap-1 flex-shrink-0">
                {cmd.shortcut.split(" ").map((k, i) => (
                  <kbd key={i} className="px-1.5 py-0.5 bg-surface-100 rounded text-[10px] text-surface-500">
                    {k}
                  </kbd>
                ))}
              </div>
            )}
            <ArrowRight size={14} className="text-surface-300 opacity-0 group-hover:opacity-100" />
          </button>
        );
      })}
    </div>
  );
}
