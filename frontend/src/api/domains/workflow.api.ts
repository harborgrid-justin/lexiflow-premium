/**
 * Workflow & Operations Domain API Services
 * Tasks, calendar, projects, workflow, risks
 */

import { TasksApiService } from '@/api';
import { CalendarApiService } from '@/api';
import { WorkflowApiService } from '@/api';
import { ProjectsApiService } from '@/api';
import { RisksApiService } from '@/api';
import { WarRoomApiService } from '@/api';

// Export service classes
export {
  TasksApiService,
  CalendarApiService,
  WorkflowApiService,
  ProjectsApiService,
  RisksApiService,
  WarRoomApiService,
};

// Export singleton instances
export const workflowApi = {
  tasks: new TasksApiService(),
  calendar: new CalendarApiService(),
  workflow: new WorkflowApiService(),
  projects: new ProjectsApiService(),
  risks: new RisksApiService(),
  warRoom: new WarRoomApiService(),
} as const;
