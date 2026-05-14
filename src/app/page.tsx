"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Dashboard from "@/components/dashboard";
import ConnectionsView from "@/components/connections-view";
import TransferView from "@/components/transfer-view";
import HistoryView from "@/components/history-view";
import ScheduledView from "@/components/scheduled-view";
import SettingsView from "@/components/settings-view";
import FileManager from "@/components/file-manager";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import SyncManager from "@/components/sync-manager";
import TransferTemplates from "@/components/transfer-templates";
import WorkflowBuilder from "@/components/workflow-builder";
import DuplicateFinder from "@/components/duplicate-finder";
import StorageAnalyzer from "@/components/storage-analyzer";
import ActivityTimeline from "@/components/activity-timeline";
import CommandPalette from "@/components/command-palette";
import NotificationsCenter, { NotificationBell } from "@/components/notifications-center";
import OnboardingTour, { useOnboarding } from "@/components/onboarding-tour";
import HelpCenter from "@/components/help-center";
import AboutModal from "@/components/about-modal";
import QuickActionsFAB from "@/components/quick-actions-fab";
import { Search, Command } from "@/components/icons";

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard");
  const [transferCount, setTransferCount] = useState(0);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const { shouldShow: showOnboarding, setShouldShow: setShowOnboarding, resetOnboarding } = useOnboarding();

  const handleTransferCreated = useCallback(() => {
    setTransferCount((c) => c + 1);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette: Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Help: Cmd+? or Ctrl+?
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShowHelp(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard onViewChange={setActiveView} />;
      case "connections":
        return <ConnectionsView />;
      case "transfer":
        return <TransferView onTransferCreated={handleTransferCreated} />;
      case "files":
        return <FileManager />;
      case "history":
        return <HistoryView />;
      case "scheduled":
        return <ScheduledView />;
      case "settings":
        return <SettingsView />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "sync":
        return <SyncManager />;
      case "templates":
        return <TransferTemplates />;
      case "workflows":
        return <WorkflowBuilder />;
      case "duplicates":
        return <DuplicateFinder />;
      case "storage":
        return <StorageAnalyzer />;
      case "timeline":
        return <ActivityTimeline />;
      default:
        return <Dashboard onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        transferCount={transferCount}
        onShowHelp={() => setShowHelp(true)}
        onShowAbout={() => setShowAbout(true)}
      />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-surface-100">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            {/* Mobile spacer for menu button */}
            <div className="w-10 lg:hidden" />

            {/* Search / Command Palette Trigger */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className="relative flex-1 max-w-md hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-50 rounded-xl text-sm text-surface-400 hover:bg-surface-100 transition-colors"
            >
              <Search size={16} />
              <span>Search or type a command...</span>
              <div className="ml-auto flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-surface-200 text-[10px] font-medium">⌘</kbd>
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-surface-200 text-[10px] font-medium">K</kbd>
              </div>
            </button>

            {/* Mobile search button */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className="sm:hidden w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center"
            >
              <Search size={18} className="text-surface-500" />
            </button>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <NotificationBell
                onClick={() => setShowNotifications(!showNotifications)}
                unreadCount={3}
              />

              {/* Profile */}
              <div className="flex items-center gap-2 pl-2 border-l border-surface-200">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary-500/20">
                  NTK
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-surface-800 leading-tight">
                    NTK FlowBridge
                  </p>
                  <p className="text-[11px] text-surface-400 leading-tight flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success-500 rounded-full" />
                    Premium
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">{renderView()}</div>
      </main>

      {/* Quick Actions FAB */}
      <QuickActionsFAB onNavigate={setActiveView} />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={(view) => {
          setActiveView(view);
          setShowCommandPalette(false);
        }}
      />

      {/* Notifications Panel */}
      <NotificationsCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onNavigate={setActiveView}
      />

      {/* Help Center */}
      <HelpCenter
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        onShowHelp={() => setShowHelp(true)}
        onResetTour={resetOnboarding}
      />
    </div>
  );
}
