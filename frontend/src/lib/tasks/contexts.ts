/**
 * Tasks Context Definitions
 * Split state/actions contexts for optimal performance
 *
 * @module lib/tasks
 */

import { createContext } from "react";

import type { TasksActionsValue, TasksStateValue } from "./types";

export const TasksStateContext = createContext<TasksStateValue | null>(null);
TasksStateContext.displayName = "TasksStateContext";

export const TasksActionsContext = createContext<TasksActionsValue | null>(
  null
);
TasksActionsContext.displayName = "TasksActionsContext";
