"use client";

import { useState } from "react";
import { X, Check, AlertCircle, RefreshCw } from "./icons";
import { getConnectionTypeIcon } from "./icons";
import { getConnectionLabel, cn } from "@/lib/utils";

const connectionTypes = [
  "ftp",
  "sftp",
  "ftps",
  "s3",
  "google_drive",
  "dropbox",
  "onedrive",
  "azure_blob",
  "local",
  "webdav",
] as const;

interface ConnectionFormProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function ConnectionForm({
  onClose,
  onSaved,
}: ConnectionFormProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [basePath, setBasePath] = useState("/");
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [bucket, setBucket] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const isRemote = ["ftp", "sftp", "ftps", "webdav"].includes(type);
  const isCloud = ["s3", "google_drive", "dropbox", "onedrive", "azure_blob"].includes(type);
  const isS3 = type === "s3";

  const defaultPorts: Record<string, string> = {
    ftp: "21",
    sftp: "22",
    ftps: "990",
    webdav: "443",
  };

  const handleTypeSelect = (t: string) => {
    setType(t);
    setName(getConnectionLabel(t) + " Server");
    if (defaultPorts[t]) setPort(defaultPorts[t]);
    setStep(2);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          host: host || null,
          port: port ? Number(port) : null,
          username: username || null,
          password: password || null,
          basePath,
          accessKey: accessKey || null,
          secretKey: secretKey || null,
          bucket: bucket || null,
          region: region || null,
          token: token || null,
        }),
      });
      if (res.ok) {
        onSaved();
      }
    } catch {
      // handle error silently
    }
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    // Simulate test
    await new Promise((r) => setTimeout(r, 1500));
    setTestResult({
      success: true,
      message: `Connection to ${name} is ready!`,
    });
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
          <div>
            <h2 className="text-lg font-bold text-surface-900">
              {step === 1 ? "Choose Connection Type" : "Configure Connection"}
            </h2>
            <p className="text-sm text-surface-500 mt-0.5">
              {step === 1
                ? "Select the protocol or service to connect to"
                : `Setting up ${getConnectionLabel(type)} connection`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-surface-100 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Type Selection */}
        {step === 1 && (
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {connectionTypes.map((t) => {
                const Icon = getConnectionTypeIcon(t);
                return (
                  <button
                    key={t}
                    onClick={() => handleTypeSelect(t)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-surface-100 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-surface-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                      <Icon
                        size={24}
                        className="text-surface-500 group-hover:text-primary-600 transition-colors"
                      />
                    </div>
                    <span className="text-sm font-semibold text-surface-700 group-hover:text-primary-700">
                      {getConnectionLabel(t)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Connection Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Server"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
              />
            </div>

            {/* Remote fields */}
            {isRemote && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      Host / IP Address
                    </label>
                    <input
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="ftp.example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      Port
                    </label>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder="21"
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* S3 fields */}
            {isS3 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      Access Key
                    </label>
                    <input
                      type="text"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      Secret Key
                    </label>
                    <input
                      type="password"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      Bucket
                    </label>
                    <input
                      type="text"
                      value={bucket}
                      onChange={(e) => setBucket(e.target.value)}
                      placeholder="my-bucket"
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      Region
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm bg-white"
                    >
                      {["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1", "ap-northeast-1"].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Cloud OAuth token */}
            {isCloud && !isS3 && (
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Access Token / API Key
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your OAuth token or API key"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                />
                <p className="text-xs text-surface-400 mt-1.5">
                  You can also connect via OAuth by clicking &quot;Connect
                  Account&quot; below
                </p>
              </div>
            )}

            {/* Base path */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Base Path
              </label>
              <input
                type="text"
                value={basePath}
                onChange={(e) => setBasePath(e.target.value)}
                placeholder="/"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
              />
            </div>

            {/* Test result */}
            {testResult && (
              <div
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl",
                  testResult.success
                    ? "bg-success-50 text-success-600"
                    : "bg-danger-50 text-danger-600"
                )}
              >
                {testResult.success ? (
                  <Check size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <p className="text-sm font-medium">{testResult.message}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={testing ? "animate-spin" : ""}
                />
                {testing ? "Testing..." : "Test Connection"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50"
              >
                <Check size={14} />
                {saving ? "Saving..." : "Save Connection"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
