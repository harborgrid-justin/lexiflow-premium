'use client';

/**
 * Research Content Component
 * Displays main content for session or project
 *
 * @module research/[id]/_components/ResearchContent
 */

import { useState } from 'react';
import {
  FileText,
  MessageSquare,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import type {
  ResearchSessionEntity,
  ResearchProject,
  ResearchNote,
} from '@/types/research';
import { createResearchNote, updateResearchNote, deleteResearchNote } from '../../actions';

interface ResearchContentProps {
  type: 'session' | 'project';
  data: ResearchSessionEntity | ResearchProject;
  notes: ResearchNote[];
}

export function ResearchContent({ type, data, notes }: ResearchContentProps) {
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');

  const isSession = type === 'session';
  const session = isSession ? (data as ResearchSessionEntity) : null;
  const project = !isSession ? (data as ResearchProject) : null;

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;

    if (editingNote) {
      await updateResearchNote(editingNote, {
        title: noteTitle,
        content: noteContent,
      });
    } else {
      await createResearchNote({
        title: noteTitle,
        content: noteContent,
        userId: 'current-user' as any, // Will be replaced by auth context
        sessionId: isSession ? data.id : undefined,
        projectId: !isSession ? data.id : undefined,
      });
    }

    setNoteContent('');
    setNoteTitle('');
    setShowNoteForm(false);
    setEditingNote(null);
  };

  const handleEditNote = (note: ResearchNote) => {
    setEditingNote(note.id);
    setNoteTitle(note.title || '');
    setNoteContent(note.content);
    setShowNoteForm(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Delete this note?')) {
      await deleteResearchNote(noteId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Response/Description Section */}
      {(isSession && session?.response) || (!isSession && project?.description) ? (
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-slate-500" />
            {isSession ? 'AI Response' : 'Description'}
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {isSession ? session?.response : project?.description}
            </p>
          </div>
        </section>
      ) : null}

      {/* Research Questions (for projects) */}
      {!isSession && project?.researchQuestions && project.researchQuestions.length > 0 && (
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Research Questions
          </h2>
          <ul className="space-y-3">
            {project.researchQuestions.map((question, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <p className="text-slate-700 dark:text-slate-300">{question}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Notes Section */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-slate-500" />
            Notes
          </h2>
          <button
            onClick={() => {
              setShowNoteForm(true);
              setEditingNote(null);
              setNoteContent('');
              setNoteTitle('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Note
          </button>
        </div>

        {/* Note Form */}
        {showNoteForm && (
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title (optional)"
              className="w-full px-4 py-2 mb-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note here..."
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowNoteForm(false);
                  setEditingNote(null);
                  setNoteContent('');
                  setNoteTitle('');
                }}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!noteContent.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                {editingNote ? 'Update' : 'Save'} Note
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {notes.length > 0 ? (
            notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onEdit={() => handleEditNote(note)}
                onDelete={() => handleDeleteNote(note.id)}
              />
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
              <h3 className="mt-4 text-sm font-medium text-slate-900 dark:text-white">
                No notes yet
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Add notes to track your research findings
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Note Item Component
function NoteItem({
  note,
  onEdit,
  onDelete,
}: {
  note: ResearchNote;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {note.title && (
            <h3 className="font-medium text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              {note.isPinned && (
                <Pin className="h-3.5 w-3.5 text-amber-500" />
              )}
              {note.title}
            </h3>
          )}
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {note.content}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {note.createdAt && (
              <span>
                {new Date(note.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
            {note.noteType && (
              <span className="capitalize px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                {note.noteType}
              </span>
            )}
            {note.tags && note.tags.length > 0 && (
              <div className="flex gap-1">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            title="Edit note"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
