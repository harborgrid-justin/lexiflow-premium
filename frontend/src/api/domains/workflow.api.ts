/**
 * Workflow & Operations Domain API Services
 * Tasks, calendar, projects, workflow, risks
 */

import { TasksApiService } from '../tasks-api';
import { CalendarApiService } from '../calendar-api';
import { WorkflowApiService } from '../workflow-api';
import { ProjectsApiService } from '../projects-api';
import { RisksApiService } from '../risks-api';
import { WarRoomApiService } from '../war-room-api';

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
