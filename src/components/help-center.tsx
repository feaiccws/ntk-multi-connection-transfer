"use client";

import { useState } from "react";
import {
  HelpCircle,
  X,
  Search,
  ChevronRight,
  ChevronDown,
  FileText,
  MessageSquare,
  Zap,
  Server,
  FolderOpen,
  ArrowRightLeft,
  FolderSync,
  Shield,
  ExternalLink,
} from "./icons";
import { cn } from "@/lib/utils";

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const categories = [
  { id: "getting-started", name: "Getting Started", icon: Zap },
  { id: "connections", name: "Connections", icon: Server },
  { id: "file-management", name: "File Management", icon: FolderOpen },
  { id: "transfers", name: "Transfers", icon: ArrowRightLeft },
  { id: "sync", name: "Sync & Backup", icon: FolderSync },
  { id: "security", name: "Security", icon: Shield },
];

const articles: HelpArticle[] = [
  {
    id: "1",
    title: "Quick Start Guide",
    content: "Learn how to set up your first connection and transfer files in under 5 minutes.",
    category: "getting-started",
  },
  {
    id: "2",
    title: "Keyboard Shortcuts",
    content: "Master NTK FlowBridge with these essential keyboard shortcuts: ⌘K (Command Palette), ⌘D (Dual Pane), ⌘U (Upload), F2 (Rename), Del (Delete).",
    category: "getting-started",
  },
  {
    id: "3",
    title: "Adding FTP/SFTP Connection",
    content: "Step-by-step guide to add FTP, SFTP, or FTPS connections with hostname, port, and authentication.",
    category: "connections",
  },
  {
    id: "4",
    title: "Connecting Cloud Storage",
    content: "Connect Amazon S3, Google Drive, Dropbox, OneDrive, or Azure Blob with OAuth or API keys.",
    category: "connections",
  },
  {
    id: "5",
    title: "Using Dual-Pane Mode",
    content: "Press ⌘D to enable dual-pane mode for easy drag-and-drop transfers between locations.",
    category: "file-management",
  },
  {
    id: "6",
    title: "Zip and Unzip Files",
    content: "Select files, click Zip to create archives. Select a .zip file and click Unzip to extract.",
    category: "file-management",
  },
  {
    id: "7",
    title: "Transfer Queue Management",
    content: "Pause, resume, cancel, or retry transfers. Set priority levels to control order.",
    category: "transfers",
  },
  {
    id: "8",
    title: "Setting Up Two-Way Sync",
    content: "Configure bidirectional synchronization between two locations with conflict resolution.",
    category: "sync",
  },
  {
    id: "9",
    title: "Encryption & Security",
    content: "All connections use TLS/SSL encryption. Credentials are stored securely with AES-256.",
    category: "security",
  },
];

const faqs: FAQ[] = [
  {
    question: "How do I transfer files between cloud providers?",
    answer: "Create connections for both providers, go to New Transfer, select 'Cloud → Cloud', choose your source and destination, then start the transfer.",
  },
  {
    question: "Can I schedule automatic backups?",
    answer: "Yes! Go to Scheduled Transfers to create recurring backups. You can set daily, weekly, or custom schedules using cron expressions.",
  },
  {
    question: "What's the difference between Mirror and Two-Way sync?",
    answer: "Mirror sync makes the destination exactly match the source (including deletions). Two-Way sync merges changes from both sides without deleting.",
  },
  {
    question: "How do I resume a failed transfer?",
    answer: "Go to Transfer Queue, find the failed transfer, and click the Retry button. FlowBridge will resume from where it left off.",
  },
  {
    question: "Is my data encrypted?",
    answer: "Yes. All transfers use TLS/SSL encryption. Stored credentials are encrypted with AES-256. We never store your actual files.",
  },
  {
    question: "Can multiple people use the same account?",
    answer: "The Premium plan supports team workspaces with role-based access control. Contact support to enable team features.",
  },
];

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpCenter({ isOpen, onClose }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"articles" | "faq">("articles");

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <HelpCircle size={20} className="text-primary-500" />
            </div>
            <div>
              <h2 className="font-bold text-surface-900">Help Center</h2>
              <p className="text-xs text-surface-400">Documentation & FAQ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-surface-100 flex-shrink-0">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-11 pr-4 py-3 bg-surface-50 rounded-xl border border-surface-200 focus:border-primary-400 outline-none text-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-2 border-b border-surface-100 flex-shrink-0">
          <button
            onClick={() => setActiveTab("articles")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === "articles" ? "bg-primary-500 text-white" : "text-surface-600 hover:bg-surface-50"
            )}
          >
            <FileText size={16} />
            Articles
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === "faq" ? "bg-primary-500 text-white" : "text-surface-600 hover:bg-surface-50"
            )}
          >
            <MessageSquare size={16} />
            FAQ
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "articles" ? (
            <div className="flex">
              {/* Categories Sidebar */}
              <div className="w-48 border-r border-surface-100 p-4 flex-shrink-0">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                  Categories
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-lg transition-all",
                      !selectedCategory ? "bg-primary-50 text-primary-700 font-medium" : "text-surface-600 hover:bg-surface-50"
                    )}
                  >
                    All Articles
                  </button>
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all",
                          selectedCategory === cat.id ? "bg-primary-50 text-primary-700 font-medium" : "text-surface-600 hover:bg-surface-50"
                        )}
                      >
                        <Icon size={14} />
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Articles List */}
              <div className="flex-1 p-4">
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={40} className="text-surface-200 mx-auto mb-3" />
                    <p className="text-surface-500">No articles found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredArticles.map((article) => (
                      <button
                        key={article.id}
                        className="w-full text-left p-4 bg-surface-50 hover:bg-surface-100 rounded-xl transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-surface-900 group-hover:text-primary-600">
                              {article.title}
                            </h3>
                            <p className="text-sm text-surface-500 mt-1 line-clamp-2">
                              {article.content}
                            </p>
                            <span className="inline-block mt-2 text-xs text-primary-600 font-medium">
                              Read more →
                            </span>
                          </div>
                          <ChevronRight size={16} className="text-surface-300 group-hover:text-primary-500 flex-shrink-0 mt-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={40} className="text-surface-200 mx-auto mb-3" />
                  <p className="text-surface-500">No FAQs found</p>
                </div>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <div key={index} className="border border-surface-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-50 transition-colors"
                    >
                      <span className="font-medium text-surface-900">{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={cn(
                          "text-surface-400 transition-transform",
                          expandedFaq === index && "rotate-180"
                        )}
                      />
                    </button>
                    {expandedFaq === index && (
                      <div className="px-4 pb-4">
                        <p className="text-surface-600 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-100 bg-surface-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-surface-500">
              Can&apos;t find what you&apos;re looking for?
            </p>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg">
              <MessageSquare size={16} />
              Contact Support
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
