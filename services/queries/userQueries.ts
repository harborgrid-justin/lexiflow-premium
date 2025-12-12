import { gql } from '@apollo/client';

/**
 * GraphQL Queries and Mutations for User Management
 */

// ============ FRAGMENTS ============

export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    email
    username
    firstName
    lastName
    fullName
    displayName
    avatar
    title
    department
    role
    status
    isActive
    emailVerified
    twoFactorEnabled
    lastLoginAt
    createdAt
    updatedAt
  }
`;

export const USER_PROFILE_FRAGMENT = gql`
  fragment UserProfileFields on UserProfile {
    bio
    phone
    mobile
    timezone
    locale
    dateFormat
    timeFormat
    profilePicture
    address {
      street
      city
      state
      zipCode
      country
    }
    socialLinks {
      linkedin
      twitter
      website
    }
    education {
      institution
      degree
      field
      graduationYear
    }
    certifications {
      name
      issuer
      issueDate
      expiryDate
      verified
    }
    languages {
      code
      name
      proficiency
    }
  }
`;

export const USER_DETAIL_FRAGMENT = gql`
  ${USER_FRAGMENT}
  ${USER_PROFILE_FRAGMENT}
  fragment UserDetailFields on User {
    ...UserFields
    profile {
      ...UserProfileFields
    }
    practiceAreas
    barNumber
    jurisdictions {
      id
      state
      country
      admissionDate
      status
    }
    permissions {
      id
      name
      resource
      action
    }
    organization {
      id
      name
      type
    }
    teams {
      id
      name
      type
    }
  }
`;

// ============ QUERIES ============

export const GET_ME = gql`
  ${USER_DETAIL_FRAGMENT}
  query GetMe {
    me {
      ...UserDetailFields
    }
  }
`;

export const GET_MY_PROFILE = gql`
  ${USER_PROFILE_FRAGMENT}
  query GetMyProfile {
    myProfile {
      ...UserProfileFields
    }
  }
`;

export const GET_USER = gql`
  ${USER_DETAIL_FRAGMENT}
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserDetailFields
    }
  }
`;

export const GET_USER_BY_EMAIL = gql`
  ${USER_DETAIL_FRAGMENT}
  query GetUserByEmail($email: String!) {
    userByEmail(email: $email) {
      ...UserDetailFields
    }
  }
