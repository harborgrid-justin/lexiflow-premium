import { Module } from '@nestjs/common';
import { TaskSchedulerService } from './task-scheduler.service';
import { TaskDependencyService } from './task-dependency.service';
import { DeadlineMonitorService } from './deadline-monitor.service';

/**
 * Task Automation Module
 * Provides automated task scheduling, dependencies, and monitoring
 */
@Module({
  providers: [
    TaskSchedulerService,
    TaskDependencyService,
    DeadlineMonitorService,
  ],
  exports: [
    TaskSchedulerService,
    TaskDependencyService,
    DeadlineMonitorService,
  ],
})
export class TaskAutomationModule {}
