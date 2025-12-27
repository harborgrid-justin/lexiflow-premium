/**
 * Core Module Exports
 * Centralized exports for the core coordination infrastructure
 */

// Module
export * from './core.module';

// Services
export * from './services/bootstrap.service';
export * from './services/shutdown.service';
export * from './services/configuration.validator.service';

// Interfaces
export * from './interfaces/module.config.interface';

// Constants
export * from './constants/module.order.constant';

// Decorators
export * from './decorators/enterprise.decorator';
