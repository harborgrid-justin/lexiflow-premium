/** * @module enterprise/Research/ResearchMemo * @category Enterprise Research * @description Research memo creation with AI summarization, collaboration, and version history */

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bold,
  CheckCircle2,
  Clock,
  Code,
  Download,
  Edit3,
  Eye,
  GitBranch,
  Italic,
  Link2,
  List,
  MessageSquare,
  Plus,
  Quote,
  Redo,
  Save,
  Sparkles,
  Undo,
  User,
  Users,
} from "lucide-react";
import React, { useCallback, useState } from "react";
// Types & Interfaces
// ============================================================================
export interface MemoSection {
  id: string;
  title: string;
  content: string;
  order: number;
}
export interface MemoVersion {
  id: string;
  version: number;
  timestamp: Date;
  author: { name: string; avatar?: string };
  changes: string;
  status: "draft" | "review" | "final";
}
export interface MemoComment {
  id: string;
  author: { name: string; avatar?: string };
  content: string;
  timestamp: Date;
  sectionId?: string;
  resolved: boolean;
}
export interface MemoCollaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  status: "active" | "pending";
}
export interface ResearchMemo {
  id: string;
  title: string;
  client?: string;
  matter?: string;
  author: { name: string; avatar?: string };
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "review" | "final";
  sections: MemoSection[];
  versions: MemoVersion[];
  collaborators: MemoCollaborator[];
  comments: MemoComment[];
}
export interface ResearchMemoProps {
  memo?: ResearchMemo;
  onSave?: (memo: ResearchMemo) => void;
  onExport?: (format: "pdf" | "docx" | "html") => void;
  onShare?: (collaborators: string[]) => void;
  onAISummarize?: (content: string) => Promise<string>;
  className?: string;
} // ============================================================================
// Component
// ============================================================================
export const ResearchMemo: React.FC<ResearchMemoProps> = ({
  memo: initialMemo,
  onSave,
  onAISummarize,
  className = "",
}) => {
  const [memo, setMemo] = useState<ResearchMemo>(
    initialMemo || {
      id: "new",
      title: "Untitled Research Memo",
      author: { name: "Current User", avatar: "CU" },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "draft",
      sections: [
        { id: "1", title: "Issue", content: "", order: 1 },
        { id: "2", title: "Brief Answer", content: "", order: 2 },
        { id: "3", title: "Facts", content: "", order: 3 },
        { id: "4", title: "Analysis", content: "", order: 4 },
        { id: "5", title: "Conclusion", content: "", order: 5 },
      ],
      versions: [],
      collaborators: [],
      comments: [],
    },
  );
  const [activeView, setActiveView] = useState<
    "edit" | "preview" | "versions" | "comments"
  >("edit");
  const [selectedSection, setSelectedSection] = useState<string>(
    memo.sections[0]?.id || "",
  );
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isAISummarizing, setIsAISummarizing] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const currentSection = memo.sections.find((s) => s.id === selectedSection);
  const handleSectionUpdate = useCallback(
    (sectionId: string, content: string) => {
      setMemo((prev) => ({
        ...prev,
        sections: prev.sections.map((section) =>
          section.id === sectionId ? { ...section, content } : section,
        ),
        updatedAt: new Date(),
      }));
    },
    [],
  );
  const handleAISummarize = async () => {
    if (!currentSection || !onAISummarize) return;
    setIsAISummarizing(true);
    try {
      const summary = await onAISummarize(currentSection.content);
      handleSectionUpdate(currentSection.id, summary);
    } catch (error) {
      console.error("AI summarization failed:", error);
    } finally {
      setIsAISummarizing(false);
    }
  };
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave?.(memo);
      setIsSaving(false);
    }, 500);
  };
  const getStatusColor = (status: ResearchMemo["status"]) => {
    switch (status) {
      case "draft":
        return "bg-[var(--color-surfaceRaised)] text-[var(--color-text)] ";
      case "review":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "final":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    }
  };
  const getStatusIcon = (status: ResearchMemo["status"]) => {
    switch (status) {
      case "draft":
        return <Edit3 className="h-3 w-3" />;
      case "review":
        return <AlertCircle className="h-3 w-3" />;
      case "final":
        return <CheckCircle2 className="h-3 w-3" />;
    }
  };
  return (
    <div className={`flex h-full flex-col ${className}`}>
      {" "}
      {/* Header */}{" "}
      <div className="border-b border-[var(--color-borderLight)] bg-[var(--color-surface)] px-6 py-4">
        {" "}
        <div className="mb-4 flex items-start justify-between">
          {" "}
          <div className="flex-1">
            {" "}
            <input
              type="text"
              value={memo.title}
              onChange={(e) => setMemo({ ...memo, title: e.target.value })}
              className="mb-2 w-full border-0 bg-transparent text-2xl font-bold text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-0"
              placeholder="Memo Title"
            />{" "}
            <div className="flex items-center gap-4 text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
              {" "}
              <div className="flex items-center gap-2">
                {" "}
                <span>Client:</span>{" "}
                <input
                  type="text"
                  value={memo.client || ""}
                  onChange={(e) => setMemo({ ...memo, client: e.target.value })}
                  className="border-0 border-b border-[var(--color-border)] bg-transparent px-0 py-0 text-sm focus:border-blue-500 focus:outline-none focus:ring-0"
                  placeholder="Client name"
                />{" "}
              </div>{" "}
              <div className="flex items-center gap-2">
                {" "}
                <span>Matter:</span>{" "}
                <input
                  type="text"
                  value={memo.matter || ""}
                  onChange={(e) => setMemo({ ...memo, matter: e.target.value })}
                  className="border-0 border-b border-[var(--color-border)] bg-transparent px-0 py-0 text-sm focus:border-blue-500 focus:outline-none focus:ring-0"
                  placeholder="Matter number"
                />{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex items-start gap-2">
            {" "}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(memo.status)}`}
            >
              {" "}
              {getStatusIcon(memo.status)}{" "}
              {memo.status.charAt(0).toUpperCase() + memo.status.slice(1)}{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
        {/* Action Bar */}{" "}
        <div className="flex items-center justify-between">
          {" "}
          <div className="flex gap-2">
            {" "}
            <button
              onClick={() => setActiveView("edit")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeView === "edit" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 " : "text-[var(--color-textMuted)] hover:bg-[var(--color-surfaceRaised)] dark:text-[var(--color-textMuted)] dark:hover:bg-gray-700"}`}
            >
              {" "}
              <Edit3 className="h-4 w-4" /> Edit{" "}
            </button>{" "}
            <button
              onClick={() => setActiveView("preview")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeView === "preview" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 " : "text-[var(--color-textMuted)] hover:bg-[var(--color-surfaceRaised)] dark:text-[var(--color-textMuted)] dark:hover:bg-gray-700"}`}
            >
              {" "}
              <Eye className="h-4 w-4" /> Preview{" "}
            </button>{" "}
            <button
              onClick={() => setActiveView("versions")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeView === "versions" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 " : "text-[var(--color-textMuted)] hover:bg-[var(--color-surfaceRaised)] dark:text-[var(--color-textMuted)] dark:hover:bg-gray-700"}`}
            >
              {" "}
              <GitBranch className="h-4 w-4" /> Versions ({memo.versions.length}
              ){" "}
            </button>{" "}
            <button
              onClick={() => setActiveView("comments")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeView === "comments" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 " : "text-[var(--color-textMuted)] hover:bg-[var(--color-surfaceRaised)] dark:text-[var(--color-textMuted)] dark:hover:bg-gray-700"}`}
            >
              {" "}
              <MessageSquare className="h-4 w-4" /> Comments (
              {memo.comments.length}){" "}
            </button>{" "}
          </div>{" "}
          <div className="flex gap-2">
            {" "}
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="inline-flex items-center gap-2 rounded-md border border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50 px-3 py-1.5 text-sm font-medium text-purple-700 hover:from-purple-100 hover:to-blue-100 dark:border-purple-700 dark:from-purple-900/20 dark:to-blue-900/20 dark:text-purple-300"
            >
              {" "}
              <Sparkles className="h-4 w-4" /> AI Assist{" "}
            </button>{" "}
            <button
              onClick={() => setShowCollaborators(!showCollaborators)}
              className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surfaceRaised)] dark:hover:bg-gray-600"
            >
              {" "}
              <Users className="h-4 w-4" /> Share{" "}
            </button>{" "}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primaryDark)] disabled:opacity-50"
            >
              {" "}
              <Save className="h-4 w-4" />{" "}
              {isSaving ? "Saving..." : "Save"}{" "}
            </button>{" "}
            <div className="relative">
              {" "}
              <button className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surfaceRaised)] dark:hover:bg-gray-600">
                {" "}
                <Download className="h-4 w-4" /> Export{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Main Content */}{" "}
      <div className="flex flex-1 overflow-hidden">
        {" "}
        {/* Section Navigation */}{" "}
        <div className="w-64 border-r border-[var(--color-borderLight)] bg-[var(--color-surfaceRaised)] /50">
          {" "}
          <div className="p-4">
            {" "}
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
              {" "}
              Sections{" "}
            </h3>{" "}
            <div className="space-y-1">
              {" "}
              {memo.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${selectedSection === section.id ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 " : "text-[var(--color-text)] hover:bg-[var(--color-surfaceRaised)] dark:hover:bg-gray-700"}`}
                  >
                    {" "}
                    <span className="font-medium">{section.title}</span>{" "}
                    {section.content && (
                      <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                    )}{" "}
                  </button>
                ))}{" "}
            </div>{" "}
            <button className="mt-4 flex w-full items-center gap-2 rounded-md border border-dashed border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-textMuted)] hover:border-gray-400 hover:text-[var(--color-text)] dark:text-[var(--color-textMuted)] dark:hover:text-gray-300">
              {" "}
              <Plus className="h-4 w-4" /> Add Section{" "}
            </button>{" "}
          </div>{" "}
          <div className="border-t border-[var(--color-borderLight)] p-4">
            {" "}
            <div className="text-xs text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
              {" "}
              <div className="mb-1 flex items-center gap-2">
                {" "}
                <Clock className="h-3 w-3" />{" "}
                <span>
                  Last saved: {memo.updatedAt.toLocaleTimeString()}
                </span>{" "}
              </div>{" "}
              <div className="flex items-center gap-2">
                {" "}
                <User className="h-3 w-3" />{" "}
                <span>By {memo.author.name}</span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Editor/Preview Area */}{" "}
        <div className="flex-1 overflow-y-auto">
          {" "}
          <AnimatePresence mode="wait">
            {" "}
            {activeView === "edit" && currentSection && (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                {" "}
                <div className="mx-auto max-w-4xl">
                  {" "}
                  <h2 className="mb-4 text-xl font-bold text-[var(--color-text)]">
                    {" "}
                    {currentSection.title}{" "}
                  </h2>{" "}
                  {/* Editor Toolbar */}{" "}
                  <div className="mb-4 flex gap-1 rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-2">
                    {" "}
                    <button className="rounded p-2 text-[var(--color-textMuted)] hover:bg-[var(--color-surfaceRaised)] dark:text-[var(--color-textMuted)] dark:hover:bg-gray-700">
                      {" "}
                      <Bold className="h-4 w-4" />{" "}
                    </button>{" "}
                    <button className="rounded p-2 text-[var(--color-textMuted)] hover:bg-[var(--color-surfaceRaised)] dark:text-[var(--color-textMuted)] dark:hover:bg-gray-700">
                      {" "}
                      <Italic className="h-4 w-4" />{" "}
                    </button>{" "}
                    <div className="mx-2 w-px bg-[var(--color-backgroundTertiary)]" />{" "}
                    <button className="rounded p-2 text-[var(--color-textMuted)] hover:bg-[var(--color-surfaceRaised)] dark:text-[var(--color-textMuted)] dark:hover:bg-gray-700">
                      {" "}
                      <List className="h-4 w-4" />{" "}
                    </button>{" "}
                    <button className="rounded p-2 text-[var(--color-textMuted)] hover:bg-[var(--color-surfaceRaised)] dark:text-[var(--color-textMuted)] dark:hover:bg-gray-700">
                      {" "}
                      <Link2 className="h-4 w-4" />{" "}
                    </button>{" "}
                    <button className="rounded p-2 text-[var(--color-textMuted)] hover:bg-[var(--color-surfaceRaised)] dark:text-[var(--color-textMuted)] dark:hover:bg-gray-700">
                      {" "}
                      <Quote className="h-4 w-4" />{" "}
                    </button>{" "}
                    <button className="rounded p-2 text-[var(--color-textMuted)] hover:bg-[var(--color-surfaceRaised)] dark:text-[var(--color-textMuted)] dark:hover:bg-gray-700">
                      {" "}
                      <Code className="h-4 w-4" />{" "}
                    </button>{" "}
                    <div className="mx-2 w-px bg-[var(--color-backgroundTertiary)]" />{" "}
                    <button className="rounded p-2 text-[var(--color-textMuted)] hover:bg-[var(--color-surfaceRaised)] dark:text-[var(--color-textMuted)] dark:hover:bg-gray-700">
                      {" "}
                      <Undo className="h-4 w-4" />{" "}
                    </button>{" "}
                    <button className="rounded p-2 text-[var(--color-textMuted)] hover:bg-[var(--color-surfaceRaised)] dark:text-[var(--color-textMuted)] dark:hover:bg-gray-700">
                      {" "}
                      <Redo className="h-4 w-4" />{" "}
                    </button>{" "}
                  </div>{" "}
                  <textarea
                    value={currentSection.content}
                    onChange={(e) =>
                      handleSectionUpdate(currentSection.id, e.target.value)
                    }
                    className="min-h-[500px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 font-serif text-[var(--color-text)] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter ${currentSection.title.toLowerCase()} content...`}
                  />{" "}
                </div>{" "}
              </motion.div>
            )}{" "}
            {activeView === "preview" && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                {" "}
                <div className="mx-auto max-w-4xl">
                  {" "}
                  <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-8 shadow-sm">
                    {" "}
                    <div className="mb-8 border-b border-[var(--color-borderLight)] pb-6">
                      {" "}
                      <h1 className="mb-4 text-3xl font-bold text-[var(--color-text)]">
                        {" "}
                        {memo.title}{" "}
                      </h1>{" "}
                      <div className="grid grid-cols-2 gap-4 text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                        {" "}
                        {memo.client && (
                          <div>
                            {" "}
                            <span className="font-medium">Client:</span>{" "}
                            {memo.client}{" "}
                          </div>
                        )}{" "}
                        {memo.matter && (
                          <div>
                            {" "}
                            <span className="font-medium">Matter:</span>{" "}
                            {memo.matter}{" "}
                          </div>
                        )}{" "}
                        <div>
                          {" "}
                          <span className="font-medium">Author:</span>{" "}
                          {memo.author.name}{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <span className="font-medium">Date:</span>{" "}
                          {memo.createdAt.toLocaleDateString()}{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                    {memo.sections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <div key={section.id} className="mb-8">
                          {" "}
                          <h2 className="mb-3 text-xl font-bold text-[var(--color-text)]">
                            {" "}
                            {section.title}{" "}
                          </h2>{" "}
                          <div className="whitespace-pre-wrap font-serif leading-relaxed text-[var(--color-text)]">
                            {" "}
                            {section.content || (
                              <p className="italic text-[var(--color-textMuted)]">
                                No content yet
                              </p>
                            )}{" "}
                          </div>{" "}
                        </div>
                      ))}{" "}
                  </div>{" "}
                </div>{" "}
              </motion.div>
            )}{" "}
            {activeView === "versions" && (
              <motion.div
                key="versions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                {" "}
                <div className="mx-auto max-w-4xl">
                  {" "}
                  <h2 className="mb-4 text-xl font-bold text-[var(--color-text)]">
                    {" "}
                    Version History{" "}
                  </h2>{" "}
                  {memo.versions.length > 0 ? (
                    <div className="space-y-4">
                      {" "}
                      {memo.versions.map((version) => (
                        <div
                          key={version.id}
                          className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-4"
                        >
                          {" "}
                          <div className="flex items-start justify-between">
                            {" "}
                            <div>
                              {" "}
                              <div className="mb-1 flex items-center gap-2">
                                {" "}
                                <span className="font-semibold text-[var(--color-text)]">
                                  {" "}
                                  Version {version.version}{" "}
                                </span>{" "}
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(version.status)}`}
                                >
                                  {" "}
                                  {version.status}{" "}
                                </span>{" "}
                              </div>{" "}
                              <p className="text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                                {" "}
                                {version.changes}{" "}
                              </p>{" "}
                              <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                                {" "}
                                <span>{version.author.name}</span>{" "}
                                <span>
                                  {version.timestamp.toLocaleString()}
                                </span>{" "}
                              </div>{" "}
                            </div>{" "}
                            <button className="text-sm text-[var(--color-primary)] hover:text-blue-700 dark:hover:text-blue-300">
                              {" "}
                              Restore{" "}
                            </button>{" "}
                          </div>{" "}
                        </div>
                      ))}{" "}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surfaceRaised)] p-12 text-center /50">
                      {" "}
                      <GitBranch className="mx-auto h-12 w-12 text-[var(--color-textMuted)]" />{" "}
                      <p className="mt-2 text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                        {" "}
                        No version history yet{" "}
                      </p>{" "}
                    </div>
                  )}{" "}
                </div>{" "}
              </motion.div>
            )}{" "}
            {activeView === "comments" && (
              <motion.div
                key="comments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                {" "}
                <div className="mx-auto max-w-4xl">
                  {" "}
                  <h2 className="mb-4 text-xl font-bold text-[var(--color-text)]">
                    {" "}
                    Comments & Feedback{" "}
                  </h2>{" "}
                  {memo.comments.length > 0 ? (
                    <div className="space-y-4">
                      {" "}
                      {memo.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-4"
                        >
                          {" "}
                          <div className="flex items-start gap-3">
                            {" "}
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900/30">
                              {" "}
                              {comment.author.avatar ||
                                comment.author.name.charAt(0)}{" "}
                            </div>{" "}
                            <div className="flex-1">
                              {" "}
                              <div className="mb-1 flex items-center gap-2">
                                {" "}
                                <span className="font-semibold text-[var(--color-text)]">
                                  {" "}
                                  {comment.author.name}{" "}
                                </span>{" "}
                                <span className="text-xs text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                                  {" "}
                                  {comment.timestamp.toLocaleString()}{" "}
                                </span>{" "}
                                {comment.resolved && (
                                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                    {" "}
                                    Resolved{" "}
                                  </span>
                                )}{" "}
                              </div>{" "}
                              <p className="text-sm text-[var(--color-text)]">
                                {" "}
                                {comment.content}{" "}
                              </p>{" "}
                            </div>{" "}
                          </div>{" "}
                        </div>
                      ))}{" "}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surfaceRaised)] p-12 text-center /50">
                      {" "}
                      <MessageSquare className="mx-auto h-12 w-12 text-[var(--color-textMuted)]" />{" "}
                      <p className="mt-2 text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                        {" "}
                        No comments yet{" "}
                      </p>{" "}
                    </div>
                  )}{" "}
                </div>{" "}
              </motion.div>
            )}{" "}
          </AnimatePresence>{" "}
        </div>{" "}
        {/* AI Assistant Sidebar */}{" "}
        <AnimatePresence>
          {" "}
          {showAIPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-[var(--color-borderLight)] bg-gradient-to-b from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20"
            >
              {" "}
              <div className="flex h-full flex-col p-4">
                {" "}
                <div className="mb-4 flex items-center justify-between">
                  {" "}
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">
                    {" "}
                    AI Research Assistant{" "}
                  </h3>{" "}
                  <button
                    onClick={() => setShowAIPanel(false)}
                    className="text-[var(--color-textMuted)] hover:text-[var(--color-textMuted)] dark:hover:text-gray-300"
                  >
                    {" "}
                    ×{" "}
                  </button>{" "}
                </div>{" "}
                <div className="mb-4 space-y-2">
                  {" "}
                  <button
                    onClick={() => void handleAISummarize()}
                    disabled={isAISummarizing}
                    className="flex w-full items-center gap-2 rounded-lg border border-purple-200 bg-[var(--color-surface)] p-3 text-left text-sm hover:bg-purple-50 disabled:opacity-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
                  >
                    {" "}
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />{" "}
                    <div>
                      {" "}
                      <div className="font-medium text-[var(--color-text)]">
                        {" "}
                        {isAISummarizing
                          ? "Summarizing..."
                          : "Summarize Section"}{" "}
                      </div>{" "}
                      <div className="text-xs text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                        {" "}
                        AI-powered content summary{" "}
                      </div>{" "}
                    </div>{" "}
                  </button>{" "}
                  <button className="flex w-full items-center gap-2 rounded-lg border border-purple-200 bg-[var(--color-surface)] p-3 text-left text-sm hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20">
                    {" "}
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />{" "}
                    <div>
                      {" "}
                      <div className="font-medium text-[var(--color-text)]">
                        {" "}
                        Suggest Improvements{" "}
                      </div>{" "}
                      <div className="text-xs text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                        {" "}
                        Get writing suggestions{" "}
                      </div>{" "}
                    </div>{" "}
                  </button>{" "}
                  <button className="flex w-full items-center gap-2 rounded-lg border border-purple-200 bg-[var(--color-surface)] p-3 text-left text-sm hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20">
                    {" "}
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />{" "}
                    <div>
                      {" "}
                      <div className="font-medium text-[var(--color-text)]">
                        {" "}
                        Find Citations{" "}
                      </div>{" "}
                      <div className="text-xs text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                        {" "}
                        Auto-find relevant cases{" "}
                      </div>{" "}
                    </div>{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>
          )}{" "}
        </AnimatePresence>{" "}
      </div>{" "}
    </div>
  );
};
export default ResearchMemo;
