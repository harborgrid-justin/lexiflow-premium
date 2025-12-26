import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  getRoot() {
    return {
      name: 'LexiFlow Enterprise API',
      version: '1.0.0',
      description: 'Document Management System for Legal Professionals',
      documentation: '/api/docs',
      endpoints: {
        health: '/health',
        version: '/version',
        docs: '/api/docs',
      },
    };
  }

  async getHealth() {
    const databaseStatus = await this.checkDatabaseConnection();
    
    return {
      status: databaseStatus.connected ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      service: 'LexiFlow Enterprise API',
      version: '1.0.0',
      database: {
        status: databaseStatus.connected ? 'Connected' : 'Disconnected',
        type: 'PostgreSQL',
        isInitialized: this.dataSource.isInitialized,
      },
    };
  }

  private async checkDatabaseConnection(): Promise<{ connected: boolean }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { connected: true };
    } catch {
      return { connected: false };
    }
  }

  getVersion() {
    return {
      version: '1.0.0',
      apiVersion: 'v1',
      buildDate: new Date().toISOString(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
