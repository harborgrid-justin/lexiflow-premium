import { gql } from '@apollo/client';

// Audit Log Fragments
export const AUDIT_LOG_FRAGMENT = gql`
  fragment AuditLogFields on AuditLog {
    id
    userId
    userName
    action
    entityType
    entityId
    entityName
    changes
    metadata
    ipAddress
    userAgent
    timestamp
    organizationId
  }
`;

// Conflict Check Fragments
export const CONFLICT_CHECK_FRAGMENT = gql`
  fragment ConflictCheckFields on ConflictCheck {
    id
    requestedBy
    requestedByName
    checkType
    targetName
    targetEntity
    status
    createdAt
    updatedAt
    organizationId
    conflicts {
      conflictType
      matchedEntity
      matchedEntityId
      matchScore
      details
      severity
    }
    resolution {
      resolvedBy
      resolvedByName
      resolvedAt
      resolutionMethod
      notes
    }
    waiver {
      waivedBy
      waivedByName
      waivedAt
      reason
      approvedBy
    }
  }
`;

// Ethical Wall Fragments
export const ETHICAL_WALL_FRAGMENT = gql`
  fragment EthicalWallFields on EthicalWall {
    id
    name
    description
    restrictedUsers
    restrictedEntities {
      entityType
      entityId
      entityName
    }
    reason
    createdBy
    createdByName
    createdAt
    updatedAt
    expiresAt
    status
    organizationId
  }
`;

// Audit Log Queries
export const GET_AUDIT_LOGS = gql`
  ${AUDIT_LOG_FRAGMENT}
  query GetAuditLogs(
    $userId: String
    $entityType: String
    $entityId: String
    $action: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Int
    $limit: Int
  ) {
    auditLogs(
      userId: $userId
      entityType: $entityType
      entityId: $entityId
      action: $action
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      data {
        ...AuditLogFields
      }
      total
      page
      limit
    }
  }
`;

export const GET_AUDIT_STATISTICS = gql`
  query GetAuditStatistics($organizationId: String!) {
    auditStatistics(organizationId: $organizationId) {
      totalLogs
      logsLast24h
      logsLast7d
      logsLast30d
      topUsers {
        userId
        userName
        count
      }
      topActions {
        action
        count
      }
      topEntities {
        entityType
        count
      }
    }
  }
`;

export const GET_AUDIT_LOG_BY_ID = gql`
  ${AUDIT_LOG_FRAGMENT}
  query GetAuditLogById($id: ID!) {
    auditLog(id: $id) {
      ...AuditLogFields
    }
  }
`;

export const GET_AUDIT_LOGS_BY_ENTITY = gql`
  ${AUDIT_LOG_FRAGMENT}
  query GetAuditLogsByEntity($entityType: String!, $entityId: String!) {
    auditLogsByEntity(entityType: $entityType, entityId: $entityId) {
      ...AuditLogFields
    }
  }
`;

export const GET_RETENTION_POLICIES = gql`
  query GetRetentionPolicies {
    retentionPolicies {
      id
      name
      description
      retentionDays
      entityTypes
      actions
      autoDelete
      archiveBeforeDelete
      createdAt
      organizationId
    }
  }
`;

// Conflict Check Queries
export const GET_CONFLICT_CHECKS = gql`
  ${CONFLICT_CHECK_FRAGMENT}
  query GetConflictChecks(
    $status: String
    $checkType: String
    $requestedBy: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Int
    $limit: Int
  ) {
    conflictChecks(
      status: $status
      checkType: $checkType
      requestedBy: $requestedBy
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      data {
        ...ConflictCheckFields
      }
      total
      page
      limit
    }
  }
`;

export const GET_CONFLICT_CHECK_BY_ID = gql`
  ${CONFLICT_CHECK_FRAGMENT}
  query GetConflictCheckById($id: ID!) {
    conflictCheck(id: $id) {
      ...ConflictCheckFields
    }
  }
`;

export const GET_CONFLICT_STATISTICS = gql`
  query GetConflictStatistics($organizationId: String!) {
    conflictStatistics(organizationId: $organizationId) {
      totalChecks
      conflictsFound
      resolved
      waived
      pending
      byCheckType
      bySeverity
      averageResolutionTime
    }
  }
`;

