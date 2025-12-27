import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { MemoryMonitoringService } from '@common/services/memory-monitoring.service';
import * as v8 from 'v8';
import * as os from 'os';

/**
 * Memory Metrics Controller
 * 
 * Provides detailed memory metrics for monitoring and observability.
 * Compatible with Prometheus, Grafana, and other monitoring tools.
 */
@ApiTags('Monitoring')
@Controller('api/metrics/memory')
export class MemoryMetricsController {
  constructor(private readonly memoryMonitoring: MemoryMonitoringService) {}

  /**
   * Get current memory statistics
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get memory statistics' })
  @ApiResponse({ status: 200, description: 'Memory metrics retrieved successfully' })
  getMemoryMetrics() {
    const stats = this.memoryMonitoring.getMemoryStats();
    const health = this.memoryMonitoring.getMemoryHealth();
    
    return {
      timestamp: new Date().toISOString(),
      health: health.status,
      metrics: {
        heap: {
          sizeLimit: stats.heap.heap_size_limit,
          totalSize: stats.heap.total_heap_size,
          usedSize: stats.heap.used_heap_size,
          usedPercent: stats.usage.heapUsedPercent,
          available: stats.heap.total_available_size,
        },
        process: {
          heapTotal: stats.process.heapTotal,
          heapUsed: stats.process.heapUsed,
          rss: stats.process.rss,
          external: stats.process.external,
          arrayBuffers: stats.process.arrayBuffers,
        },
        v8: {
          mallocedMemory: stats.heap.malloced_memory,
          peakMallocedMemory: stats.heap.peak_malloced_memory,
          numberOfNativeContexts: stats.heap.number_of_native_contexts,
          numberOfDetachedContexts: stats.heap.number_of_detached_contexts,
        },
        system: {
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          usedMemory: os.totalmem() - os.freemem(),
          usedPercent: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
        },
      },
    };
  }

  /**
   * Get Prometheus-compatible metrics
   */
  @Public()
  @Get('prometheus')
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Prometheus metrics in text format',
    content: {
      'text/plain': {
        schema: { type: 'string' },
      },
    },
  })
  getPrometheusMetrics(): string {
    const stats = this.memoryMonitoring.getMemoryStats();
    const heapStats = v8.getHeapStatistics();
    const memUsage = process.memoryUsage();
    
    const metrics: string[] = [
      '# HELP nodejs_heap_size_total_bytes Total heap size',
      '# TYPE nodejs_heap_size_total_bytes gauge',
      `nodejs_heap_size_total_bytes ${heapStats.total_heap_size}`,
      '',
      '# HELP nodejs_heap_size_used_bytes Used heap size',
      '# TYPE nodejs_heap_size_used_bytes gauge',
      `nodejs_heap_size_used_bytes ${heapStats.used_heap_size}`,
      '',
      '# HELP nodejs_heap_size_limit_bytes Heap size limit',
      '# TYPE nodejs_heap_size_limit_bytes gauge',
      `nodejs_heap_size_limit_bytes ${heapStats.heap_size_limit}`,
      '',
      '# HELP nodejs_external_memory_bytes External memory',
      '# TYPE nodejs_external_memory_bytes gauge',
      `nodejs_external_memory_bytes ${memUsage.external}`,
      '',
      '# HELP process_resident_memory_bytes Resident memory',
      '# TYPE process_resident_memory_bytes gauge',
      `process_resident_memory_bytes ${memUsage.rss}`,
      '',
      '# HELP nodejs_heap_space_size_total_bytes Total heap space size',
      '# TYPE nodejs_heap_space_size_total_bytes gauge',
      `nodejs_heap_space_size_total_bytes ${heapStats.total_heap_size}`,
      '',
      '# HELP nodejs_heap_space_size_used_bytes Used heap space size',
      '# TYPE nodejs_heap_space_size_used_bytes gauge',
      `nodejs_heap_space_size_used_bytes ${heapStats.used_heap_size}`,
      '',
      '# HELP nodejs_heap_space_size_available_bytes Available heap space',
      '# TYPE nodejs_heap_space_size_available_bytes gauge',
      `nodejs_heap_space_size_available_bytes ${heapStats.total_available_size}`,
      '',
      '# HELP nodejs_memory_heap_used_percent Heap usage percentage',
      '# TYPE nodejs_memory_heap_used_percent gauge',
      `nodejs_memory_heap_used_percent ${stats.usage.heapUsedPercent}`,
      '',
      '# HELP nodejs_detached_contexts Number of detached contexts',
      '# TYPE nodejs_detached_contexts gauge',
      `nodejs_detached_contexts ${heapStats.number_of_detached_contexts}`,
      '',
      '# HELP nodejs_native_contexts Number of native contexts',
      '# TYPE nodejs_native_contexts gauge',
      `nodejs_native_contexts ${heapStats.number_of_native_contexts}`,
      '',
    ];

    return metrics.join('\n');
  }

  /**
   * Get heap spaces breakdown
   */
  @Public()
  @Get('heap-spaces')
  @ApiOperation({ summary: 'Get heap spaces breakdown' })
  @ApiResponse({ status: 200, description: 'Heap spaces retrieved successfully' })
  getHeapSpaces() {
    const spaces = v8.getHeapSpaceStatistics();
    
    return {
      timestamp: new Date().toISOString(),
      spaces: spaces.map(space => ({
        name: space.space_name,
        size: space.space_size,
        used: space.space_used_size,
        available: space.space_available_size,
        physicalSize: space.physical_space_size,
        usedPercent: (space.space_used_size / space.space_size) * 100,
      })),
    };
  }

  /**
   * Get heap code statistics
   */
  @Public()
  @Get('heap-code-stats')
  @ApiOperation({ summary: 'Get heap code statistics' })
  @ApiResponse({ status: 200, description: 'Code statistics retrieved successfully' })
  getHeapCodeStats() {
    const codeStats = v8.getHeapCodeStatistics();
    
    return {
      timestamp: new Date().toISOString(),
      codeStats: {
        codeAndMetadataSize: codeStats.code_and_metadata_size,
        bytecodeAndMetadataSize: codeStats.bytecode_and_metadata_size,
        externalScriptSourceSize: codeStats.external_script_source_size,
      },
    };
  }

  /**
   * Trigger manual garbage collection (if enabled)
   */
  @Public()
  @Get('gc')
  @ApiOperation({ summary: 'Trigger garbage collection' })
  @ApiResponse({ status: 200, description: 'GC triggered successfully' })
  @ApiResponse({ status: 503, description: 'GC not exposed' })
  triggerGarbageCollection() {
    if (!global.gc) {
      return {
        success: false,
        message: 'Garbage collection not exposed. Run with --expose-gc flag.',
      };
    }

    const before = process.memoryUsage();
    global.gc();
    const after = process.memoryUsage();

    const freedMB = (before.heapUsed - after.heapUsed) / 1024 / 1024;

    return {
      success: true,
      message: 'Garbage collection completed',
      freed: {
        bytes: before.heapUsed - after.heapUsed,
        mb: freedMB,
      },
      before: {
        heapUsed: before.heapUsed,
        rss: before.rss,
      },
      after: {
        heapUsed: after.heapUsed,
        rss: after.rss,
      },
    };
  }
}
