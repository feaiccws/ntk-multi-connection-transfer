"use client";

import { useState } from "react";
import {
  Home,
  ArrowRightLeft,
  Server,
  Activity,
  Settings,
  CalendarClock,
  Menu,
  X,
  Zap,
  FolderOpen,
  BarChart3,
  FolderSync,
  Layers,
  Workflow,
  HardDrive,
  GitCompare,
  Clock,
  HelpCircle,
  Info,
} from "./icons";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: number;
  divider?: boolean;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "transfer", label: "New Transfer", icon: ArrowRightLeft },
  { id: "files", label: "File Manager", icon: FolderOpen },
  { id: "connections", label: "Connections", icon: Server },
  { id: "history", label: "Transfer Queue", icon: Activity },
  { id: "divider1", label: "", icon: Home, divider: true },
  { id: "sync", label: "Sync Manager", icon: FolderSync },
  { id: "templates", label: "Templates", icon: Layers },
  { id: "workflows", label: "Automation", icon: Workflow },
  { id: "scheduled", label: "Scheduled", icon: CalendarClock },
  { id: "divider2", label: "", icon: Home, divider: true },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "duplicates", label: "Duplicates", icon: GitCompare },
  { id: "timeline", label: "Activity Log", icon: Clock },
  { id: "divider3", label: "", icon: Home, divider: true },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  transferCount?: number;
  onShowHelp?: () => void;
  onShowAbout?: () => void;
}

export default function Sidebar({
  activeView,
  onViewChange,
  transferCount,
  onShowHelp,
  onShowAbout,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = navItems.map((item) => {
    if (item.id === "history" && transferCount) {
      return { ...item, badge: transferCount };
    }
    return item;
  });

  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
          <Zap className="text-white" size={22} />
        </div>
        <div>
          <h1 className="font-bold text-lg text-surface-900 tracking-tight">
            NTK <span className="text-primary-500">FlowBridge</span>
          </h1>
          <p className="text-[10px] text-surface-500 font-medium -mt-0.5 uppercase tracking-wider">
            Premium Transfer Suite
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-1 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          if (item.divider) {
            return <div key={item.id} className="h-px bg-surface-100 my-2" />;
          }

          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
                  : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
              )}
            >
              <Icon size={17} />
              <span>{item.label}</span>
              {item.badge ? (
                <span
                  className={cn(
                    "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-primary-100 text-primary-600"
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-3 border-t border-surface-100">
        <div className="flex gap-2">
          <button
            onClick={onShowHelp}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-surface-500 hover:bg-surface-100 rounded-xl transition-colors"
          >
            <HelpCircle size={16} />
            Help
          </button>
          <button
            onClick={onShowAbout}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-surface-500 hover:bg-surface-100 rounded-xl transition-colors"
          >
            <Info size={16} />
            About
          </button>
        </div>
      </div>

      {/* Bottom info */}
      <div className="px-4 pb-4">
        <div className="rounded-2xl bg-gradient-to-br from-surface-800 to-surface-900 p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
              <Zap size={12} />
            </div>
            <p className="text-sm font-semibold">Premium Active</p>
          </div>
          <p className="text-xs text-surface-400">
            All features unlocked. Unlimited transfers & storage.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-surface-200 z-40 transition-transform duration-300 lg:translate-x-0 flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderNavContent()}
      </aside>
    </>
  );
}