export const SEARCH_HISTORICAL_CONFLICTS = gql`
  ${CONFLICT_CHECK_FRAGMENT}
  query SearchHistoricalConflicts(
    $searchTerm: String!
    $includeResolved: Boolean
    $includeWaived: Boolean
    $minMatchScore: Float
    $startDate: DateTime
    $endDate: DateTime
    $organizationId: String!
  ) {
    searchHistoricalConflicts(
      searchTerm: $searchTerm
      includeResolved: $includeResolved
      includeWaived: $includeWaived
      minMatchScore: $minMatchScore
      startDate: $startDate
      endDate: $endDate
      organizationId: $organizationId
    ) {
      ...ConflictCheckFields
    }
  }
`;

export const FIND_SIMILAR_CLIENTS = gql`
  query FindSimilarClients($name: String!, $threshold: Float) {
    findSimilarClients(name: $name, threshold: $threshold) {
      clientId
      clientName
      matchScore
      cases
    }
  }
`;

// Conflict Check Mutations
export const RUN_CONFLICT_CHECK = gql`
  ${CONFLICT_CHECK_FRAGMENT}
  mutation RunConflictCheck($input: RunConflictCheckInput!) {
    runConflictCheck(input: $input) {
      ...ConflictCheckFields
    }
  }
`;

export const RUN_BATCH_CONFLICT_CHECK = gql`
  ${CONFLICT_CHECK_FRAGMENT}
  mutation RunBatchConflictCheck($input: BatchConflictCheckInput!) {
    runBatchConflictCheck(input: $input) {
      ...ConflictCheckFields
    }
  }
`;

export const CHECK_PARTY_CONFLICTS = gql`
  ${CONFLICT_CHECK_FRAGMENT}
  mutation CheckPartyConflicts($input: PartyConflictCheckInput!) {
    checkPartyConflicts(input: $input) {
      ...ConflictCheckFields
    }
  }
`;

export const RESOLVE_CONFLICT = gql`
  ${CONFLICT_CHECK_FRAGMENT}
  mutation ResolveConflict($id: ID!, $input: ResolveConflictInput!) {
    resolveConflict(id: $id, input: $input) {
      ...ConflictCheckFields
    }
  }
`;

export const WAIVE_CONFLICT = gql`
  ${CONFLICT_CHECK_FRAGMENT}
  mutation WaiveConflict($id: ID!, $input: WaiveConflictInput!) {
    waiveConflict(id: $id, input: $input) {
      ...ConflictCheckFields
    }
  }
`;

// Ethical Wall Queries
export const GET_ETHICAL_WALLS = gql`
  ${ETHICAL_WALL_FRAGMENT}
  query GetEthicalWalls(
    $status: String
    $userId: String
    $entityType: String
    $entityId: String
    $page: Int
    $limit: Int
  ) {
    ethicalWalls(
      status: $status
      userId: $userId
      entityType: $entityType
      entityId: $entityId
      page: $page
      limit: $limit
    ) {
      data {
        ...EthicalWallFields
      }
      total
      page
      limit
    }
  }
`;

export const GET_ETHICAL_WALL_BY_ID = gql`
  ${ETHICAL_WALL_FRAGMENT}
  query GetEthicalWallById($id: ID!) {
    ethicalWall(id: $id) {
      ...EthicalWallFields
    }
  }
`;

export const GET_WALLS_FOR_USER = gql`
  ${ETHICAL_WALL_FRAGMENT}
  query GetWallsForUser($userId: String!) {
    wallsForUser(userId: $userId) {
      ...EthicalWallFields
    }
  }
`;

export const GET_WALL_AUDIT_TRAIL = gql`
  query GetWallAuditTrail($wallId: ID!) {
    wallAuditTrail(wallId: $wallId) {
      id
      wallId
      action
      performedBy
      performedByName
      details
      metadata
      timestamp
      ipAddress
    }
  }
`;

export const GET_WALL_BREACHES = gql`
  query GetWallBreaches($wallId: ID) {
    wallBreaches(wallId: $wallId) {
      id
      wallId
      wallName
      userId
      userName
      entityType
      entityId
      attemptedAction
      detectedAt
      ipAddress
      resolved
      resolvedAt
      resolvedBy
    }
  }
`;

export const GET_WALL_METRICS = gql`
  query GetWallMetrics($organizationId: String!) {
    wallMetrics(organizationId: $organizationId) {
      wallId
      wallName
      createdAt
      daysActive
      accessAttempts
      blockedAttempts
      breachAttempts
      affectedUsersCount
      restrictedEntitiesCount
      effectivenessScore
    }
  }
`;

