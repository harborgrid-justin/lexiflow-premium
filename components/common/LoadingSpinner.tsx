/**
 * LoadingSpinner Component
 * Versatile loading indicator with multiple variants and sizes
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  fullScreen = false,
  message,
  className,
}) => {
  const { theme } = useTheme();

  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-slate-600 dark:text-slate-400',
    white: 'text-white',
    gray: 'text-slate-400',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-[9999]'
    : 'flex flex-col items-center justify-center';

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <Loader2
            className={cn('animate-spin', sizeClasses[size], colorClasses[color])}
            aria-label="Loading"
          />
        );

      case 'dots':
        return (
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={cn(
                  'rounded-full animate-pulse',
                  colorClasses[color],
                  'bg-current',
                  size === 'xs' ? 'h-1 w-1' :
                  size === 'sm' ? 'h-1.5 w-1.5' :
                  size === 'md' ? 'h-2 w-2' :
                  size === 'lg' ? 'h-2.5 w-2.5' :
                  'h-3 w-3'
                )}
                style={{
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div
            className={cn(
              'rounded-full animate-pulse bg-current',
              sizeClasses[size],
              colorClasses[color]
            )}
          />
        );

      case 'bars':
        return (
          <div className="flex gap-1 items-end">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={cn(
                  'bg-current animate-pulse',
                  colorClasses[color],
                  size === 'xs' ? 'w-0.5' :
                  size === 'sm' ? 'w-1' :
                  size === 'md' ? 'w-1.5' :
                  size === 'lg' ? 'w-2' :
                  'w-2.5'
                )}
                style={{
                  height: `${((i % 2) + 1) * (size === 'xs' ? 8 : size === 'sm' ? 12 : size === 'md' ? 16 : size === 'lg' ? 20 : 24)}px`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '0.8s',
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(containerClasses, className)} role="status">
      {renderSpinner()}
      {message && (
        <p
          className={cn(
            'mt-3 text-sm font-medium',
            theme.text.secondary,
            size === 'xs' && 'text-xs mt-1',
            size === 'sm' && 'text-xs mt-2',
            size === 'lg' && 'text-base mt-4',
            size === 'xl' && 'text-lg mt-4'
          )}
        >
          {message}
        </p>
      )}
      <span className="sr-only">{message || 'Loading...'}</span>
    </div>
  );
};

// Convenience component for full-screen loading
export const FullScreenLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return <LoadingSpinner size="xl" fullScreen message={message} />;
};

// Convenience component for inline loading
export const InlineLoader: React.FC<{ size?: 'xs' | 'sm' | 'md'; message?: string }> = ({
  size = 'sm',
  message,
}) => {
  return (
    <div className="inline-flex items-center gap-2">
      <LoadingSpinner size={size} variant="spinner" />
      {message && <span className="text-sm text-slate-600 dark:text-slate-400">{message}</span>}
    </div>
  );
};

export default LoadingSpinner;
