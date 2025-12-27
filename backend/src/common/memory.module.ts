import { Module, Global } from '@nestjs/common';
import { MemoryMonitoringService } from './services/memory-monitoring.service';

/**
 * Memory Module
 * 
 * Provides enterprise memory management services across the application.
 */
@Global()
@Module({
  providers: [MemoryMonitoringService],
  exports: [MemoryMonitoringService],
})
export class MemoryModule {}
