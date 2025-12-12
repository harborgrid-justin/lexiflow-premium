import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Image as ImageIcon,
  File,
  X,
  Loader2,
} from 'lucide-react';
import { chatService, Attachment } from '../../services/chatService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

/**
 * MessageInput Component
 *
 * Advanced message input with file sharing capabilities
 * Features:
 * - Auto-resizing textarea
 * - File attachments (images, documents)
 * - Drag and drop file upload
 * - Upload progress indicators
 * - Typing indicators
 * - Emoji support (placeholder)
 * - Send on Enter, new line on Shift+Enter
 */

interface MessageInputProps {
  conversationId: string;
  onSendMessage?: (content: string, attachments: Attachment[]) => void;
  placeholder?: string;
  maxAttachments?: number;
  maxFileSize?: number; // in MB
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  onSendMessage,
  placeholder = 'Type a message...',
  maxAttachments = 10,
  maxFileSize = 10, // 10 MB
  className,
}) => {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  }, []);

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!inputText.trim() && attachments.length === 0) return;

    const content = inputText.trim();
    const messageAttachments = [...attachments];

    // Clear input immediately for better UX
    setInputText('');
    setAttachments([]);
    setUploadProgress(new Map());

    // Send message
    if (onSendMessage) {
      onSendMessage(content, messageAttachments);
    } else {
      try {
        await chatService.sendMessage(conversationId, content, {
          attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
        });
      } catch (error) {
        console.error('[MessageInput] Failed to send message:', error);
        // Restore input on error
        setInputText(content);
        setAttachments(messageAttachments);
      }
    }

    // Focus back on input
    textareaRef.current?.focus();
  }, [inputText, attachments, conversationId, onSendMessage]);

  // Handle Enter key
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      // Check max attachments
      if (attachments.length + files.length > maxAttachments) {
        alert(`You can only attach up to ${maxAttachments} files`);
        return;
      }

      setIsUploading(true);

      try {
        const uploadedAttachments: Attachment[] = [];

        for (const file of Array.from(files)) {
          // Check file size
          if (file.size > maxFileSize * 1024 * 1024) {
            alert(`File "${file.name}" is too large. Maximum size is ${maxFileSize}MB`);
            continue;
          }

          // Upload file
          const fileId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Track progress
          setUploadProgress((prev) => new Map(prev).set(fileId, 0));

          const attachment = await chatService.uploadFile(conversationId, file, (progress) => {
            setUploadProgress((prev) => new Map(prev).set(fileId, progress));
          });

          uploadedAttachments.push(attachment);

          // Remove from progress
          setUploadProgress((prev) => {
            const newMap = new Map(prev);
            newMap.delete(fileId);
            return newMap;
          });
        }

        setAttachments((prev) => [...prev, ...uploadedAttachments]);
      } catch (error) {
        console.error('[MessageInput] Failed to upload file:', error);
        alert('Failed to upload file. Please try again.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [conversationId, attachments.length, maxAttachments, maxFileSize],
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
    },
    [handleFileSelect],
  );

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [handleFileSelect],
  );

  // Remove attachment
  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  }, []);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    return File;
  };

  return (
    <div
      className={cn('relative', className)}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-lg z-50 flex items-center justify-center">
          <div className="text-center">
            <Paperclip className="h-12 w-12 mx-auto mb-2 text-blue-500" />
            <p className={cn('text-sm font-medium', theme.text.primary)}>Drop files here</p>
          </div>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className={cn('p-3 border-b space-y-2', theme.border.default)}>
          <div className="flex items-center justify-between mb-2">
            <span className={cn('text-sm font-medium', theme.text.secondary)}>
              Attachments ({attachments.length})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {attachments.map((attachment) => {
              const Icon = getFileIcon(attachment.type);

              return (
                <div
                  key={attachment.id}
                  className={cn(
                    'p-2 rounded-lg border flex items-center gap-2 group',
                    theme.surface.default,
                    theme.border.default,
                  )}
                >
                  <Icon className={cn('h-4 w-4 flex-shrink-0', theme.text.secondary)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-medium truncate', theme.text.primary)}>
                      {attachment.name}
                    </p>
                    <p className={cn('text-xs', theme.text.tertiary)}>
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveAttachment(attachment.id)}
                    className={cn(
                      'p-1 rounded hover:bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity',
                    )}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress.size > 0 && (
        <div className={cn('p-3 border-b space-y-2', theme.border.default)}>
          {Array.from(uploadProgress.entries()).map(([fileId, progress]) => (
            <div key={fileId}>
              <div className="flex items-center justify-between mb-1">
                <span className={cn('text-xs', theme.text.secondary)}>Uploading...</span>
                <span className={cn('text-xs', theme.text.tertiary)}>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || attachments.length >= maxAttachments}
          className={cn(
            'p-2 rounded-lg transition-colors flex-shrink-0',
            isUploading || attachments.length >= maxAttachments
              ? cn(theme.surfaceHighlight, theme.text.tertiary, 'opacity-50 cursor-not-allowed')
              : cn('hover:' + theme.surfaceHighlight, theme.text.secondary),
          )}
          title="Attach file"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            rows={1}
            className={cn(
              'w-full px-4 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2',
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
              theme.primary.border,
              'scrollbar-thin',
            )}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        <button
          onClick={() => {
            // Emoji picker would go here
            alert('Emoji picker coming soon!');
          }}
          className={cn(
            'p-2 rounded-lg transition-colors flex-shrink-0 hover:' + theme.surfaceHighlight,
            theme.text.secondary,
          )}
          title="Add emoji"
        >
          <Smile className="h-5 w-5" />
        </button>

        <button
          onClick={handleSend}
          disabled={!inputText.trim() && attachments.length === 0}
          className={cn(
            'p-2 rounded-lg transition-colors flex-shrink-0',
            inputText.trim() || attachments.length > 0
              ? cn(theme.primary.bg, 'text-white hover:opacity-90')
              : cn(theme.surfaceHighlight, theme.text.tertiary, 'opacity-50 cursor-not-allowed'),
          )}
          title="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
