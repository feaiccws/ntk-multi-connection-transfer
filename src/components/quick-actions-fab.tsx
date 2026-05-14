"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Upload,
  Download,
  FolderPlus,
  ArrowRightLeft,
  FolderSync,
  Server,
  Layers,
} from "./icons";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  action: string;
}

const quickActions: QuickAction[] = [
  { id: "upload", label: "Upload Files", icon: Upload, color: "bg-primary-500", action: "files" },
  { id: "transfer", label: "New Transfer", icon: ArrowRightLeft, color: "bg-accent-500", action: "transfer" },
  { id: "sync", label: "Quick Sync", icon: FolderSync, color: "bg-success-500", action: "sync" },
  { id: "connection", label: "Add Connection", icon: Server, color: "bg-warning-500", action: "connections" },
  { id: "template", label: "Run Template", icon: Layers, color: "bg-purple-500", action: "templates" },
  { id: "folder", label: "New Folder", icon: FolderPlus, color: "bg-cyan-500", action: "files" },
];

interface QuickActionsFABProps {
  onNavigate: (view: string) => void;
}

export default function QuickActionsFAB({ onNavigate }: QuickActionsFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: string) => {
    onNavigate(action);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Action Buttons */}
      <div
        className={cn(
          "absolute bottom-16 right-0 flex flex-col-reverse items-end gap-3 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action.action)}
              className={cn(
                "flex items-center gap-3 pl-4 pr-3 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group",
                "animate-slide-up"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-sm font-medium text-surface-700 whitespace-nowrap">
                {action.label}
              </span>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", action.color)}>
                <Icon size={18} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300",
          isOpen
            ? "bg-surface-800 rotate-45"
            : "bg-gradient-to-br from-primary-500 to-accent-500"
        )}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
