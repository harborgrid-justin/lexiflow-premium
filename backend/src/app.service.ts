import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        APP SERVICE - ROOT APPLICATION HEALTH                                      ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                                                                   ║
 * ║  External Request                   AppController                                                                 ║
 * ║       │                                   │                                                                       ║
 * ║       │  GET /health                      │                                                                       ║
 * ║       │  GET /                            │                                                                       ║
 * ║       └───────────────────────────────────▼                                                                       ║
 * ║                                                                                                                   ║
 * ║                                      AppService                                                                   ║
 * ║                          ┌────────────────┴──────────────┐                                                        ║
 * ║                          │                               │                                                        ║
 * ║                          │ • getHealth()                 │                                                        ║
 * ║                          │ • getHello()                  │                                                        ║
 * ║                          │ • checkDatabaseHealth()       │                                                        ║
 * ║                          │                               │                                                        ║
 * ║                          └────────────────┬──────────────┘                                                        ║
 * ║                                           │                                                                       ║
 * ║                                           ▼                                                                       ║
 * ║                                  PostgreSQL DataSource                                                            ║
 * ║                                           │                                                                       ║
 * ║                                           │  Query DB Status                                                      ║
 * ║                                           ▼                                                                       ║
 * ║                                  Health Status Response                                                           ║
 * ║                                                                                                                   ║
 * ║  DATA OUT: { status: 'ok', database: 'connected', timestamp }                                                    ║
 * ║                                                                                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

/* ------------------------------------------------------------------ */
/* Application Service                                                 */
/* ------------------------------------------------------------------ */

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /* ------------------------------------------------------------------ */
  /* Root Endpoint                                                      */
  /* ------------------------------------------------------------------ */

  getRoot() {
    return {
      service: 'LexiFlow Enterprise API',
      description: 'Enterprise Document and Case Management Platform',
      version: this.getServiceVersion(),
      environment: this.getEnvironment(),
      documentation: '/api/docs',
      endpoints: {
        health: '/health',
        version: '/version',
        docs: '/api/docs',
      },
    };
  }

  /* ------------------------------------------------------------------ */
  /* Health Check                                                       */
  /* ------------------------------------------------------------------ */

  async getHealth() {
    const database = await this.checkDatabase();

    return {
      status: database.connected ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: this.getEnvironment(),
      service: 'LexiFlow Enterprise API',
      version: this.getServiceVersion(),
      components: {
        database: {
          type: 'PostgreSQL',
          connected: database.connected,
          initialized: this.dataSource.isInitialized,
        },
      },
    };
  }

  /* ------------------------------------------------------------------ */
  /* Version Information                                                */
  /* ------------------------------------------------------------------ */

  getVersion() {
    return {
      service: 'LexiFlow Enterprise API',
      version: this.getServiceVersion(),
      apiVersion: 'v1',
      buildTimestamp: this.getBuildTimestamp(),
      runtime: {
        node: process.version,
        environment: this.getEnvironment(),
      },
    };
  }

  /* ------------------------------------------------------------------ */
  /* Internal Helpers                                                   */
  /* ------------------------------------------------------------------ */

  private async checkDatabase(): Promise<{ connected: boolean }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { connected: true };
    } catch {
      return { connected: false };
    }
  }

  private getEnvironment(): string {
    return process.env.NODE_ENV ?? 'development';
  }

  private getServiceVersion(): string {
    return process.env.APP_VERSION ?? '1.0.0';
  }

  private getBuildTimestamp(): string {
    return process.env.BUILD_TIMESTAMP ?? new Date().toISOString();
  }
}
