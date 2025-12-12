import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Case Workflow Service
 * Handles REST API calls for case workflow operations
 */

export interface WorkflowInstance {
  id: string;
  workflowDefinitionId: string;
  workflowName: string;
  caseId?: string;
  documentId?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStepId?: string;
  currentStepName?: string;
  startedAt?: string;
  completedAt?: string;
  executionTimeMs?: number;
  variables?: Record<string, any>;
  completedSteps: number;
  totalSteps: number;
  executionHistory?: any[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  status: 'draft' | 'active' | 'archived';
}

export interface CaseLifecycleTransition {
  caseId: string;
  fromStatus: string;
  toStatus: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
}

export interface AttorneyAssignment {
  caseId: string;
  attorneyId: string;
  userId?: string;
}

export interface CollaborationActivity {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  activityType: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class CaseWorkflowService {
  /**
   * Get workflow instances by case ID
   */
  async getWorkflowsByCaseId(caseId: string): Promise<WorkflowInstance[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/workflows/instances/case/${caseId}`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  }

  /**
   * Get single workflow instance
   */
  async getWorkflowInstance(instanceId: string): Promise<WorkflowInstance> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/workflows/instances/${instanceId}`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow instance:', error);
      throw error;
    }
  }

  /**
   * Start a new workflow
   */
  async startWorkflow(
    workflowDefinitionId: string,
    workflowName: string,
    options: {
      caseId?: string;
      documentId?: string;
      variables?: Record<string, any>;
      priority?: number;
    },
  ): Promise<WorkflowInstance> {
    try {
      const response = await axios.post(`${API_BASE_URL}/workflows/instances/start`, {
        workflowDefinitionId,
        workflowName,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error('Error starting workflow:', error);
      throw error;
    }
  }

  /**
   * Pause workflow
   */
  async pauseWorkflow(instanceId: string): Promise<WorkflowInstance> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/workflows/instances/${instanceId}/pause`,
      );
      return response.data;
    } catch (error) {
      console.error('Error pausing workflow:', error);
      throw error;
    }
  }

  /**
   * Resume workflow
   */
  async resumeWorkflow(instanceId: string): Promise<WorkflowInstance> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/workflows/instances/${instanceId}/resume`,
      );
      return response.data;
    } catch (error) {
      console.error('Error resuming workflow:', error);
      throw error;
    }
  }

  /**
   * Cancel workflow
   */
  async cancelWorkflow(instanceId: string, reason?: string): Promise<WorkflowInstance> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/workflows/instances/${instanceId}/cancel`,
        { reason },
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling workflow:', error);
      throw error;
    }
  }

  /**
   * Complete workflow task
   */
  async completeTask(
    instanceId: string,
    taskData: Record<string, any>,
    completedBy?: string,
  ): Promise<WorkflowInstance> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/workflows/instances/${instanceId}/complete-task`,
        { taskData, completedBy },
      );
      return response.data;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  /**
   * Get available lifecycle transitions
   */
  async getAvailableTransitions(caseId: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/cases/${caseId}/lifecycle/transitions`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching transitions:', error);
      throw error;
    }
  }

  /**
   * Execute case lifecycle transition
   */
  async transitionCaseState(
    transition: CaseLifecycleTransition,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/cases/${transition.caseId}/lifecycle/transition`,
        {
          newStatus: transition.toStatus,
          userId: transition.userId,
          userName: transition.userName,
          metadata: transition.metadata,
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error transitioning case state:', error);
      throw error;
    }
  }

  /**
   * Get lifecycle statistics
   */
  async getLifecycleStats(caseId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/cases/${caseId}/lifecycle/stats`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching lifecycle stats:', error);
      throw error;
    }
  }

  /**
   * Get attorney assignment recommendations
   */
  async getAssignmentRecommendations(
    caseId: string,
    criteria: {
      caseType: string;
      jurisdiction?: string;
      practiceArea?: string;
      complexity?: 'low' | 'medium' | 'high';
    },
  ): Promise<any[]> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/cases/${caseId}/assignment/recommendations`,
        criteria,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment recommendations:', error);
      throw error;
    }
  }

  /**
   * Assign case to attorney
   */
  async assignCase(assignment: AttorneyAssignment): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/cases/${assignment.caseId}/assignment/assign`,
        {
          attorneyId: assignment.attorneyId,
          userId: assignment.userId,
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning case:', error);
      throw error;
    }
  }

  /**
   * Get case team members
   */
  async getTeamMembers(caseId: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/cases/${caseId}/collaboration/team`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }

  /**
   * Add team member
   */
  async addTeamMember(
    caseId: string,
    userId: string,
    role: string,
    addedBy: string,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/cases/${caseId}/collaboration/team/add`,
        { userId, role, addedBy },
      );
      return response.data;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  }

  /**
   * Remove team member
   */
  async removeTeamMember(
    caseId: string,
    userId: string,
    removedBy: string,
  ): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/cases/${caseId}/collaboration/team/remove`,
        { userId, removedBy },
      );
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  }

  /**
   * Get collaboration activities
   */
  async getCollaborationActivities(
    caseId: string,
    options?: {
      activityType?: string;
      userId?: string;
      limit?: number;
    },
  ): Promise<CollaborationActivity[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/cases/${caseId}/collaboration/activities`,
        { params: options },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching collaboration activities:', error);
      throw error;
    }
  }

  /**
   * Create shared note
   */
  async createNote(
    caseId: string,
    authorId: string,
    authorName: string,
    content: string,
    options?: {
      mentions?: string[];
      isPrivate?: boolean;
      visibleTo?: string[];
      tags?: string[];
    },
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/cases/${caseId}/collaboration/notes`,
        {
          authorId,
          authorName,
          content,
          ...options,
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  /**
   * Get shared notes
   */
  async getNotes(caseId: string, userId?: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/cases/${caseId}/collaboration/notes`,
        { params: { userId } },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  /**
   * Get scheduled tasks
   */
  async getScheduledTasks(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/scheduled`);
      return response.data;
    } catch (error) {
      console.error('Error fetching scheduled tasks:', error);
      throw error;
    }
  }

  /**
   * Get deadlines
   */
  async getDeadlines(options?: {
    caseId?: string;
    assigneeId?: string;
    upcoming?: number;
    overdue?: boolean;
  }): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/deadlines`, {
        params: options,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching deadlines:', error);
      throw error;
    }
  }

  /**
   * Add deadline
   */
  async addDeadline(deadline: {
    entityType: string;
    entityId: string;
    entityName: string;
    deadline: string;
    priority: string;
    assigneeId?: string;
    description?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks/deadlines`, deadline);
      return response.data;
    } catch (error) {
      console.error('Error adding deadline:', error);
      throw error;
    }
  }

  /**
   * Complete deadline
   */
  async completeDeadline(deadlineId: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/tasks/deadlines/${deadlineId}/complete`);
    } catch (error) {
      console.error('Error completing deadline:', error);
      throw error;
    }
  }
}

export default new CaseWorkflowService();
