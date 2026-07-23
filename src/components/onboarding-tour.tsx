"use client";

import { useState, useEffect } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  Server,
  FolderOpen,
  ArrowRightLeft,
  BarChart3,
  FolderSync,
  Workflow,
} from "./icons";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  highlight?: string;
  position: "center" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to NTK FlowBridge! 👋",
    description: "Your premium file transfer suite. Let's take a quick tour of the powerful features at your fingertips.",
    icon: Zap,
    position: "center",
  },
  {
    id: "connections",
    title: "Connect Your Services",
    description: "Add FTP, SFTP, S3, Google Drive, Dropbox, OneDrive, Azure, and more. All your storage in one place.",
    icon: Server,
    highlight: "connections",
    position: "center",
  },
  {
    id: "file-manager",
    title: "Powerful File Manager",
    description: "Browse, preview, edit, zip/unzip, and manage files across all your connections. Dual-pane mode for easy transfers.",
    icon: FolderOpen,
    highlight: "files",
    position: "center",
  },
  {
    id: "transfers",
    title: "Smart Transfers",
    description: "Transfer files between any combination of local, remote, and cloud storage. Queue management, pause/resume, and retry.",
    icon: ArrowRightLeft,
    highlight: "transfer",
    position: "center",
  },
  {
    id: "sync",
    title: "Real-Time Sync",
    description: "Keep folders synchronized with two-way sync, mirror mode, or backup mode. Automatic conflict resolution.",
    icon: FolderSync,
    highlight: "sync",
    position: "center",
  },
  {
    id: "automation",
    title: "Workflow Automation",
    description: "Create automated workflows with triggers, conditions, and actions. Set it and forget it.",
    icon: Workflow,
    highlight: "workflows",
    position: "center",
  },
  {
    id: "analytics",
    title: "Detailed Analytics",
    description: "Track your transfer activity, bandwidth usage, storage breakdown, and performance insights.",
    icon: BarChart3,
    highlight: "analytics",
    position: "center",
  },
  {
    id: "shortcuts",
    title: "Pro Tips ⚡",
    description: "Use ⌘K for quick commands, ⌘D for dual-pane, ⌘U to upload, and F2 to rename. Check Settings for all shortcuts.",
    icon: Zap,
    position: "center",
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
}

export default function OnboardingTour({ isOpen, onClose, onNavigate }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Synchronize state during render instead of inside effects to avoid cascading renders
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    setCurrentStep(0);
  }

  const goToStep = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(index);
      setIsAnimating(false);
    }, 150);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      goToStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem("ntk-onboarding-complete", "true");
    onClose();
  };

  const skipTour = () => {
    localStorage.setItem("ntk-onboarding-complete", "true");
    onClose();
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden transition-opacity duration-150",
        isAnimating ? "opacity-0" : "opacity-100"
      )}>
        {/* Progress Bar */}
        <div className="h-1 bg-surface-100">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={skipTour}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center z-10"
        >
          <X size={18} className="text-surface-400" />
        </button>

        {/* Content */}
        <div className="p-8 pt-6">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
            <Icon size={32} className="text-white" />
          </div>

          {/* Step Counter */}
          <div className="text-center mb-2">
            <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
          </div>

          {/* Title & Description */}
          <h2 className="text-2xl font-bold text-surface-900 text-center mb-3">
            {step.title}
          </h2>
          <p className="text-surface-500 text-center leading-relaxed">
            {step.description}
          </p>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep
                    ? "w-8 bg-primary-500"
                    : index < currentStep
                    ? "bg-primary-300"
                    : "bg-surface-200"
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={skipTour}
              className="text-sm text-surface-400 hover:text-surface-600"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              )}
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-lg shadow-primary-500/25"
              >
                {isLastStep ? (
                  <>
                    Get Started
                    <Check size={16} />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to check if onboarding should be shown
export function useOnboarding() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("ntk-onboarding-complete");
    if (!completed) {
      // Show after a small delay for better UX
      const timer = setTimeout(() => setShouldShow(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem("ntk-onboarding-complete");
    setShouldShow(true);
  };

  return { shouldShow, setShouldShow, resetOnboarding };
}
