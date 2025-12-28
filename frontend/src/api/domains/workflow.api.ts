/**
 * Workflow & Operations Domain API Services
 * Tasks, calendar, projects, workflow, risks
 */

import { TasksApiService } from '../workflow/tasks-api';
import { CalendarApiService } from '../workflow/calendar-api';
import { WorkflowApiService } from '../workflow/workflow-api';
import { ProjectsApiService } from '../workflow/projects-api';
import { RisksApiService } from '../workflow/risks-api';
import { WarRoomApiService } from '../workflow/war-room-api';

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
