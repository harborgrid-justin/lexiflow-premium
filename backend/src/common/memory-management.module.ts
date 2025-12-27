/**
 * Memory Management Module
 * Central module for all memory management services
 * 
 * @module common/memory-management.module
 */

import { Module, Global } from '@nestjs/common';
import { MemoryMonitoringService } from './services/memory-monitoring.service';
import { MemoryLeakDetectorService } from './services/memory-leak-detector.service';
import { EnhancedMemoryHealthIndicator } from '@health/indicators/enhanced-memory.health';

@Global()
@Module({
  providers: [
    MemoryMonitoringService,
    MemoryLeakDetectorService,
    EnhancedMemoryHealthIndicator,
  ],
  exports: [
    MemoryMonitoringService,
    MemoryLeakDetectorService,
    EnhancedMemoryHealthIndicator,
  ],
})
export class MemoryManagementModule {}
