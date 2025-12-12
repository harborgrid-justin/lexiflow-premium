import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './entities/case.entity';

/**
 * Team member with role and permissions
 */
export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: TeamRole;
  permissions: Permission[];
  joinedAt: Date;
  isActive: boolean;
  contribution?: {
    tasksCompleted: number;
    documentsUploaded: number;
    notesAdded: number;
    hoursLogged: number;
  };
}

export enum TeamRole {
  LEAD_ATTORNEY = 'Lead Attorney',
  ASSOCIATE_ATTORNEY = 'Associate Attorney',
  PARALEGAL = 'Paralegal',
  LEGAL_ASSISTANT = 'Legal Assistant',
  EXPERT_WITNESS = 'Expert Witness',
  CONSULTANT = 'Consultant',
  INVESTIGATOR = 'Investigator',
}

export enum Permission {
  VIEW_CASE = 'view_case',
  EDIT_CASE = 'edit_case',
  DELETE_CASE = 'delete_case',
  MANAGE_TEAM = 'manage_team',
  UPLOAD_DOCUMENTS = 'upload_documents',
  VIEW_BILLING = 'view_billing',
  EDIT_BILLING = 'edit_billing',
  APPROVE_ACTIONS = 'approve_actions',
  VIEW_SENSITIVE_INFO = 'view_sensitive_info',
  EDIT_TIMELINE = 'edit_timeline',
  MANAGE_TASKS = 'manage_tasks',
  COMMUNICATE_CLIENT = 'communicate_client',
}

/**
 * Collaboration activity tracking
 */
export interface CollaborationActivity {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  activityType: ActivityType;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export enum ActivityType {
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  ROLE_CHANGED = 'role_changed',
  DOCUMENT_SHARED = 'document_shared',
  COMMENT_ADDED = 'comment_added',
  TASK_ASSIGNED = 'task_assigned',
  NOTE_SHARED = 'note_shared',
  MEETING_SCHEDULED = 'meeting_scheduled',
  DECISION_MADE = 'decision_made',
  FILE_ACCESSED = 'file_accessed',
}

/**
 * Shared note/comment
 */
export interface SharedNote {
  id: string;
  caseId: string;
  authorId: string;
  authorName: string;
  content: string;
  mentions: string[]; // User IDs mentioned
  attachments?: string[];
  isPrivate: boolean;
  visibleTo?: string[]; // User IDs if private
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  replies?: SharedNote[];
}

/**
 * Case handoff information
 */
export interface CaseHandoff {
  id: string;
  caseId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  handoffNotes: string;
  checklistItems: Array<{ item: string; completed: boolean }>;
  scheduledDate?: Date;
  completedDate?: Date;
  createdAt: Date;
}

/**
 * Multi-Attorney Case Collaboration Service
 */
@Injectable()
export class CaseCollaborationService {
  private readonly logger = new Logger(CaseCollaborationService.name);

