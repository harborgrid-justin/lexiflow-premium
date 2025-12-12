import React, { useEffect, useRef, useState } from 'react';

export interface CursorPosition {
  userId: string;
  userName: string;
  userColor: string;
  position: {
    x: number;
    y: number;
    line?: number;
    column?: number;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  timestamp: Date;
  isIdle?: boolean;
}

export interface LiveCursorsProps {
  cursors: CursorPosition[];
  containerRef?: React.RefObject<HTMLElement>;
  showLabels?: boolean;
  showSelection?: boolean;
  fadeTimeout?: number; // milliseconds
  className?: string;
}

export const LiveCursors: React.FC<LiveCursorsProps> = ({
  cursors,
  containerRef,
  showLabels = true,
  showSelection = true,
  fadeTimeout = 3000,
  className = '',
}) => {
  const [visibleCursors, setVisibleCursors] = useState<CursorPosition[]>([]);

  useEffect(() => {
    // Filter out idle cursors after timeout
    const now = Date.now();
    const active = cursors.filter((cursor) => {
      if (cursor.isIdle) return false;
      const age = now - cursor.timestamp.getTime();
      return age < fadeTimeout;
    });

    setVisibleCursors(active);

    // Cleanup old cursors periodically
    const interval = setInterval(() => {
      const currentTime = Date.now();
      setVisibleCursors((prev) =>
        prev.filter((c) => currentTime - c.timestamp.getTime() < fadeTimeout),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [cursors, fadeTimeout]);

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      {visibleCursors.map((cursor) => (
        <Cursor
          key={cursor.userId}
          cursor={cursor}
          showLabel={showLabels}
          showSelection={showSelection}
        />
      ))}
    </div>
  );
};

interface CursorProps {
  cursor: CursorPosition;
  showLabel: boolean;
  showSelection: boolean;
}

const Cursor: React.FC<CursorProps> = ({ cursor, showLabel, showSelection }) => {
  const { position, userName, userColor, selection } = cursor;

  return (
    <>
      {/* Selection highlight */}
      {showSelection && selection && (
        <SelectionHighlight
          start={selection.start}
          end={selection.end}
          color={userColor}
        />
      )}

      {/* Cursor */}
      <div
        className="absolute transition-all duration-150 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000,
        }}
      >
        {/* Cursor pointer */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="drop-shadow-lg"
        >
          <path
            d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
            fill={userColor}
            stroke="white"
            strokeWidth="1"
          />
        </svg>

        {/* User label */}
        {showLabel && (
          <div
            className="absolute left-6 -top-1 whitespace-nowrap px-2 py-1 rounded text-xs font-medium text-white shadow-lg animate-fade-in"
            style={{
              backgroundColor: userColor,
            }}
          >
            {userName}
          </div>
        )}
      </div>
    </>
  );
};

interface SelectionHighlightProps {
  start: { line: number; column: number };
  end: { line: number; column: number };
  color: string;
}

const SelectionHighlight: React.FC<SelectionHighlightProps> = ({
  start,
  end,
  color,
}) => {
  // This is a simplified version
  // In a real implementation, this would calculate the actual DOM positions
  return (
    <div
      className="absolute opacity-20"
      style={{
        backgroundColor: color,
        // Positions would be calculated based on line/column
      }}
    />
  );
};

// Component for cursor in code editor context
export interface EditorCursorProps {
  cursors: CursorPosition[];
  editorRef?: React.RefObject<HTMLElement>;
  lineHeight?: number;
  charWidth?: number;
}

export const EditorCursors: React.FC<EditorCursorProps> = ({
  cursors,
  editorRef,
  lineHeight = 20,
  charWidth = 8,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {cursors.map((cursor) => {
        if (!cursor.position.line || cursor.position.column === undefined) {
          return null;
        }

        const x = cursor.position.column * charWidth;
        const y = cursor.position.line * lineHeight;

        return (
          <div
            key={cursor.userId}
            className="absolute"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              zIndex: 100,
            }}
          >
            {/* Cursor line */}
            <div
              className="w-0.5 animate-pulse"
              style={{
                height: `${lineHeight}px`,
                backgroundColor: cursor.userColor,
              }}
            />

            {/* User badge */}
            <div
              className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap shadow-sm"
              style={{
                backgroundColor: cursor.userColor,
              }}
            >
              {cursor.userName}
            </div>

            {/* Selection highlight */}
            {cursor.selection && (
              <EditorSelection
                start={cursor.selection.start}
                end={cursor.selection.end}
                color={cursor.userColor}
                lineHeight={lineHeight}
                charWidth={charWidth}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

interface EditorSelectionProps {
  start: { line: number; column: number };
  end: { line: number; column: number };
  color: string;
  lineHeight: number;
  charWidth: number;
}

const EditorSelection: React.FC<EditorSelectionProps> = ({
  start,
  end,
  color,
  lineHeight,
  charWidth,
}) => {
  // Simple single-line selection
  if (start.line === end.line) {
    const x = start.column * charWidth;
    const y = start.line * lineHeight;
    const width = (end.column - start.column) * charWidth;

    return (
      <div
        className="absolute opacity-30"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${lineHeight}px`,
          backgroundColor: color,
        }}
      />
    );
  }

  // Multi-line selection (simplified)
  return (
    <div className="absolute opacity-30" style={{ backgroundColor: color }}>
      {/* Would render multiple rectangles for multi-line selections */}
    </div>
  );
};

// Mini cursor indicator for presence in document
export interface CursorIndicatorProps {
  userName: string;
  userColor: string;
  position?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const CursorIndicator: React.FC<CursorIndicatorProps> = ({
  userName,
  userColor,
  position,
  isActive = true,
  onClick,
}) => {
  return (
    <div
      className={`
        flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
        ${isActive ? 'opacity-100' : 'opacity-50'}
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        transition-all
      `}
      style={{
        backgroundColor: `${userColor}20`,
        color: userColor,
        borderLeft: `3px solid ${userColor}`,
      }}
      onClick={onClick}
    >
      <div
        className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: userColor }}
      />
      <span>{userName}</span>
      {position && (
        <span className="text-xs opacity-75">• {position}</span>
      )}
    </div>
  );
};

// List of active cursors/collaborators
export interface CursorListProps {
  cursors: CursorPosition[];
  onCursorClick?: (userId: string) => void;
  maxDisplay?: number;
}

export const CursorList: React.FC<CursorListProps> = ({
  cursors,
  onCursorClick,
  maxDisplay = 5,
}) => {
  const activeCursors = cursors.filter((c) => !c.isIdle);
  const displayCursors = activeCursors.slice(0, maxDisplay);
  const remaining = Math.max(0, activeCursors.length - maxDisplay);

  if (cursors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {displayCursors.map((cursor) => (
        <CursorIndicator
          key={cursor.userId}
          userName={cursor.userName}
          userColor={cursor.userColor}
          position={
            cursor.position.line !== undefined
              ? `L${cursor.position.line}:${cursor.position.column}`
              : undefined
          }
          isActive={!cursor.isIdle}
          onClick={() => onCursorClick?.(cursor.userId)}
        />
      ))}
      {remaining > 0 && (
        <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          +{remaining} more
        </div>
      )}
    </div>
  );
};

export default LiveCursors;
