import { gql } from '@apollo/client';

/**
 * GraphQL Queries and Mutations for Case Workflow Operations
 */

// Workflow Instance Queries
export const GET_WORKFLOW_INSTANCES_BY_CASE = gql`
  query GetWorkflowInstancesByCase($caseId: ID!) {
    workflowInstancesByCase(caseId: $caseId) {
      id
      workflowDefinitionId
      workflowName
      status
      currentStepId
      currentStepName
      startedAt
      completedAt
      executionTimeMs
      completedSteps
      totalSteps
      variables
      executionHistory {
        stepId
        stepName
        startedAt
        completedAt
        status
        assignee
        result
        errorMessage
        duration
      }
    }
  }
`;

export const GET_WORKFLOW_INSTANCE = gql`
  query GetWorkflowInstance($instanceId: ID!) {
    workflowInstance(id: $instanceId) {
      id
      workflowDefinitionId
      workflowName
      caseId
      documentId
      status
      currentStepId
      currentStepName
      initiatedBy
      initiatedByName
      startedAt
      completedAt
      pausedAt
      executionTimeMs
      variables
      executionHistory {
        stepId
        stepName
        startedAt
        completedAt
        status
        assignee
        result
        errorMessage
        duration
        retryCount
      }
      completedSteps
      totalSteps
      priority
      dueDate
    }
  }
`;

// Workflow Instance Mutations
export const START_WORKFLOW = gql`
  mutation StartWorkflow($input: StartWorkflowInput!) {
    startWorkflow(input: $input) {
      id
      workflowName
      status
      currentStepId
      currentStepName
      startedAt
    }
  }
`;

export const PAUSE_WORKFLOW = gql`
  mutation PauseWorkflow($instanceId: ID!) {
    pauseWorkflow(instanceId: $instanceId) {
      id
      status
      pausedAt
    }
  }
`;

export const RESUME_WORKFLOW = gql`
  mutation ResumeWorkflow($instanceId: ID!) {
    resumeWorkflow(instanceId: $instanceId) {
      id
      status
      pausedAt
    }
  }
`;

export const CANCEL_WORKFLOW = gql`
  mutation CancelWorkflow($instanceId: ID!, $reason: String) {
    cancelWorkflow(instanceId: $instanceId, reason: $reason) {
      id
      status
      completedAt
      errorMessage
    }
  }
`;

export const COMPLETE_TASK = gql`
  mutation CompleteTask($instanceId: ID!, $taskData: JSON!, $completedBy: ID) {
    completeTask(instanceId: $instanceId, taskData: $taskData, completedBy: $completedBy) {
      id
      status
      currentStepId
      currentStepName
      variables
      executionHistory {
        stepId
        stepName
        status
        completedAt
      }
    }
  }
`;

// Case Lifecycle Queries
export const GET_AVAILABLE_TRANSITIONS = gql`
  query GetAvailableTransitions($caseId: ID!) {
    availableTransitions(caseId: $caseId) {
      from
      to
      label
      requiresApproval
    }
  }
`;

export const GET_LIFECYCLE_STATS = gql`
  query GetLifecycleStats($caseId: ID!) {
    lifecycleStats(caseId: $caseId) {
      currentStatus
      statusHistory {
        status
        timestamp
        duration
      }
      totalDuration
      averageTimePerStatus
    }
  }
`;

export const GET_STATE_MACHINE_DIAGRAM = gql`
  query GetStateMachineDiagram {
    stateMachineDiagram {
      nodes {
        id
        label
        color
      }
      edges {
        from
        to
        label
      }
    }
  }
`;

// Case Lifecycle Mutations
export const TRANSITION_CASE_STATE = gql`
  mutation TransitionCaseState($input: TransitionCaseStateInput!) {
    transitionCaseState(input: $input) {
      id
      status
      metadata
      updatedAt
    }
  }
`;

export const BULK_TRANSITION_CASES = gql`
  mutation BulkTransitionCases($caseIds: [ID!]!, $newStatus: String!, $userId: ID, $userName: String) {
    bulkTransitionCases(caseIds: $caseIds, newStatus: $newStatus, userId: $userId, userName: $userName) {
      succeeded
      failed {
        caseId
        reason
      }
    }
  }
`;

