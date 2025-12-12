/**
 * GraphQL Subscriptions for Notifications (Real-time Updates)
 */

import { gql } from '@apollo/client';

// Subscribe to new notifications
export const NEW_NOTIFICATION = gql`
  subscription OnNewNotification {
    newNotification {
      id
      type
      category
      title
      message
      icon
      actionUrl
      actionText
      priority
      isRead
      createdAt
    }
  }
`;

// Subscribe to notification updates
export const NOTIFICATION_UPDATED = gql`
  subscription OnNotificationUpdated {
    notificationUpdated {
      id
      isRead
      readAt
      updatedAt
    }
  }
`;

// Subscribe to unread count changes
export const UNREAD_COUNT_CHANGED = gql`
  subscription OnUnreadCountChanged {
    unreadCountChanged {
      count
      timestamp
    }
  }
`;

// Subscribe to deadline reminders
export const DEADLINE_REMINDER = gql`
  subscription OnDeadlineReminder {
    deadlineReminder {
      id
      title
      deadlineDate
      daysUntilDeadline
      hoursUntilDeadline
      caseId
      caseName
      priority
    }
  }
`;

export default {
  NEW_NOTIFICATION,
  NOTIFICATION_UPDATED,
  UNREAD_COUNT_CHANGED,
  DEADLINE_REMINDER,
};
