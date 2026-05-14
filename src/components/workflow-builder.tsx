"use client";

import { useState } from "react";
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit3,
  Check,
  X,
  ArrowRight,
  ArrowDown,
  FolderOpen,
  Upload,
  Download,
  Bell,
  Send,
  Filter,
  RefreshCw,
  Clock,
  Zap,
} from "./icons";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: string;
  type: "trigger" | "action" | "condition";
  name: string;
  icon: string;
  config: Record<string, string>;
}

interface WorkflowDef {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "draft";
  steps: WorkflowStep[];
  runs: number;
  lastRun: string | null;
}

const mockWorkflows: WorkflowDef[] = [
  {
    id: "1",
    name: "Auto-Backup on Upload",
    description: "When a file is uploaded, automatically create a backup copy",
    status: "active",
    steps: [
      { id: "1", type: "trigger", name: "File Uploaded", icon: "📥", config: { path: "/uploads" } },
      { id: "2", type: "condition", name: "File Size > 10MB", icon: "🔍", config: { operator: ">", value: "10MB" } },
      { id: "3", type: "action", name: "Copy to Backup", icon: "📋", config: { destination: "/backups" } },
      { id: "4", type: "action", name: "Send Notification", icon: "🔔", config: { channel: "slack" } },
    ],
    runs: 234,
    lastRun: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "2",
    name: "Daily Report Generator",
    description: "Generate and send daily transfer reports",
    status: "active",
    steps: [
      { id: "1", type: "trigger", name: "Schedule: Daily 9 AM", icon: "⏰", config: { cron: "0 9 * * *" } },
      { id: "2", type: "action", name: "Generate Report", icon: "📊", config: { type: "transfer_summary" } },
      { id: "3", type: "action", name: "Email Report", icon: "📧", config: { to: "team@example.com" } },
    ],
    runs: 45,
    lastRun: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    name: "Auto-Compress Old Files",
    description: "Compress files older than 30 days",
    status: "paused",
    steps: [
      { id: "1", type: "trigger", name: "Schedule: Weekly", icon: "⏰", config: { cron: "0 2 * * 0" } },
      { id: "2", type: "action", name: "Find Old Files", icon: "🔎", config: { age: "30d" } },
      { id: "3", type: "action", name: "Compress Files", icon: "🗜️", config: { format: "zip" } },
      { id: "4", type: "action", name: "Move to Archive", icon: "📦", config: { destination: "/archive" } },
    ],
    runs: 12,
    lastRun: new Date(Date.now() - 604800000).toISOString(),
  },
];

const triggerTemplates = [
  { name: "File Uploaded", icon: "📥", description: "When a new file is uploaded" },
  { name: "File Modified", icon: "✏️", description: "When a file is changed" },
  { name: "File Deleted", icon: "🗑️", description: "When a file is removed" },
  { name: "Scheduled", icon: "⏰", description: "Run on a schedule" },
  { name: "Transfer Complete", icon: "✅", description: "When a transfer finishes" },
  { name: "Sync Conflict", icon: "⚠️", description: "When a sync conflict occurs" },
];

const actionTemplates = [
  { name: "Copy File", icon: "📋", description: "Copy to another location" },
  { name: "Move File", icon: "📁", description: "Move to another location" },
  { name: "Delete File", icon: "🗑️", description: "Delete the file" },
  { name: "Compress", icon: "🗜️", description: "Create zip archive" },
  { name: "Send Email", icon: "📧", description: "Send email notification" },
  { name: "Webhook", icon: "🔗", description: "Call external URL" },
  { name: "Slack Message", icon: "💬", description: "Send to Slack" },
  { name: "Run Transfer", icon: "🔄", description: "Start a transfer" },
];