`;

export const GET_USERS = gql`
  ${USER_FRAGMENT}
  query GetUsers(
    $filter: UserFilter
    $sort: UserSort
    $pagination: PaginationInput
  ) {
    users(filter: $filter, sort: $sort, pagination: $pagination) {
      edges {
        node {
          ...UserFields
          organization {
            id
            name
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const SEARCH_USERS = gql`
  ${USER_FRAGMENT}
  query SearchUsers($query: String!, $filters: UserFilter) {
    searchUsers(query: $query, filters: $filters) {
      ...UserFields
    }
  }
`;

export const GET_MY_PERMISSIONS = gql`
  query GetMyPermissions {
    myPermissions {
      id
      name
      resource
      action
      description
    }
  }
`;

export const CHECK_PERMISSION = gql`
  query CheckPermission($resource: String!, $action: PermissionAction!) {
    checkPermission(resource: $resource, action: $action)
  }
`;

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications(
    $filter: NotificationFilter
    $pagination: PaginationInput
  ) {
    myNotifications(filter: $filter, pagination: $pagination) {
      edges {
        node {
          id
          type
          title
          message
          link
          read
          readAt
          priority
          category
          createdAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
      unreadCount
    }
  }
`;

export const GET_MY_ACTIVITY = gql`
  query GetMyActivity($pagination: PaginationInput) {
    myActivity(pagination: $pagination) {
      edges {
        node {
          id
          action
          entity
          entityId
          description
          createdAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

export const GET_MY_SESSIONS = gql`
  query GetMySessions {
    mySessions {
      id
      ipAddress
      userAgent
      location
      device {
        type
        os
        browser
      }
      lastActivity
      expiresAt
      createdAt
    }
  }
`;

export const GET_ORGANIZATION = gql`
  query GetOrganization($id: ID!) {
    organization(id: $id) {
      id
      name
      displayName
      type
      industry
      website
      phone
      email
      logo
      settings {
        billingEnabled
        timeTrackingEnabled
        documentManagementEnabled
        aiAnalysisEnabled
        complianceTrackingEnabled
      }
      subscription {
        id
        plan
        status
        currentUsers
        userLimit
        nextBillingDate
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_ORGANIZATION = gql`
  query GetMyOrganization {
    myOrganization {
      id
      name
      type
      logo
      subscription {
        plan
        status
      }
    }
  }
`;

export const GET_TEAM = gql`
  query GetTeam($id: ID!) {
    team(id: $id) {
      id
      name
      description
      type
      lead {
        id
        firstName
        lastName
      }
      members {
        user {
          id
          firstName
          lastName
          email
          avatar
        }
        role
        joinedAt
      }
      cases {
        id
        caseNumber
        title
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_TEAMS = gql`
  query GetTeams($organizationId: ID) {
    teams(organizationId: $organizationId) {
      id
      name
      type
      lead {
        id
        firstName
        lastName
      }
      members {
        user {
          id
        }
      }
    }
  }
`;

export const GET_MY_TEAMS = gql`
  query GetMyTeams {
    myTeams {
      id
      name
      type
      lead {
        id
        firstName
        lastName
      }
    }
  }
`;

export const GET_USER_ANALYTICS = gql`
  query GetUserAnalytics($userId: ID!, $dateRange: DateRangeInput!) {
    userAnalytics(userId: $userId, dateRange: $dateRange) {
      user {
        id
        firstName
        lastName
      }
      timeframe {
        startDate
        endDate
      }
      totalHours
      billableHours
      utilizationRate
      activeCases
      completedCases
      totalRevenue
      realizationRate
      documentsCreated
      tasksCompleted
    }
  }
`;

// ============ MUTATIONS ============

export const UPDATE_MY_PROFILE = gql`
  ${USER_DETAIL_FRAGMENT}
  mutation UpdateMyProfile($input: UpdateProfileInput!) {
    updateMyProfile(input: $input) {
      ...UserDetailFields
    }
  }
`;

export const UPDATE_AVATAR = gql`
  ${USER_FRAGMENT}
  mutation UpdateAvatar($file: Upload!) {
    updateAvatar(file: $file) {
      ...UserFields
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

export const UPDATE_PREFERENCES = gql`
  mutation UpdatePreferences($input: UpdatePreferencesInput!) {
    updatePreferences(input: $input) {
      theme
      language
      timezone
      emailDigest
      density
      profileVisibility
    }
  }
`;

export const UPDATE_NOTIFICATION_SETTINGS = gql`
  mutation UpdateNotificationSettings($input: UpdateNotificationSettingsInput!) {
    updateNotificationSettings(input: $input) {
      email {
        enabled
        caseAssignments
        taskAssignments
        deadlines
      }
      push {
        enabled
        urgentOnly
      }
      inApp {
        enabled
        showBadges
        soundEnabled
      }
    }
  }
`;

export const ENABLE_TWO_FACTOR = gql`
  mutation EnableTwoFactor {
    enableTwoFactor {
      secret
      qrCode
      backupCodes
    }
  }
`;

export const DISABLE_TWO_FACTOR = gql`
  mutation DisableTwoFactor($code: String!) {
    disableTwoFactor(code: $code)
  }
`;

export const VERIFY_TWO_FACTOR = gql`
  mutation VerifyTwoFactor($code: String!) {
    verifyTwoFactor(code: $code)
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      read
      readAt
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;

export const REVOKE_SESSION = gql`
  mutation RevokeSession($sessionId: ID!) {
    revokeSession(sessionId: $sessionId)
  }
`;

export const REVOKE_ALL_SESSIONS = gql`
  mutation RevokeAllSessions {
    revokeAllSessions
  }
`;

export const CREATE_USER = gql`
  ${USER_DETAIL_FRAGMENT}
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      ...UserDetailFields
    }
  }
`;

export const UPDATE_USER = gql`
  ${USER_DETAIL_FRAGMENT}
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserDetailFields
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const SUSPEND_USER = gql`
  ${USER_FRAGMENT}
  mutation SuspendUser($id: ID!, $reason: String!) {
    suspendUser(id: $id, reason: $reason) {
      ...UserFields
    }
  }
`;

export const UNSUSPEND_USER = gql`
  ${USER_FRAGMENT}
  mutation UnsuspendUser($id: ID!) {
    unsuspendUser(id: $id) {
      ...UserFields
    }
  }
`;

export const ACTIVATE_USER = gql`
  ${USER_FRAGMENT}
  mutation ActivateUser($id: ID!) {
    activateUser(id: $id) {
      ...UserFields
    }
  }
`;

export const DEACTIVATE_USER = gql`
  ${USER_FRAGMENT}
  mutation DeactivateUser($id: ID!) {
    deactivateUser(id: $id) {
      ...UserFields
    }
  }
`;

export const CREATE_TEAM = gql`
  mutation CreateTeam($input: CreateTeamInput!) {
    createTeam(input: $input) {
      id
      name
      description
      type
    }
  }
`;

export const UPDATE_TEAM = gql`
  mutation UpdateTeam($id: ID!, $input: UpdateTeamInput!) {
    updateTeam(id: $id, input: $input) {
      id
      name
      description
    }
  }
`;

export const DELETE_TEAM = gql`
  mutation DeleteTeam($id: ID!) {
    deleteTeam(id: $id)
  }
`;

export const ADD_TEAM_MEMBER = gql`
  mutation AddTeamMember($teamId: ID!, $userId: ID!, $role: TeamMemberRole!) {
    addTeamMember(teamId: $teamId, userId: $userId, role: $role) {
      id
      members {
        user {
          id
          firstName
          lastName
        }
        role
      }
    }
  }
`;

export const REMOVE_TEAM_MEMBER = gql`
  mutation RemoveTeamMember($teamId: ID!, $userId: ID!) {
    removeTeamMember(teamId: $teamId, userId: $userId) {
      id
    }
  }
`;

// ============ SUBSCRIPTIONS ============

export const NOTIFICATION_RECEIVED_SUBSCRIPTION = gql`
  subscription OnNotificationReceived($userId: ID!) {
    notificationReceived(userId: $userId) {
      id
      type
      title
      message
      link
      priority
      category
      createdAt
    }
  }
`;

export const USER_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription OnUserStatusChanged($userId: ID!) {
    userStatusChanged(userId: $userId) {
      user {
        id
        status
      }
      previousStatus
      newStatus
      changedAt
    }
  }
`;

export const USER_ONLINE_STATUS_SUBSCRIPTION = gql`
  subscription OnUserOnlineStatus($userId: ID) {
    userOnlineStatus(userId: $userId) {
      user {
        id
        firstName
        lastName
      }
      isOnline
      lastSeen
    }
  }
`;

export default {
  // Fragments
  USER_FRAGMENT,
  USER_PROFILE_FRAGMENT,
  USER_DETAIL_FRAGMENT,

  // Queries
  GET_ME,
  GET_MY_PROFILE,
  GET_USER,
  GET_USER_BY_EMAIL,
  GET_USERS,
  SEARCH_USERS,
  GET_MY_PERMISSIONS,
  CHECK_PERMISSION,
  GET_MY_NOTIFICATIONS,
  GET_MY_ACTIVITY,
  GET_MY_SESSIONS,
  GET_ORGANIZATION,
  GET_MY_ORGANIZATION,
  GET_TEAM,
  GET_TEAMS,
  GET_MY_TEAMS,
  GET_USER_ANALYTICS,

  // Mutations
  UPDATE_MY_PROFILE,
  UPDATE_AVATAR,
  CHANGE_PASSWORD,
  UPDATE_PREFERENCES,
  UPDATE_NOTIFICATION_SETTINGS,
  ENABLE_TWO_FACTOR,
  DISABLE_TWO_FACTOR,
  VERIFY_TWO_FACTOR,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
  DELETE_NOTIFICATION,
  REVOKE_SESSION,
  REVOKE_ALL_SESSIONS,
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  SUSPEND_USER,
  UNSUSPEND_USER,
  ACTIVATE_USER,
  DEACTIVATE_USER,
  CREATE_TEAM,
  UPDATE_TEAM,
  DELETE_TEAM,
  ADD_TEAM_MEMBER,
  REMOVE_TEAM_MEMBER,

  // Subscriptions
  NOTIFICATION_RECEIVED_SUBSCRIPTION,
  USER_STATUS_CHANGED_SUBSCRIPTION,
  USER_ONLINE_STATUS_SUBSCRIPTION,
};
