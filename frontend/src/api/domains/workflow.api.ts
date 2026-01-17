/**
 * Workflow & Operations Domain API Services
 * Tasks, calendar, projects, workflow, risks
 */

import { CalendarApiService } from '../workflow/calendar-api';
import { ProjectsApiService } from '../workflow/projects-api';
import { RisksApiService } from '../workflow/risk-assessments-api';
import { TasksApiService } from '../workflow/tasks-api';
import { WarRoomApiService } from '../workflow/war-room-api';
import { WorkflowApiService } from '../workflow/workflow-api';

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
