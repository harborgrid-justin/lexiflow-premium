import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LiveCursors, EditorCursors, CursorList, CursorPosition } from './LiveCursors';

export interface CollaborativeEditorProps {
  documentId: string;
  initialContent?: string;
  userId: string;
  userName: string;
  onContentChange?: (content: string) => void;
  onCursorChange?: (position: { line: number; column: number }) => void;
  cursors?: CursorPosition[];
  readOnly?: boolean;
  className?: string;
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  documentId,
  initialContent = '',
  userId,
  userName,
  onContentChange,
  onCursorChange,
  cursors = [],
  readOnly = false,
  className = '',
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(initialContent);
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);
      onContentChange?.(newContent);
    },
    [onContentChange],
  );

  const handleCursorMove = useCallback(() => {
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;

    // Calculate line and column
    const textBeforeCursor = text.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const line = lines.length - 1;
    const column = lines[lines.length - 1].length;

    setCursorPosition({ line, column });
    onCursorChange?.({ line, column });
  }, [onCursorChange]);

  useEffect(() => {
    const textarea = editorRef.current;
    if (!textarea) return;

    textarea.addEventListener('click', handleCursorMove);
    textarea.addEventListener('keyup', handleCursorMove);

    return () => {
      textarea.removeEventListener('click', handleCursorMove);
      textarea.removeEventListener('keyup', handleCursorMove);
    };
  }, [handleCursorMove]);

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {isSyncing && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg
                className="animate-spin h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Syncing...
            </span>
          )}
        </div>

        <CursorList cursors={cursors} maxDisplay={3} />
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          readOnly={readOnly}
          className="w-full h-96 p-4 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Start typing..."
          spellCheck={false}
        />

        {/* Live cursors overlay */}
        {cursors.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <EditorCursors cursors={cursors} editorRef={editorRef} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
        <div>
          Line {cursorPosition.line + 1}, Column {cursorPosition.column + 1}
        </div>
        <div>{content.length} characters</div>
      </div>
    </div>
  );
};

// Rich text collaborative editor component
export interface RichCollaborativeEditorProps {
  documentId: string;
  initialContent?: string;
  userId: string;
  userName: string;
  onContentChange?: (content: string) => void;
  cursors?: CursorPosition[];
  readOnly?: boolean;
  features?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    headings?: boolean;
    lists?: boolean;
    links?: boolean;
    images?: boolean;
  };
  className?: string;
}

export const RichCollaborativeEditor: React.FC<RichCollaborativeEditorProps> = ({
  documentId,
  initialContent = '',
  userId,
  userName,
  onContentChange,
  cursors = [],
  readOnly = false,
  features = {
    bold: true,
    italic: true,
    underline: true,
    headings: true,
    lists: true,
    links: true,
    images: false,
  },
  className = '',
}) => {
  const [content, setContent] = useState(initialContent);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleFormat = (command: string, value?: string) => {
    if (readOnly) return;
    document.execCommand(command, false, value);
  };

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {features.bold && (
            <button
              onClick={() => handleFormat('bold')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
          )}
          {features.italic && (
            <button
              onClick={() => handleFormat('italic')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
          )}
          {features.underline && (
            <button
              onClick={() => handleFormat('underline')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Underline (Ctrl+U)"
            >
              <u>U</u>
            </button>
          )}
          {features.headings && (
            <>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <select
                onChange={(e) => handleFormat('formatBlock', e.target.value)}
                className="p-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-sm"
              >
                <option value="p">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
              </select>
            </>
          )}
          {features.lists && (
            <>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <button
                onClick={() => handleFormat('insertUnorderedList')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Bullet List"
              >
                •
              </button>
              <button
                onClick={() => handleFormat('insertOrderedList')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Numbered List"
              >
                1.
              </button>
            </>
          )}
          {features.links && (
            <>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <button
                onClick={() => {
                  const url = prompt('Enter URL:');
                  if (url) handleFormat('createLink', url);
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Insert Link"
              >
                🔗
              </button>
            </>
          )}

          <div className="flex-1" />

          {/* Active users */}
          <CursorList cursors={cursors} maxDisplay={3} />
        </div>
      )}

      {/* Editor content */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          className="min-h-[400px] p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
          onInput={(e) => {
            const newContent = e.currentTarget.innerHTML;
            setContent(newContent);
            onContentChange?.(newContent);
          }}
        />

        {/* Live cursors */}
        {cursors.length > 0 && (
          <LiveCursors
            cursors={cursors}
            containerRef={editorRef as any}
            showLabels={true}
            showSelection={true}
          />
        )}
      </div>
    </div>
  );
};

export default CollaborativeEditor;
