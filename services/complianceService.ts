import { apiClient } from './api/client';

const BASE_URL = '/api/v1';

// Audit Logs
export const getAuditLogs = async (params: any) => {
  const response = await apiClient.get(`${BASE_URL}/audit-logs`, { params });
  return response.data;
};

export const getAuditStatistics = async (organizationId: string) => {
  const response = await apiClient.get(`${BASE_URL}/audit-logs/statistics/${organizationId}`);
  return response.data;
};

export const exportAuditLogs = async (params: any) => {
  const response = await apiClient.get(`${BASE_URL}/audit-logs/export`, { params });
  return response.data;
};

export const getAuditLogsByEntity = async (entityType: string, entityId: string) => {
  const response = await apiClient.get(`${BASE_URL}/audit-logs/entity/${entityType}/${entityId}`);
  return response.data;
};

export const getRetentionPolicies = async () => {
  const response = await apiClient.get(`${BASE_URL}/audit-logs/retention-policies`);
  return response.data;
};

export const createRetentionPolicy = async (policy: any) => {
  const response = await apiClient.post(`${BASE_URL}/audit-logs/retention-policies`, policy);
  return response.data;
};

export const getActiveSessions = async () => {
  const response = await apiClient.get(`${BASE_URL}/audit-logs/sessions/active`);
  return response.data;
};

// Conflict Checks
export const getConflictChecks = async (params: any) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/conflicts`, { params });
  return response.data;
};

export const runConflictCheck = async (data: any) => {
  const response = await apiClient.post(`${BASE_URL}/compliance/conflicts/check`, data);
  return response.data;
};

export const runBatchConflictCheck = async (data: any) => {
  const response = await apiClient.post(`${BASE_URL}/compliance/conflicts/check/batch`, data);
  return response.data;
};

export const checkPartyConflicts = async (data: any) => {
  const response = await apiClient.post(`${BASE_URL}/compliance/conflicts/check/parties`, data);
  return response.data;
};

export const searchHistoricalConflicts = async (data: any) => {
  const response = await apiClient.post(`${BASE_URL}/compliance/conflicts/search/historical`, data);
  return response.data;
};

export const findSimilarClients = async (name: string, threshold?: number) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/conflicts/similar-clients/${name}`, {
    params: { threshold },
  });
  return response.data;
};

export const getConflictStatistics = async (organizationId: string) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/conflicts/statistics/${organizationId}`);
  return response.data;
};

export const resolveConflict = async (conflictId: string, data: any) => {
  const response = await apiClient.post(`${BASE_URL}/compliance/conflicts/${conflictId}/resolve`, data);
  return response.data;
};

export const waiveConflict = async (conflictId: string, data: any) => {
  const response = await apiClient.post(`${BASE_URL}/compliance/conflicts/${conflictId}/waive`, data);
  return response.data;
};

export const getConflictNotifications = async (userId: string) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/conflicts/notifications/${userId}`);
  return response.data;
};

export const markConflictNotificationRead = async (notificationId: string) => {
  const response = await apiClient.patch(`${BASE_URL}/compliance/conflicts/notifications/${notificationId}/read`);
  return response.data;
};

// Ethical Walls
export const getEthicalWalls = async (params: any) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/ethical-walls`, { params });
  return response.data;
};

export const getEthicalWall = async (wallId: string) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/ethical-walls/${wallId}`);
  return response.data;
};

export const createEthicalWall = async (data: any) => {
  const response = await apiClient.post(`${BASE_URL}/compliance/ethical-walls`, data);
  return response.data;
};

export const updateEthicalWall = async (wallId: string, data: any) => {
  const response = await apiClient.put(`${BASE_URL}/compliance/ethical-walls/${wallId}`, data);
  return response.data;
};

export const deleteEthicalWall = async (wallId: string) => {
  const response = await apiClient.delete(`${BASE_URL}/compliance/ethical-walls/${wallId}`);
  return response.data;
};

export const checkWallsForUser = async (userId: string) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/ethical-walls/user/${userId}`);
  return response.data;
};

export const getWallNotifications = async (userId: string) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/ethical-walls/notifications/${userId}`);
  return response.data;
};

export const markWallNotificationRead = async (notificationId: string) => {
  const response = await apiClient.patch(`${BASE_URL}/compliance/ethical-walls/notifications/${notificationId}/read`);
  return response.data;
};

export const getWallAuditTrail = async (wallId: string) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/ethical-walls/audit/${wallId}`);
  return response.data;
};

export const getAllWallAuditEntries = async (organizationId?: string) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/ethical-walls/audit`, {
    params: { organizationId },
  });
  return response.data;
};

export const getWallBreaches = async (wallId?: string) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/ethical-walls/breaches/all`, {
    params: { wallId },
  });
  return response.data;
};

export const reportWallBreach = async (data: any) => {
  const response = await apiClient.post(`${BASE_URL}/compliance/ethical-walls/breaches`, data);
  return response.data;
};

export const resolveWallBreach = async (breachId: string, resolvedBy: string) => {
  const response = await apiClient.patch(`${BASE_URL}/compliance/ethical-walls/breaches/${breachId}/resolve`, {
    resolvedBy,
  });
  return response.data;
};

export const getWallMetrics = async (organizationId: string) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/ethical-walls/metrics/organization/${organizationId}`);
  return response.data;
};

export const getWallMetricsById = async (wallId: string) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/ethical-walls/metrics/${wallId}`);
  return response.data;
};

// Compliance Reporting
export const generateAccessReport = async (params: any) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/reports/access`, { params });
  return response.data;
};

export const generateActivityReport = async (params: any) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/reports/activity`, { params });
  return response.data;
};

export const generateConflictsReport = async (params: any) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/reports/conflicts`, { params });
  return response.data;
};

export const generateEthicalWallsReport = async (params: any) => {
  const response = await apiClient.get(`${BASE_URL}/compliance/reports/ethical-walls`, { params });
  return response.data;
};

export const complianceService = {
  // Audit Logs
  getAuditLogs,
  getAuditStatistics,
  exportAuditLogs,
  getAuditLogsByEntity,
  getRetentionPolicies,
  createRetentionPolicy,
  getActiveSessions,

  // Conflict Checks
  getConflictChecks,
  runConflictCheck,
  runBatchConflictCheck,
  checkPartyConflicts,
  searchHistoricalConflicts,
  findSimilarClients,
  getConflictStatistics,
  resolveConflict,
  waiveConflict,
  getConflictNotifications,
  markConflictNotificationRead,

  // Ethical Walls
  getEthicalWalls,
  getEthicalWall,
  createEthicalWall,
  updateEthicalWall,
  deleteEthicalWall,
  checkWallsForUser,
  getWallNotifications,
  markWallNotificationRead,
  getWallAuditTrail,
  getAllWallAuditEntries,
  getWallBreaches,
  reportWallBreach,
  resolveWallBreach,
  getWallMetrics,
  getWallMetricsById,

  // Reporting
  generateAccessReport,
  generateActivityReport,
  generateConflictsReport,
  generateEthicalWallsReport,
};

export default complianceService;
