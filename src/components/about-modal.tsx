"use client";

import { X, Zap, ExternalLink, HelpCircle } from "./icons";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowHelp: () => void;
  onResetTour: () => void;
}

export default function AboutModal({ isOpen, onClose, onShowHelp, onResetTour }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary-500 to-accent-500 px-6 py-8 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center"
          >
            <X size={16} />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Zap size={32} />
          </div>
          <h2 className="text-2xl font-bold">NTK FlowBridge</h2>
          <p className="text-primary-100 text-sm mt-1">Premium Transfer Suite</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Version Info */}
          <div className="bg-surface-50 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-surface-500">Version</p>
                <p className="font-semibold text-surface-900">1.0.0</p>
              </div>
              <div>
                <p className="text-surface-500">License</p>
                <p className="font-semibold text-surface-900">Premium</p>
              </div>
              <div>
                <p className="text-surface-500">Build</p>
                <p className="font-semibold text-surface-900">2024.01.15</p>
              </div>
              <div>
                <p className="text-surface-500">Environment</p>
                <p className="font-semibold text-surface-900">Production</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-4">
            <p className="text-sm font-semibold text-surface-700">Premium Features Included:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Unlimited Transfers",
                "All Protocols",
                "Two-Way Sync",
                "Automation",
                "Analytics",
                "Priority Support",
              ].map((feature) => (
                <span
                  key={feature}
                  className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <button
              onClick={() => { onShowHelp(); onClose(); }}
              className="w-full flex items-center justify-between p-3 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={18} className="text-surface-500" />
                <span className="font-medium text-surface-700">Help Center</span>
              </div>
              <ExternalLink size={14} className="text-surface-400" />
            </button>
            <button
              onClick={() => { onResetTour(); onClose(); }}
              className="w-full flex items-center justify-between p-3 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Zap size={18} className="text-surface-500" />
                <span className="font-medium text-surface-700">Restart Tour</span>
              </div>
            </button>
            <a
              href="#"
              className="flex items-center justify-between p-3 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-[18px] h-[18px] text-surface-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="font-medium text-surface-700">View on GitHub</span>
              </div>
              <ExternalLink size={14} className="text-surface-400" />
            </a>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-surface-100 text-center">
            <p className="text-xs text-surface-400">
              © 2024 NTK FlowBridge. All rights reserved.
            </p>
            <p className="text-xs text-surface-400 mt-1">
              Made with ❤️ for seamless file transfers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
