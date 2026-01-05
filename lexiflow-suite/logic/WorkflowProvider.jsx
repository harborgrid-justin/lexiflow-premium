
import React, { useState } from "react";
import { WorkflowContext } from "./WorkflowContext.js";
import { MOCK_STAGES, MOCK_TASKS } from "../data/mockWorkflow.ts";

export const WorkflowProvider = ({ children }) => {
  const [stages, setStages] = useState(MOCK_STAGES);
  const [tasks, setTasks] = useState(MOCK_TASKS);

  const completeTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'Done' } : t));
  };

  const addStage = (stage) => {
    setStages(prev => [...prev, stage]);
  };

  const value = {
    stages,
    tasks,
    completeTask,
    addStage
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};