  // Role-based permission matrix
  private readonly rolePermissions: Record<TeamRole, Permission[]> = {
    [TeamRole.LEAD_ATTORNEY]: [
      Permission.VIEW_CASE,
      Permission.EDIT_CASE,
      Permission.DELETE_CASE,
      Permission.MANAGE_TEAM,
      Permission.UPLOAD_DOCUMENTS,
      Permission.VIEW_BILLING,
      Permission.EDIT_BILLING,
      Permission.APPROVE_ACTIONS,
      Permission.VIEW_SENSITIVE_INFO,
      Permission.EDIT_TIMELINE,
      Permission.MANAGE_TASKS,
      Permission.COMMUNICATE_CLIENT,
    ],
    [TeamRole.ASSOCIATE_ATTORNEY]: [
      Permission.VIEW_CASE,
      Permission.EDIT_CASE,
      Permission.UPLOAD_DOCUMENTS,
      Permission.VIEW_BILLING,
      Permission.VIEW_SENSITIVE_INFO,
      Permission.EDIT_TIMELINE,
      Permission.MANAGE_TASKS,
      Permission.COMMUNICATE_CLIENT,
    ],
    [TeamRole.PARALEGAL]: [
      Permission.VIEW_CASE,
      Permission.UPLOAD_DOCUMENTS,
      Permission.VIEW_BILLING,
      Permission.EDIT_TIMELINE,
      Permission.MANAGE_TASKS,
    ],
    [TeamRole.LEGAL_ASSISTANT]: [
      Permission.VIEW_CASE,
      Permission.UPLOAD_DOCUMENTS,
      Permission.MANAGE_TASKS,
    ],
    [TeamRole.EXPERT_WITNESS]: [Permission.VIEW_CASE],
    [TeamRole.CONSULTANT]: [Permission.VIEW_CASE, Permission.UPLOAD_DOCUMENTS],
    [TeamRole.INVESTIGATOR]: [
      Permission.VIEW_CASE,
      Permission.UPLOAD_DOCUMENTS,
      Permission.VIEW_SENSITIVE_INFO,
    ],
  };

  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
  ) {}

  /**
   * Add team member to case
   */
  async addTeamMember(
    caseId: string,
    userId: string,
    role: TeamRole,
    addedBy: string,
  ): Promise<TeamMember> {
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseData) {
      throw new BadRequestException('Case not found');
    }

