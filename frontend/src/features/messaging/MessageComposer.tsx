/**
 * MessageComposer Component
 * Rich text message composer with attachment support
 */

import { useState, useRef, useEffect } from 'react';
import type { Message } from '@/api/communications/messaging-api';
import { TIMEOUTS } from '@/config/ports.config';

export interface MessageComposerProps {
  onSend: (content: string, attachments?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  replyTo?: Message;
  onCancelReply?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export function MessageComposer({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  placeholder = 'Type a message...',
  disabled = false,
  maxLength = 10000,
  className = '',
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  // Handle typing indicator
  useEffect(() => {
    if (content.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    } else if (!content.trim() && isTyping) {
      setIsTyping(false);
      onTyping?.(false);
    }

    // Clear typing indicator after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping?.(false);
      }
    }, TIMEOUTS.TYPING_INDICATOR);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [content, isTyping, onTyping]);

  const handleSend = () => {
    if (!content.trim() && attachments.length === 0) return;
    if (disabled) return;

    onSend(content, attachments);
    setContent('');
    setAttachments([]);
    setIsTyping(false);
    onTyping?.(false);

    // Focus back on textarea
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-750">
          <div className="flex items-center gap-2 text-sm">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            <span className="text-gray-600 dark:text-gray-400">
              Replying to <span className="font-medium">{replyTo.senderName}</span>
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-gray-200 p-3 dark:border-gray-700">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-gray-700"
            >
              <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <span className="max-w-[200px] truncate text-gray-700 dark:text-gray-300">{file.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
              <button
                onClick={() => removeAttachment(index)}
                className="ml-1 text-gray-400 hover:text-red-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="flex items-end gap-2 p-3">
        {/* File attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          title="Attach file"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.txt"
        />

        {/* Textarea */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={1}
            className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          />
          {content.length > maxLength * 0.9 && (
            <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
              {content.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || (!content.trim() && attachments.length === 0)}
          className="flex-shrink-0 rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          title="Send message"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      {/* Hint text */}
      <div className="px-4 pb-2 text-xs text-gray-500 dark:text-gray-400">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
