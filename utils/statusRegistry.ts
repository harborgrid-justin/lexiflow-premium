
/**
 * Centralized registry for status colors and variants.
 * Removes inconsistent switch/if-else logic from UI components.
 */

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const STATUS_MAP: Record<string, StatusVariant> = {
  // Success / Active
  'active': 'success',
  'online': 'success',
  'paid': 'success',
  'cleared': 'success',
  'success': 'success',
  'completed': 'success',
  'good': 'success',
  'healthy': 'success',
  'connected': 'success',
  'admitted': 'success',
  'served': 'success',
  'final': 'success',
  'verified': 'success',
  'approved': 'success',
  'retained': 'success',
  'preferred': 'success',
  
  // Warning / Pending
  'pending': 'warning',
  'away': 'warning',
  'warning': 'warning',
  'review': 'warning',
  'draft': 'warning',
  'in progress': 'warning',
  'syncing': 'warning',
  'marked': 'warning',
  'scheduled': 'warning',
  'staging': 'warning',
  'trial': 'warning',
  'at risk': 'warning',
  'challenged': 'warning',
  
  // Error / Critical
  'error': 'error',
  'offline': 'error',
  'overdue': 'error',
  'breached': 'error',
  'critical': 'error',
  'rejected': 'error',
  'disconnected': 'error',
  'failed': 'error',
  'excluded': 'error',
  'blocked': 'error',
  'revoked': 'error',
  'suspended': 'error',
  'degraded': 'error',
  'appeal': 'error', // High attention
  
  // Info
  'processing': 'info',
  'info': 'info',
  'open': 'info',
  'discovery': 'info',
  'litigation': 'info',
  'appealing': 'info',
  'out for service': 'info',
  'new lead': 'info',
};

export const StatusRegistry = {
  getVariant: (status: string | undefined): StatusVariant => {
    if (!status) return 'neutral';
    const normalized = String(status).toLowerCase().trim();
    return STATUS_MAP[normalized] || 'neutral';
  }
};
