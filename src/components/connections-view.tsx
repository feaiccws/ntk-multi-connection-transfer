"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Trash2,
  Star,
  RefreshCw,
  MoreVertical,
  Check,
  AlertCircle,
  Wifi,
} from "./icons";
import { getConnectionTypeIcon } from "./icons";
import {
  getConnectionLabel,
  formatRelativeTime,
  cn,
} from "@/lib/utils";
import ConnectionForm from "./connection-form";
import type { Connection } from "@/db/schema";

export default function ConnectionsView() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; message: string; latency?: number }>
  >({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchConnections = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/connections");
      const data = await res.json();
      setConnections(Array.isArray(data) ? data : []);
    } catch {
      // handle error
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchConnections(false);
    });
  }, [fetchConnections]);

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/connections/${id}/test`, {
        method: "POST",
      });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [id]: data }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [id]: { success: false, message: "Test failed" },
      }));
    }
    setTestingId(null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/connections/${id}`, { method: "DELETE" });
    fetchConnections();
    setOpenMenu(null);
  };

  const handleToggleFavorite = async (id: string, current: boolean | null) => {
    await fetch(`/api/connections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !current }),
    });
    fetchConnections();
  };

  const filtered = connections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase())
  );

  const favorites = filtered.filter((c) => c.isFavorite);
  const others = filtered.filter((c) => !c.isFavorite);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Connections</h2>
          <p className="text-surface-500 text-sm mt-1">
            Manage your server and cloud storage connections
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all"
        >
          <Plus size={16} />
          Add Connection
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search connections..."
          className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 bg-white rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <Wifi size={32} className="text-surface-300" />
          </div>
          <p className="text-surface-600 font-medium">No connections found</p>
          <p className="text-surface-400 text-sm mt-1">
            {search
              ? "Try a different search term"
              : "Add your first connection to get started"}
          </p>
          {!search && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-5 py-2.5 bg-primary-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all"
            >
              Add Connection
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {favorites.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Star size={14} className="text-warning-500" />
                Favorites
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {favorites.map((c) => (
                  <ConnectionCard
                    key={c.id}
                    connection={c}
                    testResult={testResults[c.id]}
                    isTesting={testingId === c.id}
                    onTest={handleTest}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                    isMenuOpen={openMenu === c.id}
                    onMenuToggle={() =>
                      setOpenMenu(openMenu === c.id ? null : c.id)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            {favorites.length > 0 && others.length > 0 && (
              <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3">
                All Connections
              </h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {others.map((c) => (
                <ConnectionCard
                  key={c.id}
                  connection={c}
                  testResult={testResults[c.id]}
                  isTesting={testingId === c.id}
                  onTest={handleTest}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  isMenuOpen={openMenu === c.id}
                  onMenuToggle={() =>
                    setOpenMenu(openMenu === c.id ? null : c.id)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <ConnectionForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchConnections();
          }}
        />
      )}
    </div>
  );
}

function ConnectionCard({
  connection,
  testResult,
  isTesting,
  onTest,
  onDelete,
  onToggleFavorite,
  isMenuOpen,
  onMenuToggle,
}: {
  connection: Connection;
  testResult?: { success: boolean; message: string; latency?: number };
  isTesting: boolean;
  onTest: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean | null) => void;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}) {
  const connectionIcon = getConnectionTypeIcon(connection.type);

  return (
    <div className="bg-white rounded-2xl border border-surface-100 p-5 hover:shadow-lg transition-all duration-300 group relative">
      {/* Menu */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onMenuToggle}
          className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical size={16} className="text-surface-400" />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 top-9 w-44 bg-white rounded-xl shadow-xl border border-surface-100 py-1 z-10">
            <button
              onClick={() => {
                onToggleFavorite(connection.id, connection.isFavorite);
                onMenuToggle();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50"
            >
              <Star
                size={14}
                className={
                  connection.isFavorite ? "text-warning-500 fill-warning-500" : ""
                }
              />
              {connection.isFavorite ? "Remove Favorite" : "Add to Favorites"}
            </button>
            <button
              onClick={() => onTest(connection.id)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-surface-600 hover:bg-surface-50"
            >
              <RefreshCw size={14} />
              Test Connection
            </button>
            <hr className="my-1 border-surface-100" />
            <button
              onClick={() => onDelete(connection.id)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger-500 hover:bg-danger-50"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
          {React.createElement(connectionIcon, { size: 24, className: "text-surface-600" })}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-surface-900 truncate">
              {connection.name}
            </h3>
            {connection.isFavorite && (
              <Star
                size={14}
                className="text-warning-500 fill-warning-500 flex-shrink-0"
              />
            )}
          </div>
          <p className="text-xs text-surface-400 mt-0.5">
            {getConnectionLabel(connection.type)}
            {connection.host ? ` • ${connection.host}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              connection.isActive ? "bg-success-500" : "bg-surface-300"
            )}
          />
          <span className="text-xs text-surface-400">
            {connection.lastUsed
              ? `Used ${formatRelativeTime(connection.lastUsed)}`
              : "Never used"}
          </span>
        </div>
        <button
          onClick={() => onTest(connection.id)}
          disabled={isTesting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            size={12}
            className={isTesting ? "animate-spin" : ""}
          />
          {isTesting ? "Testing" : "Test"}
        </button>
      </div>

      {testResult && (
        <div
          className={cn(
            "mt-3 flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium",
            testResult.success
              ? "bg-success-50 text-success-600"
              : "bg-danger-50 text-danger-600"
          )}
        >
          {testResult.success ? (
            <Check size={14} />
          ) : (
            <AlertCircle size={14} />
          )}
          <span className="truncate">{testResult.message}</span>
          {testResult.latency && (
            <span className="ml-auto text-surface-400">
              {testResult.latency}ms
            </span>
          )}
        </div>
      )}
    </div>
  );
}
