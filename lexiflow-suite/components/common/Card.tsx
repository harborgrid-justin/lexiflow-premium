
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  noPadding = false, 
  title, 
  subtitle,
  action,
  footer
}) => {
  return (
    <div className={`bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex flex-col transition-all duration-300 ${className}`}>
      {(title || action) && (
        <div className="border-b border-[var(--color-borderLight)] flex justify-between items-start shrink-0" style={{ padding: 'var(--spacing-cardPadding)' }}>
          <div className="min-w-0 flex-1 mr-4">
            {title && <h3 className="text-base font-semibold text-[var(--color-text)] leading-tight truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-[var(--color-textMuted)] mt-1 truncate">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 flex items-center">{action}</div>}
        </div>
      )}
      <div className={`flex-1 ${noPadding ? '' : ''}`} style={{ padding: noPadding ? 0 : 'var(--spacing-cardPadding)' }}>
        {children}
      </div>
      {footer && (
        <div className="bg-[var(--color-background)] border-t border-[var(--color-borderLight)] text-sm text-[var(--color-textMuted)] shrink-0" style={{ padding: 'var(--spacing-cardPadding)' }}>
          {footer}
        </div>
      )}
    </div>
  );
};
