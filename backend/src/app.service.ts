import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
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

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      service: 'LexiFlow Enterprise API',
      version: '1.0.0',
    };
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