const conditionTemplates = [
  { name: "File Size", icon: "📏", description: "Check file size" },
  { name: "File Type", icon: "📄", description: "Check file extension" },
  { name: "File Name", icon: "🏷️", description: "Match file name pattern" },
  { name: "Time", icon: "🕐", description: "Check current time" },
];

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<WorkflowDef[]>(mockWorkflows);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowDef | null>(null);

  const toggleStatus = (id: string) => {
    setWorkflows((ws) =>
      ws.map((w) =>
        w.id === id
          ? { ...w, status: w.status === "active" ? "paused" : "active" }
          : w
      )
    );
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows((ws) => ws.filter((w) => w.id !== id));
  };

  const runWorkflow = (id: string) => {
    setWorkflows((ws) =>
      ws.map((w) =>
        w.id === id
          ? { ...w, runs: w.runs + 1, lastRun: new Date().toISOString() }
          : w
      )
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Automation Workflows</h2>
          <p className="text-surface-500 text-sm mt-1">
            Create automated workflows to streamline your file operations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all"
        >
          <Plus size={16} />
          Create Workflow
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-surface-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Workflow size={20} className="text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{workflows.length}</p>
              <p className="text-xs text-surface-500">Total Workflows</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center">
              <Play size={20} className="text-success-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">
                {workflows.filter((w) => w.status === "active").length}
              </p>
              <p className="text-xs text-surface-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
              <Zap size={20} className="text-warning-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">
                {workflows.reduce((a, w) => a + w.runs, 0)}
              </p>
              <p className="text-xs text-surface-500">Total Runs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
              <Clock size={20} className="text-accent-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">
                {workflows.filter((w) => w.steps.some((s) => s.name.includes("Schedule"))).length}
              </p>
              <p className="text-xs text-surface-500">Scheduled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onToggle={() => toggleStatus(workflow.id)}
            onEdit={() => setEditingWorkflow(workflow)}
            onDelete={() => deleteWorkflow(workflow.id)}
            onRun={() => runWorkflow(workflow.id)}
          />
        ))}

        {workflows.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
            <Workflow size={48} className="text-surface-300 mx-auto mb-4" />
            <p className="text-surface-600 font-medium">No workflows yet</p>
            <p className="text-surface-400 text-sm mt-1">
              Create your first automation workflow
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-5 py-2.5 bg-primary-500 text-white font-semibold text-sm rounded-xl"
            >
              Create Workflow
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingWorkflow) && (
        <WorkflowModal
          workflow={editingWorkflow}
          onClose={() => {
            setShowCreateModal(false);
            setEditingWorkflow(null);
          }}
          onSave={(workflow) => {
            if (editingWorkflow) {
              setWorkflows((ws) => ws.map((w) => (w.id === workflow.id ? workflow : w)));
            } else {
              setWorkflows([workflow, ...workflows]);
            }
            setShowCreateModal(false);
            setEditingWorkflow(null);
          }}
        />
      )}
    </div>
  );
}

