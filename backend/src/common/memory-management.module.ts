/**
 * Memory Management Module
 * Central module for all memory management services
 * 
 * @module common/memory-management.module
 */

import { Module, Global } from '@nestjs/common';
import { MemoryMonitoringService } from './services/memory-monitoring.service';
import { MemoryLeakDetectorService } from './services/memory-leak-detector.service';
import { MemoryHealthIndicator } from '@health/indicators/memory.health';

@Global()
@Module({
  providers: [
    MemoryMonitoringService,
    MemoryLeakDetectorService,
    MemoryHealthIndicator,
  ],
  exports: [
    MemoryMonitoringService,
    MemoryLeakDetectorService,
    MemoryHealthIndicator,
  ],
})
export class MemoryManagementModule {}
