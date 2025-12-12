import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Start typing...',
  minHeight = 200,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { divider: true },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { divider: true },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
    { divider: true },
    { icon: Link, command: 'createLink', title: 'Insert Link' },
  ];

  const execCommand = (command: string) => {
    if (command === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) {
        document.execCommand(command, false, url);
      }
    } else {
      document.execCommand(command, false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div
        className={`border rounded-lg overflow-hidden transition-colors ${
          isFocused
            ? 'border-blue-500 ring-2 ring-blue-500'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
          {toolbarButtons.map((button, index) =>
            button.divider ? (
              <div
                key={index}
                className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"
              />
            ) : (
              <button
                key={index}
                onClick={() => execCommand(button.command!)}
                title={button.title}
                type="button"
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                {button.icon && <button.icon className="w-4 h-4 text-gray-700 dark:text-gray-300" />}
              </button>
            )
          )}
        </div>

        {/* Editor */}
        <div
          contentEditable
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          dangerouslySetInnerHTML={{ __html: value }}
          className="px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
          style={{ minHeight }}
          data-placeholder={placeholder}
        />
      </div>
    </motion.div>
  );
};

export default RichTextEditor;