function WorkflowCard({
  workflow,
  onToggle,
  onEdit,
  onDelete,
  onRun,
}: {
  workflow: WorkflowDef;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRun: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-lg transition-all">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Status */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
              workflow.status === "active" ? "bg-success-50" :
              workflow.status === "paused" ? "bg-warning-50" :
              "bg-surface-100"
            )}
          >
            {workflow.status === "active" ? (
              <Play size={24} className="text-success-500" />
            ) : workflow.status === "paused" ? (
              <Pause size={24} className="text-warning-500" />
            ) : (
              <Edit3 size={24} className="text-surface-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-surface-900">{workflow.name}</h3>
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full capitalize",
                  workflow.status === "active" ? "bg-success-50 text-success-600" :
                  workflow.status === "paused" ? "bg-warning-50 text-warning-600" :
                  "bg-surface-100 text-surface-500"
                )}
              >
                {workflow.status}
              </span>
            </div>
            <p className="text-sm text-surface-500 mt-1">{workflow.description}</p>

            {/* Steps Preview */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {workflow.steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-50 rounded-lg">
                    <span>{step.icon}</span>
                    <span className="text-xs font-medium text-surface-700">{step.name}</span>
                  </div>
                  {i < workflow.steps.length - 1 && (
                    <ArrowRight size={12} className="text-surface-300" />
                  )}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-xs text-surface-400">
              <span>{workflow.runs} runs</span>
              {workflow.lastRun && (
                <span>Last run: {new Date(workflow.lastRun).toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onRun}
              className="w-9 h-9 rounded-xl bg-primary-50 hover:bg-primary-100 flex items-center justify-center text-primary-600"
              title="Run Now"
            >
              <Play size={16} />
            </button>
            <button
              onClick={onToggle}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center",
                workflow.status === "active"
                  ? "bg-warning-50 hover:bg-warning-100 text-warning-600"
                  : "bg-success-50 hover:bg-success-100 text-success-600"
              )}
              title={workflow.status === "active" ? "Pause" : "Activate"}
            >
              {workflow.status === "active" ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={onEdit}
              className="w-9 h-9 rounded-xl bg-surface-100 hover:bg-surface-200 flex items-center justify-center text-surface-600"
              title="Edit"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="w-9 h-9 rounded-xl bg-surface-100 hover:bg-danger-100 flex items-center justify-center text-surface-600 hover:text-danger-600"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowModal({
  workflow,
  onClose,
  onSave,
}: {
  workflow: WorkflowDef | null;
  onClose: () => void;
  onSave: (workflow: WorkflowDef) => void;
}) {
  const [name, setName] = useState(workflow?.name || "");
  const [description, setDescription] = useState(workflow?.description || "");
  const [steps, setSteps] = useState<WorkflowStep[]>(workflow?.steps || []);
  const [showAddStep, setShowAddStep] = useState(false);
  const [stepType, setStepType] = useState<"trigger" | "action" | "condition">("trigger");

  const addStep = (template: { name: string; icon: string }) => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      type: stepType,
      name: template.name,
      icon: template.icon,
      config: {},
    };
    setSteps([...steps, newStep]);
    setShowAddStep(false);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    onSave({
      id: workflow?.id || Date.now().toString(),
      name,
      description,
      status: workflow?.status || "draft",
      steps,
      runs: workflow?.runs || 0,
      lastRun: workflow?.lastRun || null,
    });
  };

  const templates = stepType === "trigger" ? triggerTemplates :
                    stepType === "action" ? actionTemplates :
                    conditionTemplates;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Workflow size={20} className="text-primary-500" />
            </div>
            <h3 className="font-bold text-surface-900">
              {workflow ? "Edit Workflow" : "Create Workflow"}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Workflow Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workflow"
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this workflow does..."
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm"
            />
          </div>

          {/* Workflow Steps */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Steps</label>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2">
                  {i > 0 && (
                    <div className="w-full flex items-center justify-center -my-1">
                      <ArrowDown size={16} className="text-surface-300" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-1 p-3 bg-surface-50 rounded-xl">
                    <span className="text-xl">{step.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.name}</p>
                      <p className="text-xs text-surface-400 capitalize">{step.type}</p>
                    </div>
                    <button
                      onClick={() => removeStep(step.id)}
                      className="w-6 h-6 rounded hover:bg-surface-200 flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Step */}
              {showAddStep ? (
                <div className="p-4 bg-surface-50 rounded-xl space-y-3">
                  <div className="flex gap-2">
                    {(["trigger", "condition", "action"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setStepType(type)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-lg capitalize",
                          stepType === type ? "bg-primary-500 text-white" : "bg-white text-surface-600"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => addStep(t)}
                        className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-surface-100 text-left"
                      >
                        <span>{t.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{t.name}</p>
                          <p className="text-xs text-surface-400">{t.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowAddStep(false)}
                    className="text-xs text-surface-500 hover:text-surface-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddStep(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-surface-200 rounded-xl text-surface-500 hover:border-primary-300 hover:text-primary-600"
                >
                  <Plus size={16} />
                  <span className="text-sm font-medium">Add Step</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name || steps.length === 0}
              className="ml-auto flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-xl disabled:opacity-50"
            >
              <Check size={14} />
              {workflow ? "Save Changes" : "Create Workflow"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