// Ethical Wall Mutations
export const CREATE_ETHICAL_WALL = gql`
  ${ETHICAL_WALL_FRAGMENT}
  mutation CreateEthicalWall($input: CreateEthicalWallInput!) {
    createEthicalWall(input: $input) {
      ...EthicalWallFields
    }
  }
`;

export const UPDATE_ETHICAL_WALL = gql`
  ${ETHICAL_WALL_FRAGMENT}
  mutation UpdateEthicalWall($id: ID!, $input: UpdateEthicalWallInput!) {
    updateEthicalWall(id: $id, input: $input) {
      ...EthicalWallFields
    }
  }
`;

export const DELETE_ETHICAL_WALL = gql`
  mutation DeleteEthicalWall($id: ID!) {
    deleteEthicalWall(id: $id) {
      success
      message
    }
  }
`;

export const REPORT_WALL_BREACH = gql`
  mutation ReportWallBreach($input: ReportWallBreachInput!) {
    reportWallBreach(input: $input) {
      id
      wallId
      wallName
      userId
      userName
      entityType
      entityId
      attemptedAction
      detectedAt
      resolved
    }
  }
`;

export const RESOLVE_WALL_BREACH = gql`
  mutation ResolveWallBreach($breachId: ID!, $resolvedBy: String!) {
    resolveWallBreach(breachId: $breachId, resolvedBy: $resolvedBy) {
      id
      resolved
      resolvedAt
      resolvedBy
    }
  }
`;

// Compliance Reporting Queries
export const GENERATE_ACCESS_REPORT = gql`
  query GenerateAccessReport(
    $startDate: DateTime
    $endDate: DateTime
    $userId: String
    $includeDetails: Boolean
    $generatedBy: String!
    $organizationId: String!
  ) {
    generateAccessReport(
      startDate: $startDate
      endDate: $endDate
      userId: $userId
      includeDetails: $includeDetails
      generatedBy: $generatedBy
      organizationId: $organizationId
    ) {
      reportType
      generatedAt
      generatedBy
      dateRange {
        startDate
        endDate
      }
      data
      summary {
        totalRecords
        metrics
        highlights
      }
      organizationId
    }
  }
`;

export const GENERATE_ACTIVITY_REPORT = gql`
  query GenerateActivityReport(
    $startDate: DateTime
    $endDate: DateTime
    $userId: String
    $entityType: String
    $action: String
    $generatedBy: String!
    $organizationId: String!
  ) {
    generateActivityReport(
      startDate: $startDate
      endDate: $endDate
      userId: $userId
      entityType: $entityType
      action: $action
      generatedBy: $generatedBy
      organizationId: $organizationId
    ) {
      reportType
      generatedAt
      generatedBy
      dateRange {
        startDate
        endDate
      }
      data
      summary {
        totalRecords
        metrics
        highlights
      }
      organizationId
    }
  }
`;

export const GENERATE_CONFLICTS_REPORT = gql`
  query GenerateConflictsReport(
    $startDate: DateTime
    $endDate: DateTime
    $status: String
    $checkType: String
    $generatedBy: String!
    $organizationId: String!
  ) {
    generateConflictsReport(
      startDate: $startDate
      endDate: $endDate
      status: $status
      checkType: $checkType
      generatedBy: $generatedBy
      organizationId: $organizationId
    ) {
      reportType
      generatedAt
      generatedBy
      dateRange {
        startDate
        endDate
      }
      data
      summary {
        totalRecords
        metrics
        highlights
      }
      organizationId
    }
  }
`;

export const GENERATE_ETHICAL_WALLS_REPORT = gql`
  query GenerateEthicalWallsReport(
    $startDate: DateTime
    $endDate: DateTime
    $status: String
    $userId: String
    $generatedBy: String!
    $organizationId: String!
  ) {
    generateEthicalWallsReport(
      startDate: $startDate
      endDate: $endDate
      status: $status
      userId: $userId
      generatedBy: $generatedBy
      organizationId: $organizationId
    ) {
      reportType
      generatedAt
      generatedBy
      dateRange {
        startDate
        endDate
      }
      data
      summary {
        totalRecords
        metrics
        highlights
      }
      organizationId
    }
  }
`;