    // Check if user already in team
    const team = (caseData.metadata?.team || []) as TeamMember[];
    if (team.some((m) => m.userId === userId)) {
      throw new BadRequestException('User already in team');
    }

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      userId,
      name: '', // Would be populated from user service
      email: '',
      role,
      permissions: this.rolePermissions[role],
      joinedAt: new Date(),
      isActive: true,
    };

    team.push(newMember);

    caseData.metadata = {
      ...caseData.metadata,
      team,
    };

    await this.caseRepository.save(caseData);

    this.logger.log(
      `User ${userId} added to case ${caseId} as ${role} by ${addedBy}`,
    );

    return newMember;
  }

  /**
   * Remove team member from case
   */
  async removeTeamMember(
    caseId: string,
    userId: string,
    removedBy: string,
  ): Promise<void> {
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseData) {
      throw new BadRequestException('Case not found');
    }

    const team = (caseData.metadata?.team || []) as TeamMember[];
    const updatedTeam = team.filter((m) => m.userId !== userId);

    if (team.length === updatedTeam.length) {
      throw new BadRequestException('User not found in team');
    }

    caseData.metadata = {
      ...caseData.metadata,
      team: updatedTeam,
    };

    await this.caseRepository.save(caseData);

    this.logger.log(`User ${userId} removed from case ${caseId} by ${removedBy}`);
  }

  /**
   * Update team member role
   */
  async updateMemberRole(
    caseId: string,
    userId: string,
    newRole: TeamRole,
    updatedBy: string,
  ): Promise<TeamMember> {
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseData) {
      throw new BadRequestException('Case not found');
    }

    const team = (caseData.metadata?.team || []) as TeamMember[];
    const member = team.find((m) => m.userId === userId);

    if (!member) {
      throw new BadRequestException('User not found in team');
    }

    member.role = newRole;
    member.permissions = this.rolePermissions[newRole];

    caseData.metadata = {
      ...caseData.metadata,
      team,
    };

    await this.caseRepository.save(caseData);

    this.logger.log(
      `User ${userId} role updated to ${newRole} in case ${caseId} by ${updatedBy}`,
    );

    return member;
  }

  /**
   * Get team members for a case
   */
  async getTeamMembers(caseId: string): Promise<TeamMember[]> {
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseData) {
      throw new BadRequestException('Case not found');
    }

    return (caseData.metadata?.team || []) as TeamMember[];
  }

  /**
   * Check if user has permission
   */
  async checkPermission(
    caseId: string,
    userId: string,
    permission: Permission,
  ): Promise<boolean> {
    const team = await this.getTeamMembers(caseId);
    const member = team.find((m) => m.userId === userId && m.isActive);

    if (!member) {
      return false;
    }

    return member.permissions.includes(permission);
  }

  /**
   * Log collaboration activity
   */
  async logActivity(
    caseId: string,
    userId: string,
    userName: string,
    activityType: ActivityType,
    description: string,
    metadata?: Record<string, any>,
  ): Promise<CollaborationActivity> {
    const activity: CollaborationActivity = {
      id: `activity-${Date.now()}`,
      caseId,
      userId,
      userName,
      activityType,
      description,
      timestamp: new Date(),
      metadata,
    };

    // Store in case metadata
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (caseData) {
      const activities = (caseData.metadata?.activities || []) as CollaborationActivity[];
      activities.push(activity);

      // Keep only last 100 activities
      if (activities.length > 100) {
        activities.shift();
      }

      caseData.metadata = {
        ...caseData.metadata,
        activities,
      };

      await this.caseRepository.save(caseData);
    }

    return activity;
  }

  /**
   * Get collaboration activities
   */
  async getActivities(
    caseId: string,
    options?: {
      activityType?: ActivityType;
      userId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<CollaborationActivity[]> {
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseData) {
      throw new BadRequestException('Case not found');
    }

    let activities = (caseData.metadata?.activities || []) as CollaborationActivity[];

    // Filter by activity type
    if (options?.activityType) {
      activities = activities.filter((a) => a.activityType === options.activityType);
    }

    // Filter by user
    if (options?.userId) {
      activities = activities.filter((a) => a.userId === options.userId);
    }

    // Sort by timestamp descending
    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Apply pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    return activities.slice(offset, offset + limit);
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
      attachments?: string[];
      isPrivate?: boolean;
      visibleTo?: string[];
      tags?: string[];
    },
  ): Promise<SharedNote> {
    const note: SharedNote = {
      id: `note-${Date.now()}`,
      caseId,
      authorId,
      authorName,
      content,
      mentions: options?.mentions || [],
      attachments: options?.attachments || [],
      isPrivate: options?.isPrivate || false,
      visibleTo: options?.visibleTo || [],
      tags: options?.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
    };

    // Store in case metadata
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (caseData) {
      const notes = (caseData.metadata?.notes || []) as SharedNote[];
      notes.push(note);

      caseData.metadata = {
        ...caseData.metadata,
        notes,
      };

      await this.caseRepository.save(caseData);

      // Log activity
      await this.logActivity(
        caseId,
        authorId,
        authorName,
        ActivityType.NOTE_SHARED,
        `Added a note${note.isPrivate ? ' (private)' : ''}`,
        { noteId: note.id },
      );
    }

    return note;
  }

  /**
   * Get shared notes
   */
  async getNotes(
    caseId: string,
    userId?: string,
  ): Promise<SharedNote[]> {
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseData) {
      throw new BadRequestException('Case not found');
    }

    let notes = (caseData.metadata?.notes || []) as SharedNote[];

    // Filter private notes if userId provided
    if (userId) {
      notes = notes.filter(
        (note) =>
          !note.isPrivate ||
          note.authorId === userId ||
          note.visibleTo?.includes(userId),
      );
    }

    // Sort by creation date descending
    notes.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return notes;
  }

  /**
   * Initiate case handoff
   */
  async initiateHandoff(
    caseId: string,
    fromUserId: string,
    fromUserName: string,
    toUserId: string,
    toUserName: string,
    reason: string,
    handoffNotes: string,
    checklistItems: string[],
  ): Promise<CaseHandoff> {
    const handoff: CaseHandoff = {
      id: `handoff-${Date.now()}`,
      caseId,
      fromUserId,
      fromUserName,
      toUserId,
      toUserName,
      reason,
      status: 'pending',
      handoffNotes,
      checklistItems: checklistItems.map((item) => ({ item, completed: false })),
      createdAt: new Date(),
    };

    // Store in case metadata
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (caseData) {
      const handoffs = (caseData.metadata?.handoffs || []) as CaseHandoff[];
      handoffs.push(handoff);

      caseData.metadata = {
        ...caseData.metadata,
        handoffs,
      };

      await this.caseRepository.save(caseData);

      // Log activity
      await this.logActivity(
        caseId,
        fromUserId,
        fromUserName,
        ActivityType.DECISION_MADE,
        `Initiated handoff to ${toUserName}`,
        { handoffId: handoff.id },
      );
    }

    this.logger.log(
      `Case handoff initiated from ${fromUserId} to ${toUserId} for case ${caseId}`,
    );

    return handoff;
  }

  /**
   * Accept or reject handoff
   */
  async respondToHandoff(
    caseId: string,
    handoffId: string,
    accepted: boolean,
    respondedBy: string,
  ): Promise<CaseHandoff> {
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseData) {
      throw new BadRequestException('Case not found');
    }

    const handoffs = (caseData.metadata?.handoffs || []) as CaseHandoff[];
    const handoff = handoffs.find((h) => h.id === handoffId);

    if (!handoff) {
      throw new BadRequestException('Handoff not found');
    }

    if (handoff.toUserId !== respondedBy) {
      throw new BadRequestException('Only the recipient can respond to handoff');
    }

    handoff.status = accepted ? 'accepted' : 'rejected';
    handoff.completedDate = new Date();

    // If accepted, update lead attorney
    if (accepted) {
      caseData.leadAttorneyId = handoff.toUserId;
    }

    caseData.metadata = {
      ...caseData.metadata,
      handoffs,
    };

    await this.caseRepository.save(caseData);

    this.logger.log(
      `Case handoff ${handoffId} ${accepted ? 'accepted' : 'rejected'} by ${respondedBy}`,
    );

    return handoff;
  }

  /**
   * Get team collaboration statistics
   */
  async getCollaborationStats(caseId: string): Promise<{
    totalMembers: number;
    activeMembers: number;
    membersByRole: Record<TeamRole, number>;
    totalActivities: number;
    activitiesByType: Record<ActivityType, number>;
    totalNotes: number;
    recentActivity: Date | null;
  }> {
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseData) {
      throw new BadRequestException('Case not found');
    }

    const team = (caseData.metadata?.team || []) as TeamMember[];
    const activities = (caseData.metadata?.activities || []) as CollaborationActivity[];
    const notes = (caseData.metadata?.notes || []) as SharedNote[];

    const activeMembers = team.filter((m) => m.isActive);

    const membersByRole: Record<string, number> = {};
    team.forEach((member) => {
      membersByRole[member.role] = (membersByRole[member.role] || 0) + 1;
    });

    const activitiesByType: Record<string, number> = {};
    activities.forEach((activity) => {
      activitiesByType[activity.activityType] =
        (activitiesByType[activity.activityType] || 0) + 1;
    });

    const recentActivity =
      activities.length > 0
        ? new Date(
            Math.max(...activities.map((a) => new Date(a.timestamp).getTime())),
          )
        : null;

    return {
      totalMembers: team.length,
      activeMembers: activeMembers.length,
      membersByRole: membersByRole as Record<TeamRole, number>,
      totalActivities: activities.length,
      activitiesByType: activitiesByType as Record<ActivityType, number>,
      totalNotes: notes.length,
      recentActivity,
    };
  }

  /**
   * Share document with specific team members
   */
  async shareDocument(
    caseId: string,
    documentId: string,
    documentName: string,
    sharedBy: string,
    sharedWith: string[],
  ): Promise<void> {
    await this.logActivity(
      caseId,
      sharedBy,
      '', // Would be populated from user service
      ActivityType.DOCUMENT_SHARED,
      `Shared document "${documentName}" with ${sharedWith.length} team member(s)`,
      {
        documentId,
        sharedWith,
      },
    );

    this.logger.log(
      `Document ${documentId} shared with team members in case ${caseId}`,
    );
  }
}
