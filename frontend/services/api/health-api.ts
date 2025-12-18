/**
 * Health API Service
 * System health checks
 */

import { apiClient } from '../infrastructure/apiClient';

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message?: string;
    responseTime?: number;
  }[];
  version?: string;
  uptime?: number;
}

export class HealthApiService {
  private readonly baseUrl = '/health';

  async check(): Promise<HealthCheck> {
    return apiClient.get<HealthCheck>(this.baseUrl);
  }

  async checkDatabase(): Promise<{ status: string; responseTime: number }> {
    return apiClient.get(`${this.baseUrl}/database`);
  }

  async checkRedis(): Promise<{ status: string; responseTime: number }> {
    return apiClient.get(`${this.baseUrl}/redis`);
  }

  async checkExternalServices(): Promise<any> {
    return apiClient.get(`${this.baseUrl}/external-services`);
  }
}
