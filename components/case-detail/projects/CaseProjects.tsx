
import React, { useState, useEffect } from 'react';
import { Project, WorkflowTask, ProjectId, CaseId } from '../../../types';
import { Plus, Briefcase } from 'lucide-react';
import { Button } from '../../common/Button';
import { TaskCreationModal } from '../../common/TaskCreationModal';
import { ProjectList } from './ProjectList';
import { ProjectModal } from './ProjectModal';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { DataService } from '../../../services/dataService';

interface CaseProjectsProps {
  projects: Project[]; // These come from parent initially, but we will fetch internal as well
  onAddProject: (project: Project) => void; // For optimistic update in parent
  onAddTask: (projectId: string, task: WorkflowTask) => void