import { Injectable, Logger } from '@nestjs/common';

export interface IntegrationConfig {
  [key: string]: string | number | boolean | null | undefined;
}

export interface IntegrationStatus {
  name: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  error?: string;
  config?: IntegrationConfig;
}

export interface IntegrationSettings {
  username?: string | null;
  baseUrl?: string | null;
  apiKey?: string | null;
  clientId?: string | null;
  region?: string | null;
  bucket?: string | null;
  node?: string | null;
  host?: string | null;
  port?: string | null;
}

export interface IntegrationConfigResponse {
  name: string;
  enabled: boolean;
  lastSync: Date;
  status: string;
  settings: IntegrationSettings;
}

/**
 * External API Service
 * Manages integrations with external services and provides status information
 */
/**
 * ╔=================================================================================================================╗
 * ║EXTERNALAPI                                                                                                      ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);

  /**
   * Get the status of all integrations
   */
  async getIntegrationStatus(): Promise<IntegrationStatus[]> {
    this.logger.log('Getting integration status');

    const integrations: IntegrationStatus[] = [
      {
        name: 'PACER',
        enabled: !!process.env.PACER_USERNAME,
        status: process.env.PACER_USERNAME ? 'connected' : 'disconnected',
        lastSync: new Date(),
        config: {
          baseUrl: process.env.PACER_BASE_URL,
          username: process.env.PACER_USERNAME ? '***' : null,
        },
      },
      {
        name: 'Google Calendar',
        enabled: !!process.env.GOOGLE_CALENDAR_API_KEY,
        status: process.env.GOOGLE_CALENDAR_API_KEY ? 'connected' : 'disconnected',
        config: {
          clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID ? '***' : null,
        },
      },
      {
        name: 'Outlook Calendar',
        enabled: !!process.env.OUTLOOK_CLIENT_ID,
        status: process.env.OUTLOOK_CLIENT_ID ? 'connected' : 'disconnected',
        config: {
          clientId: process.env.OUTLOOK_CLIENT_ID ? '***' : null,
        },
      },
      {
        name: 'AWS S3',
        enabled: !!process.env.AWS_ACCESS_KEY_ID,
        status: process.env.AWS_ACCESS_KEY_ID ? 'connected' : 'disconnected',
        config: {
          region: process.env.AWS_REGION,
          bucket: process.env.AWS_S3_BUCKET,
        },
      },
      {
        name: 'Elasticsearch',
        enabled: !!process.env.ELASTICSEARCH_NODE,
        status: process.env.ELASTICSEARCH_NODE ? 'connected' : 'disconnected',
        config: {
          node: process.env.ELASTICSEARCH_NODE,
        },
      },
      {
        name: 'Redis',
        enabled: !!process.env.REDIS_HOST,
        status: process.env.REDIS_HOST ? 'connected' : 'disconnected',
        config: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
        },
      },
    ];

    return integrations;
  }

  /**
   * Test connection to a specific integration
   */
  async testIntegration(integrationName: string): Promise<boolean> {
    this.logger.log(`Testing integration: ${integrationName}`);

    try {
      // Mock connection tests based on environment variables
      switch (integrationName.toLowerCase()) {
        case 'pacer':
          // Test PACER connection
          if (!process.env.PACER_USERNAME) {
            this.logger.warn('PACER_USERNAME not set');
            return false;
          }
          return true;
        case 'google_calendar':
          // Test Google Calendar connection
          if (!process.env.GOOGLE_CALENDAR_API_KEY) {
            this.logger.warn('GOOGLE_CALENDAR_API_KEY not set');
            return false;
          }
          return true;
        case 'outlook_calendar':
          // Test Outlook Calendar connection
          if (!process.env.OUTLOOK_CLIENT_ID) {
            this.logger.warn('OUTLOOK_CLIENT_ID not set');
            return false;
          }
          return true;
        case 's3':
          // Test S3 connection
          if (!process.env.AWS_ACCESS_KEY_ID) {
            this.logger.warn('AWS_ACCESS_KEY_ID not set');
            return false;
          }
          return true;
        case 'elasticsearch':
          // Test Elasticsearch connection
          if (!process.env.ELASTICSEARCH_NODE) {
            this.logger.warn('ELASTICSEARCH_NODE not set');
            return false;
          }
          return true;
        case 'redis':
          // Test Redis connection
          if (!process.env.REDIS_HOST) {
            this.logger.warn('REDIS_HOST not set');
            return false;
          }
          return true;
        default:
          this.logger.warn(`Unknown integration: ${integrationName}`);
          return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Integration test failed for ${integrationName}:`, errorMessage);
      return false;
    }
  }

  /**
   * Get integration configuration
   */
  async getIntegrationConfig(integrationName: string): Promise<IntegrationConfigResponse> {
    this.logger.log(`Getting config for integration: ${integrationName}`);

    // Mock configuration retrieval
    const config: IntegrationConfigResponse = {
      name: integrationName,
      enabled: true,
      lastSync: new Date(),
      status: 'active',
      settings: {},
    };

    switch (integrationName.toLowerCase()) {
      case 'pacer':
        config.settings = {
          username: process.env.PACER_USERNAME ? '***' : null,
          baseUrl: process.env.PACER_BASE_URL || 'https://pacer.uscourts.gov',
        };
        break;
      case 'google_calendar':
        config.settings = {
          apiKey: process.env.GOOGLE_CALENDAR_API_KEY ? '***' : null,
        };
        break;
      default:
        break;
    }

    return config;
  }
}
