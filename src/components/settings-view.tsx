"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Globe,
  Zap,
  Check,
  RefreshCw,
} from "./icons";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

interface SettingsData {
  theme: string;
  defaultTransferMode: string;
  defaultBasePath: string;
  timezone: string;
  showNotifications: boolean;
  autoRetry: boolean;
  darkMode: boolean;
  encryptConnections: boolean;
  verifySSL: boolean;
  storeCredentialsSecurely: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  connectionTimeout: number;
  maxRetryAttempts: number;
  passiveFTP: boolean;
  useProxy: boolean;
  bandwidthLimit: number;
  concurrentTransfers: number;
  chunkSize: number;
  multiThreaded: boolean;
  resumeInterrupted: boolean;
  compressDuringTransfer: boolean;
}

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // error
    }
  };

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "network", label: "Network", icon: Globe },
    { id: "performance", label: "Performance", icon: Zap },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-surface-200 rounded-lg" />
        <div className="h-96 bg-white rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Settings</h2>
        <p className="text-surface-500 text-sm mt-1">
          Configure your NTK FlowBridge preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-surface-100 p-2 flex lg:flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full",
                    activeTab === tab.id
                      ? "bg-primary-500 text-white"
                      : "text-surface-600 hover:bg-surface-50"
                  )}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Keyboard Shortcuts Card */}
          <div className="bg-white rounded-2xl border border-surface-100 p-4 mt-4 hidden lg:block">
            <h4 className="font-semibold text-surface-800 text-sm mb-3">Keyboard Shortcuts</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Select All</span>
                <span className="kbd">⌘A</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-500">New Folder</span>
                <span className="kbd">⌘N</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Upload</span>
                <span className="kbd">⌘U</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Dual Pane</span>
                <span className="kbd">⌘D</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Rename</span>
                <span className="kbd">F2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-surface-500">Delete</span>
                <span className="kbd">Del</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-surface-100 p-6">
          {activeTab === "general" && settings && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-surface-900">General Settings</h3>

              {/* Theme Selector */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Theme
                </label>
                <div className="flex gap-2">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        theme === t
                          ? "border-primary-500 bg-primary-50"
                          : "border-surface-200 hover:border-surface-300"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        t === "light" ? "bg-white border border-surface-200" :
                        t === "dark" ? "bg-surface-800" :
                        "bg-gradient-to-br from-white to-surface-800"
                      )}>
                        {t === "light" && <span className="text-lg">☀️</span>}
                        {t === "dark" && <span className="text-lg">🌙</span>}
                        {t === "system" && <span className="text-lg">💻</span>}
                      </div>
                      <span className="text-sm font-medium capitalize">{t}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-surface-400 mt-2">
                  Current: {resolvedTheme} mode
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Default Transfer Mode
                </label>
                <select
                  value={settings.defaultTransferMode}
                  onChange={(e) => updateSetting("defaultTransferMode", e.target.value)}
                  className="w-full max-w-md px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm bg-white"
                >
                  <option value="auto">Auto (Binary for most files)</option>
                  <option value="binary">Binary</option>
                  <option value="ascii">ASCII</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Default Base Path
                </label>
                <input
                  type="text"
                  value={settings.defaultBasePath}
                  onChange={(e) => updateSetting("defaultBasePath", e.target.value)}
                  className="w-full max-w-md px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSetting("timezone", e.target.value)}
                  className="w-full max-w-md px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm bg-white"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="US/Eastern">US/Eastern</option>
                  <option value="US/Pacific">US/Pacific</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </div>

              <ToggleOption
                label="Show notifications"
                desc="Get notified when transfers complete or fail"
                checked={settings.showNotifications}
                onChange={(v) => updateSetting("showNotifications", v)}
              />
              <ToggleOption
                label="Auto-retry failed transfers"
                desc="Automatically retry failed transfers up to 3 times"
                checked={settings.autoRetry}
                onChange={(v) => updateSetting("autoRetry", v)}
              />
            </div>
          )}

          {activeTab === "security" && settings && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-surface-900">Security Settings</h3>

              <ToggleOption
                label="Encrypt connections"
                desc="Use TLS/SSL for all remote connections when available"
                checked={settings.encryptConnections}
                onChange={(v) => updateSetting("encryptConnections", v)}
              />
              <ToggleOption
                label="Verify SSL certificates"
                desc="Reject connections with invalid SSL certificates"
                checked={settings.verifySSL}
                onChange={(v) => updateSetting("verifySSL", v)}
              />
              <ToggleOption
                label="Store credentials securely"
                desc="Encrypt stored passwords and API keys at rest"
                checked={settings.storeCredentialsSecurely}
                onChange={(v) => updateSetting("storeCredentialsSecurely", v)}
              />
              <ToggleOption
                label="Two-factor authentication"
                desc="Require 2FA for accessing connection credentials"
                checked={settings.twoFactorAuth}
                onChange={(v) => updateSetting("twoFactorAuth", v)}
              />

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Session Timeout
                </label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting("sessionTimeout", Number(e.target.value))}
                  className="w-full max-w-md px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm bg-white"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={240}>4 hours</option>
                  <option value={0}>Never</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "network" && settings && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-surface-900">Network Settings</h3>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Connection Timeout
                </label>
                <div className="flex items-center gap-2 max-w-md">
                  <input
                    type="number"
                    value={settings.connectionTimeout}
                    onChange={(e) => updateSetting("connectionTimeout", Number(e.target.value))}
                    className="w-24 px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                  />
                  <span className="text-sm text-surface-500">seconds</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Max Retry Attempts
                </label>
                <input
                  type="number"
                  value={settings.maxRetryAttempts}
                  onChange={(e) => updateSetting("maxRetryAttempts", Number(e.target.value))}
                  className="w-24 px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                />
              </div>

              <ToggleOption
                label="Use passive FTP mode"
                desc="Use passive mode for FTP connections (recommended)"
                checked={settings.passiveFTP}
                onChange={(v) => updateSetting("passiveFTP", v)}
              />
              <ToggleOption
                label="Enable proxy"
                desc="Route connections through a proxy server"
                checked={settings.useProxy}
                onChange={(v) => updateSetting("useProxy", v)}
              />

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Bandwidth Limit
                </label>
                <div className="flex items-center gap-2 max-w-md">
                  <input
                    type="number"
                    value={settings.bandwidthLimit}
                    onChange={(e) => updateSetting("bandwidthLimit", Number(e.target.value))}
                    className="w-24 px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                  />
                  <span className="text-sm text-surface-500">MB/s (0 = unlimited)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && settings && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-surface-900">Performance Settings</h3>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Concurrent Transfers
                </label>
                <div className="flex items-center gap-4 max-w-md">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={settings.concurrentTransfers}
                    onChange={(e) => updateSetting("concurrentTransfers", Number(e.target.value))}
                    className="flex-1 accent-primary-500"
                  />
                  <span className="text-sm font-semibold text-surface-700 w-8 text-center">
                    {settings.concurrentTransfers}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Chunk Size
                </label>
                <select
                  value={settings.chunkSize}
                  onChange={(e) => updateSetting("chunkSize", Number(e.target.value))}
                  className="w-full max-w-md px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm bg-white"
                >
                  <option value={1}>1 MB</option>
                  <option value={5}>5 MB</option>
                  <option value={10}>10 MB</option>
                  <option value={50}>50 MB</option>
                  <option value={100}>100 MB</option>
                </select>
              </div>

              <ToggleOption
                label="Multi-threaded transfers"
                desc="Split large files into parts for faster transfer"
                checked={settings.multiThreaded}
                onChange={(v) => updateSetting("multiThreaded", v)}
              />
              <ToggleOption
                label="Resume interrupted transfers"
                desc="Continue transfers from where they stopped"
                checked={settings.resumeInterrupted}
                onChange={(v) => updateSetting("resumeInterrupted", v)}
              />
              <ToggleOption
                label="Compress during transfer"
                desc="Use compression for text-based files"
                checked={settings.compressDuringTransfer}
                onChange={(v) => updateSetting("compressDuringTransfer", v)}
              />
            </div>
          )}

          {/* Save button */}
          <div className="mt-8 pt-6 border-t border-surface-100 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-lg shadow-primary-500/25 transition-all"
            >
              {saved ? <Check size={14} /> : <RefreshCw size={14} />}
              {saved ? "Saved!" : "Save Changes"}
            </button>
            <button className="px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl transition-colors">
              Reset Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleOption({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
      <div>
        <p className="text-sm font-medium text-surface-700">{label}</p>
        <p className="text-xs text-surface-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "w-11 h-6 rounded-full transition-colors relative flex-shrink-0",
          checked ? "bg-primary-500" : "bg-surface-300"
        )}
      >
        <div
          className={cn(
            "w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform",
            checked ? "translate-x-5.5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