// Assignment Queries
export const GET_ASSIGNMENT_RECOMMENDATIONS = gql`
  query GetAssignmentRecommendations($caseId: ID!, $criteria: AssignmentCriteriaInput!) {
    assignmentRecommendations(caseId: $caseId, criteria: $criteria) {
      attorneyId
      attorneyName
      totalScore
      breakdown {
        specializationScore
        workloadScore
        experienceScore
        performanceScore
        availabilityScore
        jurisdictionScore
      }
      recommended
      reason
    }
  }
`;

export const GET_AVAILABLE_ATTORNEYS = gql`
  query GetAvailableAttorneys {
    availableAttorneys {
      id
      name
      email
      specializations
      caseLoad
      maxCaseLoad
      experienceYears
      successRate
      practiceAreas
      jurisdiction
      performance {
        averageResolutionTime
        clientSatisfaction
        winRate
      }
      availability {
        isAvailable
        nextAvailableDate
      }
    }
  }
`;

export const GET_ASSIGNMENT_ANALYTICS = gql`
  query GetAssignmentAnalytics($attorneyId: ID!) {
    assignmentAnalytics(attorneyId: $attorneyId) {
      totalCases
      activeCases
      casesByType
      averageResolutionTime
      workloadPercentage
    }
  }
`;

// Assignment Mutations
export const ASSIGN_CASE = gql`
  mutation AssignCase($caseId: ID!, $attorneyId: ID!, $userId: ID) {
    assignCase(caseId: $caseId, attorneyId: $attorneyId, userId: $userId) {
      id
      leadAttorneyId
      metadata
    }
  }
`;

export const BATCH_ASSIGN_CASES = gql`
  mutation BatchAssignCases($assignments: [CaseAssignmentInput!]!, $userId: ID) {
    batchAssignCases(assignments: $assignments, userId: $userId) {
      succeeded
      failed {
        caseId
        reason
      }
    }
  }
`;

// Collaboration Queries
export const GET_TEAM_MEMBERS = gql`
  query GetTeamMembers($caseId: ID!) {
    teamMembers(caseId: $caseId) {
      id
      userId
      name
      email
      role
      permissions
      joinedAt
      isActive
      contribution {
        tasksCompleted
        documentsUploaded
        notesAdded
        hoursLogged
      }
    }
  }
`;

export const GET_COLLABORATION_ACTIVITIES = gql`
  query GetCollaborationActivities($caseId: ID!, $activityType: String, $userId: ID, $limit: Int) {
    collaborationActivities(caseId: $caseId, activityType: $activityType, userId: $userId, limit: $limit) {
      id
      caseId
      userId
      userName
      activityType
      description
      timestamp
      metadata
    }
  }
`;

export const GET_SHARED_NOTES = gql`
  query GetSharedNotes($caseId: ID!, $userId: ID) {
    sharedNotes(caseId: $caseId, userId: $userId) {
      id
      caseId
      authorId
      authorName
      content
      mentions
      attachments
      isPrivate
      visibleTo
      tags
      createdAt
      updatedAt
      replies {
        id
        authorId
        authorName
        content
        createdAt
      }
    }
  }
`;

export const GET_COLLABORATION_STATS = gql`
  query GetCollaborationStats($caseId: ID!) {
    collaborationStats(caseId: $caseId) {
      totalMembers
      activeMembers
      membersByRole
      totalActivities
      activitiesByType
      totalNotes
      recentActivity
    }
  }
`;

// Collaboration Mutations
export const ADD_TEAM_MEMBER = gql`
  mutation AddTeamMember($caseId: ID!, $userId: ID!, $role: String!, $addedBy: ID!) {
    addTeamMember(caseId: $caseId, userId: $userId, role: $role, addedBy: $addedBy) {
      id
      userId
      name
      email
      role
      permissions
      joinedAt
      isActive
    }
  }
`;

export const REMOVE_TEAM_MEMBER = gql`
  mutation RemoveTeamMember($caseId: ID!, $userId: ID!, $removedBy: ID!) {
    removeTeamMember(caseId: $caseId, userId: $userId, removedBy: $removedBy)
  }
`;

