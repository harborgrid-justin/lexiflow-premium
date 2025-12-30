/**
 * @module components/enterprise/notifications/ConnectionStatus
 * @category Enterprise - Notifications
 * @description Real-time WebSocket connection status indicator with animations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  AlertCircle,
  RefreshCw,
  Check,
  Activity,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type ConnectionState =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

export interface ConnectionStatusProps {
  /** Current connection state */
  state: ConnectionState;
  /** Reconnect handler */
  onReconnect?: () => void;
  /** Last connected timestamp */
  lastConnected?: Date;
  /** Show as badge or full status */
  variant?: 'badge' | 'full' | 'minimal';
  /** Position when variant is badge */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Custom className */
  className?: string;
  /** Enable animations */
  animated?: boolean;
  /** Auto-hide when connected */
  autoHide?: boolean;
  /** Latency in ms (optional) */
  latency?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  state,
  onReconnect,
  lastConnected,
  variant = 'badge',
  position = 'bottom-right',
  className,
  animated = true,
  autoHide = true,
  latency,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Auto-hide when connected after 3 seconds
  useEffect(() => {
    if (autoHide && state === 'connected' && variant === 'badge') {
      const timer = setTimeout(() => setIsExpanded(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state, autoHide, variant]);

  // Get status config
  const getStatusConfig = () => {
    switch (state) {
      case 'connected':
        return {
          icon: Wifi,
          label: 'Connected',
          color: 'text-emerald-500',
          bg: 'bg-emerald-500',
          bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
          borderColor: 'border-emerald-500',
          pulse: false,
        };
      case 'connecting':
        return {
          icon: RefreshCw,
          label: 'Connecting...',
          color: 'text-blue-500',
          bg: 'bg-blue-500',
          bgLight: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-500',
          pulse: true,
        };
      case 'reconnecting':
        return {
          icon: RefreshCw,
          label: 'Reconnecting...',
          color: 'text-amber-500',
          bg: 'bg-amber-500',
          bgLight: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-500',
          pulse: true,
        };
      case 'error':
        return {
          icon: AlertCircle,
          label: 'Connection Error',
          color: 'text-rose-500',
          bg: 'bg-rose-500',
          bgLight: 'bg-rose-50 dark:bg-rose-900/20',
          borderColor: 'border-rose-500',
          pulse: false,
        };
      default: // disconnected
        return {
          icon: WifiOff,
          label: 'Disconnected',
          color: 'text-slate-500',
          bg: 'bg-slate-500',
          bgLight: 'bg-slate-50 dark:bg-slate-900/20',
          borderColor: 'border-slate-500',
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  // Get latency color
  const getLatencyColor = () => {
    if (!latency) return 'text-slate-500';
    if (latency < 100) return 'text-emerald-500';
    if (latency < 300) return 'text-amber-500';
    return 'text-rose-500';
  };

  // Badge variant
  if (variant === 'badge') {
    // Auto-hide when connected
    if (autoHide && state === 'connected' && !isExpanded) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={cn('fixed z-50', positionClasses[position], className)}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={cn(
            'relative flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border-2 transition-all backdrop-blur-sm',
            config.borderColor,
            config.bgLight,
            'hover:shadow-xl',
            'bg-white/95 dark:bg-slate-800/95'
          )}
          aria-label={config.label}
        >
          {/* Pulse animation */}
          {animated && config.pulse && (
            <motion.span
              className={cn('absolute inset-0 rounded-full', config.bg)}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          {/* Icon */}
          <motion.div
            animate={
              animated && config.pulse
                ? {
                    rotate: [0, 360],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Icon className={cn('h-4 w-4', config.color)} />
          </motion.div>

          {/* Label (expanded) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className={cn('text-sm font-medium whitespace-nowrap', config.color)}
              >
                {config.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Status dot */}
          <span className={cn('w-2 h-2 rounded-full', config.bg)} />
        </button>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && !isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className={cn(
                'absolute mt-2 px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap',
                position.includes('bottom') ? 'bottom-full mb-2' : 'top-full mt-2',
                position.includes('right') ? 'right-0' : 'left-0',
                'bg-slate-900 dark:bg-slate-700 text-white'
              )}
            >
              {config.label}
              {latency && (
                <span className="ml-2 text-xs opacity-75">({latency}ms)</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div
        className={cn('flex items-center gap-2', className)}
        title={config.label}
      >
        <motion.div
          animate={
            animated && config.pulse
              ? {
                  rotate: [0, 360],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Icon className={cn('h-4 w-4', config.color)} />
        </motion.div>
        {latency && (
          <span className={cn('text-xs font-mono', getLatencyColor())}>
            {latency}ms
          </span>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border-2',
        config.borderColor,
        config.bgLight,
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Animated Icon */}
        <div className="relative">
          {animated && config.pulse && (
            <motion.div
              className={cn('absolute inset-0 rounded-full', config.bg)}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
          <motion.div
            className={cn('relative p-2 rounded-full', config.bgLight)}
            animate={
              animated && config.pulse
                ? {
                    rotate: [0, 360],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Icon className={cn('h-5 w-5', config.color)} />
          </motion.div>
        </div>

        {/* Status Info */}
        <div>
          <div className="flex items-center gap-2">
            <h4 className={cn('font-semibold', config.color)}>{config.label}</h4>
            {state === 'connected' && (
              <Check className="h-4 w-4 text-emerald-500" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {lastConnected && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Last connected:{' '}
                {lastConnected.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            )}
            {latency !== undefined && state === 'connected' && (
              <div className="flex items-center gap-1">
                <Activity className={cn('h-3 w-3', getLatencyColor())} />
                <span className={cn('text-xs font-mono', getLatencyColor())}>
                  {latency}ms
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reconnect Button */}
      {(state === 'disconnected' || state === 'error') && onReconnect && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReconnect}
          className={cn(
            'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
            state === 'error'
              ? 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-500'
              : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
          )}
        >
          <RefreshCw className="h-4 w-4 inline mr-2" />
          Reconnect
        </motion.button>
      )}

      {/* Connecting/Reconnecting Spinner */}
      {(state === 'connecting' || state === 'reconnecting') && (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="h-4 w-4" />
          </motion.div>
          <span>Please wait...</span>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
