/**
 * Memory Management Controller
 * Production endpoints for memory monitoring and management
 *
 * @module monitoring/memory-management.controller
 */

import {
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  Query,
  Body,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { Roles } from "@common/decorators/roles.decorator";
import { RolesGuard } from "@common/guards/roles.guard";
import {
  getMemoryStats,
  checkMemoryThresholds,
  forceGarbageCollection,
  MemoryStats,
  MemoryThresholds,
  DEFAULT_MEMORY_THRESHOLDS,
} from "@common/utils/memory-management.utils";
import {
  MemoryLeakDetectorService,
  MemoryLeak,
  HeapSnapshot as MemorySnapshot,
} from "@common/services/memory-leak-detector.service";
import * as v8 from "v8";

// Local interfaces removed in favor of service types
export type MemoryLeakStatistics = any;

export interface MemorySnapshot {
  timestamp: Date;
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
  externalMB: number;
}

export interface LeakDetectorConfig {
  enabled?: boolean;
  checkIntervalMs?: number;
  heapGrowthThresholdMB?: number;
  autoGcOnLeak?: boolean;
}

@ApiTags("Memory Management")
@Controller("api/monitoring/memory")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MemoryManagementController {
  constructor(private readonly leakDetector: MemoryLeakDetectorService) {}

  @Get("stats")
  @Roles("admin", "developer")
  @ApiOperation({ summary: "Get current memory statistics" })
  @ApiResponse({ status: 200, description: "Memory statistics retrieved" })
  getStats(): {
    stats: MemoryStats;
    timestamp: number;
    uptime: number;
  } {
    return {
      stats: getMemoryStats(),
      timestamp: Date.now(),
      uptime: process.uptime(),
    };
  }

  @Get("health")
  @ApiOperation({ summary: "Check memory health status" })
  @ApiResponse({ status: 200, description: "Memory health status" })
  checkHealth(
    @Query("warningPercent") warningPercent?: number,
    @Query("criticalPercent") criticalPercent?: number
  ): {
    status: "ok" | "warning" | "critical";
    stats: MemoryStats;
    thresholds: MemoryThresholds;
    recommendations: string[];
  } {
    const thresholds: MemoryThresholds = {
      ...DEFAULT_MEMORY_THRESHOLDS,
      ...(warningPercent && { warningPercent: Number(warningPercent) }),
      ...(criticalPercent && { criticalPercent: Number(criticalPercent) }),
    };

    const { status, stats } = checkMemoryThresholds(thresholds);
    const recommendations: string[] = [];

    if (status === "critical") {
      recommendations.push("Immediate action required: Memory usage critical");
      recommendations.push(
        "Consider restarting service or scaling horizontally"
      );
      recommendations.push("Trigger garbage collection");
      recommendations.push("Review recent memory leak reports");
    } else if (status === "warning") {
      recommendations.push("Monitor closely: Memory usage elevated");
      recommendations.push("Review cache sizes and data retention policies");
      recommendations.push("Consider optimizing queries or batch sizes");
    }

    return {
      status,
      stats,
      thresholds,
      recommendations,
    };
  }

  @Get("heap-statistics")
  @Roles("admin", "developer")
  @ApiOperation({ summary: "Get V8 heap statistics" })
  @ApiResponse({ status: 200, description: "Heap statistics retrieved" })
  getHeapStatistics(): {
    heapStatistics: v8.HeapInfo;
    heapSpaces: v8.HeapSpaceInfo[];
    heapCodeStatistics: v8.HeapCodeStatistics;
  } {
    return {
      heapStatistics: v8.getHeapStatistics(),
      heapSpaces: v8.getHeapSpaceStatistics(),
      heapCodeStatistics: v8.getHeapCodeStatistics(),
    };
  }

  @Post("gc")
  @Roles("admin")
  @HttpCode(200)
  @ApiOperation({
    summary: "Force garbage collection (requires --expose-gc flag)",
  })
  @ApiResponse({ status: 200, description: "Garbage collection triggered" })
  @ApiResponse({ status: 503, description: "GC not available" })
  forceGC(): {
    success: boolean;
    message: string;
    beforeStats?: MemoryStats;
    afterStats?: MemoryStats;
    freedMB?: number;
  } {
    const beforeStats = getMemoryStats();
    const success = forceGarbageCollection();

    if (!success) {
      return {
        success: false,
        message:
          "Garbage collection not available. Start Node with --expose-gc flag.",
      };
    }

    // Wait a bit for GC to complete
    const afterStats = getMemoryStats();
    const freedMB = beforeStats.heapUsedMB - afterStats.heapUsedMB;

    return {
      success: true,
      message: "Garbage collection completed",
      beforeStats,
      afterStats,
      freedMB,
    };
  }

  @Get("leaks")
  @Roles("admin", "developer")
  @ApiOperation({ summary: "Get detected memory leaks" })
  @ApiResponse({ status: 200, description: "Memory leak report" })
  getLeaks(@Query("limit") limit?: number): {
    recentLeaks: MemoryLeak[];
    statistics: MemoryLeakStatistics;
    snapshots: number;
  } {
    const leakLimit = limit ? Number(limit) : 10;

    return {
      recentLeaks: this.leakDetector.getRecentLeaks(leakLimit) as MemoryLeak[],
      statistics: this.leakDetector.getStatistics() as MemoryLeakStatistics,
      snapshots: this.leakDetector.getSnapshots().length,
    };
  }

  @Post("leaks/check")
  @Roles("admin", "developer")
  @HttpCode(200)
  @ApiOperation({ summary: "Trigger manual leak detection check" })
  @ApiResponse({ status: 200, description: "Leak check completed" })
  async checkLeaks(): Promise<{
    leaksDetected: number;
    leaks: MemoryLeak[];
    timestamp: number;
  }> {
    const leaks = await this.leakDetector.checkForLeaks();

    return {
      leaksDetected: leaks.length,
      leaks: leaks as MemoryLeak[],
      timestamp: Date.now(),
    };
  }

  @Post("leaks/snapshot")
  @Roles("admin", "developer")
  @HttpCode(200)
  @ApiOperation({ summary: "Take memory snapshot" })
  @ApiResponse({ status: 200, description: "Snapshot taken" })
  takeSnapshot(): {
    snapshot: MemorySnapshot;
    message: string;
  } {
    const snapshot = this.leakDetector.takeSnapshot();

    return {
      snapshot: snapshot as MemorySnapshot,
      message: "Memory snapshot taken",
    };
  }

  @Post("leaks/clear-history")
  @Roles("admin")
  @HttpCode(200)
  @ApiOperation({ summary: "Clear leak detection history" })
  @ApiResponse({ status: 200, description: "History cleared" })
  clearLeakHistory(): {
    success: boolean;
    message: string;
  } {
    this.leakDetector.clearHistory();

    return {
      success: true,
      message: "Leak detection history cleared",
    };
  }

  @Post("leaks/configure")
  @Roles("admin")
  @HttpCode(200)
  @ApiOperation({ summary: "Configure leak detector" })
  @ApiResponse({ status: 200, description: "Configuration updated" })
  configureLeakDetector(@Body() config: LeakDetectorConfig): {
    success: boolean;
    message: string;
    config: LeakDetectorConfig;
  } {
    this.leakDetector.configure(config);

    return {
      success: true,
      message: "Leak detector configuration updated",
      config,
    };
  }

  @Get("process-info")
  @Roles("admin", "developer")
  @ApiOperation({ summary: "Get process information" })
  @ApiResponse({ status: 200, description: "Process info retrieved" })
  getProcessInfo(): {
    pid: number;
    uptime: number;
    nodeVersion: string;
    platform: string;
    arch: string;
    cpuUsage: NodeJS.CpuUsage;
    resourceUsage: NodeJS.ResourceUsage;
  } {
    return {
      pid: process.pid,
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuUsage: process.cpuUsage(),
      resourceUsage: process.resourceUsage(),
    };
  }
}