export const UPDATE_MEMBER_ROLE = gql`
  mutation UpdateMemberRole($caseId: ID!, $userId: ID!, $newRole: String!, $updatedBy: ID!) {
    updateMemberRole(caseId: $caseId, userId: $userId, newRole: $newRole, updatedBy: $updatedBy) {
      id
      userId
      role
      permissions
    }
  }
`;

export const CREATE_SHARED_NOTE = gql`
  mutation CreateSharedNote($input: CreateSharedNoteInput!) {
    createSharedNote(input: $input) {
      id
      caseId
      authorId
      authorName
      content
      mentions
      attachments
      isPrivate
      visibleTo
      tags
      createdAt
    }
  }
`;

export const INITIATE_CASE_HANDOFF = gql`
  mutation InitiateCaseHandoff($input: InitiateCaseHandoffInput!) {
    initiateCaseHandoff(input: $input) {
      id
      caseId
      fromUserId
      fromUserName
      toUserId
      toUserName
      reason
      status
      handoffNotes
      checklistItems {
        item
        completed
      }
      createdAt
    }
  }
`;

// Task Automation Queries
export const GET_SCHEDULED_TASKS = gql`
  query GetScheduledTasks {
    scheduledTasks {
      id
      name
      description
      schedule {
        type
        cronExpression
        intervalMs
      }
      action {
        type
        config
      }
      enabled
      lastRun
      nextRun
      runCount
      failureCount
    }
  }
`;

export const GET_TASK_DEPENDENCIES = gql`
  query GetTaskDependencies($taskId: ID!) {
    taskDependencies(taskId: $taskId) {
      id
      name
      status
      dependencies
      dependents
      isBlocked
      blockingTasks {
        id
        name
        status
      }
    }
  }
`;

export const GET_DEADLINES = gql`
  query GetDeadlines($caseId: ID, $assigneeId: ID, $upcoming: Int, $overdue: Boolean) {
    deadlines(caseId: $caseId, assigneeId: $assigneeId, upcoming: $upcoming, overdue: $overdue) {
      id
      entityType
      entityId
      entityName
      deadline
      priority
      status
      assigneeId
      assigneeName
      description
      remindersSent
      lastReminderSent
    }
  }
`;

export const GET_DEADLINE_STATS = gql`
  query GetDeadlineStats {
    deadlineStats {
      total
      upcoming
      dueSoon
      overdue
      completed
      byPriority
      byEntityType
    }
  }
`;

// Task Automation Mutations
export const ADD_DEADLINE = gql`
  mutation AddDeadline($input: AddDeadlineInput!) {
    addDeadline(input: $input) {
      id
      entityType
      entityId
      entityName
      deadline
      priority
      status
      assigneeId
      description
    }
  }
`;

export const COMPLETE_DEADLINE = gql`
  mutation CompleteDeadline($deadlineId: ID!) {
    completeDeadline(deadlineId: $deadlineId) {
      id
      status
    }
  }
`;

export const REGISTER_SCHEDULED_TASK = gql`
  mutation RegisterScheduledTask($input: RegisterScheduledTaskInput!) {
    registerScheduledTask(input: $input) {
      id
      name
      enabled
      schedule {
        type
        intervalMs
      }
    }
  }
`;

// Type Definitions for TypeScript
export interface StartWorkflowInput {
  workflowDefinitionId: string;
  workflowName: string;
  caseId?: string;
  documentId?: string;
  variables?: Record<string, any>;
  priority?: number;
}

export interface TransitionCaseStateInput {
  caseId: string;
  newStatus: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
}

export interface AssignmentCriteriaInput {
  caseType: string;
  jurisdiction?: string;
  practiceArea?: string;
  complexity?: 'low' | 'medium' | 'high';
  urgency?: 'low' | 'medium' | 'high';
  requiredExperience?: number;
}

export interface CreateSharedNoteInput {
  caseId: string;
  authorId: string;
  authorName: string;
  content: string;
  mentions?: string[];
  attachments?: string[];
  isPrivate?: boolean;
  visibleTo?: string[];
  tags?: string[];
}

export interface InitiateCaseHandoffInput {
  caseId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  reason: string;
  handoffNotes: string;
  checklistItems: string[];
}

export interface AddDeadlineInput {
  entityType: 'case' | 'task' | 'document' | 'motion' | 'hearing';
  entityId: string;
  entityName: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: string;
  description?: string;
}
