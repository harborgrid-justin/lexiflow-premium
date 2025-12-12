import { Resolver, Subscription, Args, ID, ObjectType, Field } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { UseGuards, Inject } from '@nestjs/common';
import { CaseType } from '../types/case.type';
import { DocumentType } from '../types/document.type';
import { TimeEntryType, InvoiceType } from '../types/billing.type';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';

const pubSub = new PubSub();

// Subscription event types
export enum SubscriptionEvent {
  CASE_CREATED = 'caseCreated',
  CASE_UPDATED = 'caseUpdated',
  CASE_DELETED = 'caseDeleted',
  DOCUMENT_CREATED = 'documentCreated',
  DOCUMENT_UPDATED = 'documentUpdated',
  DOCUMENT_DELETED = 'documentDeleted',
  DOCUMENT_PROCESSED = 'documentProcessed',
  TIME_ENTRY_CREATED = 'timeEntryCreated',
  TIME_ENTRY_UPDATED = 'timeEntryUpdated',
  INVOICE_CREATED = 'invoiceCreated',
  INVOICE_UPDATED = 'invoiceUpdated',
  INVOICE_PAID = 'invoicePaid',
  NOTIFICATION_SENT = 'notificationSent',
  CHAT_MESSAGE = 'chatMessage',
  TASK_ASSIGNED = 'taskAssigned',
  DEADLINE_REMINDER = 'deadlineReminder',
}

@ObjectType()
export class Notification {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field({ nullable: true })
  link?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field()
  userId: string;
}

@ObjectType()
export class ChatMessage {
  @Field(() => ID)
  id: string;

  @Field()
  caseId: string;

  @Field()
  content: string;

  @Field()
  userId: string;

  @Field()
  userName: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class TaskAssignment {
  @Field(() => ID)
  id: string;

  @Field()
  taskId: string;

  @Field()
  taskTitle: string;

  @Field()
  assignedToId: string;

  @Field()
  assignedById: string;

  @Field(() => Date)
  dueDate: Date;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class DeadlineReminder {
  @Field(() => ID)
  id: string;

  @Field()
  caseId: string;

  @Field()
  caseNumber: string;

  @Field()
  description: string;

  @Field(() => Date)
  deadline: Date;

  @Field()
  hoursRemaining: number;
}

@Resolver()
export class SubscriptionsResolver {
  // Case subscriptions
  @Subscription(() => CaseType, {
    name: 'caseCreated',
    filter: (payload, variables, context) => {
      // Filter by user's permissions/organization
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  caseCreated() {
    return pubSub.asyncIterator(SubscriptionEvent.CASE_CREATED);
  }

  @Subscription(() => CaseType, {
    name: 'caseUpdated',
    filter: (payload, variables) => {
      if (variables.caseId) {
        return payload.caseUpdated.id === variables.caseId;
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  caseUpdated(@Args('caseId', { type: () => ID, nullable: true }) caseId?: string) {
    return pubSub.asyncIterator(SubscriptionEvent.CASE_UPDATED);
  }

  @Subscription(() => ID, {
    name: 'caseDeleted',
  })
  @UseGuards(GqlAuthGuard)
  caseDeleted() {
    return pubSub.asyncIterator(SubscriptionEvent.CASE_DELETED);
  }

  // Document subscriptions
  @Subscription(() => DocumentType, {
    name: 'documentCreated',
    filter: (payload, variables) => {
      if (variables.caseId) {
        return payload.documentCreated.caseId === variables.caseId;
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  documentCreated(@Args('caseId', { type: () => ID, nullable: true }) caseId?: string) {
    return pubSub.asyncIterator(SubscriptionEvent.DOCUMENT_CREATED);
  }

  @Subscription(() => DocumentType, {
    name: 'documentUpdated',
    filter: (payload, variables) => {
      if (variables.documentId) {
        return payload.documentUpdated.id === variables.documentId;
      }
      if (variables.caseId) {
        return payload.documentUpdated.caseId === variables.caseId;
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  documentUpdated(
    @Args('documentId', { type: () => ID, nullable: true }) documentId?: string,
    @Args('caseId', { type: () => ID, nullable: true }) caseId?: string,
  ) {
    return pubSub.asyncIterator(SubscriptionEvent.DOCUMENT_UPDATED);
  }

  @Subscription(() => DocumentType, {
    name: 'documentProcessed',
    filter: (payload, variables) => {
      if (variables.documentId) {
        return payload.documentProcessed.id === variables.documentId;
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  documentProcessed(@Args('documentId', { type: () => ID, nullable: true }) documentId?: string) {
    return pubSub.asyncIterator(SubscriptionEvent.DOCUMENT_PROCESSED);
  }

  // Billing subscriptions
  @Subscription(() => TimeEntryType, {
    name: 'timeEntryCreated',
    filter: (payload, variables) => {
      if (variables.caseId) {
        return payload.timeEntryCreated.caseId === variables.caseId;
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  timeEntryCreated(@Args('caseId', { type: () => ID, nullable: true }) caseId?: string) {
    return pubSub.asyncIterator(SubscriptionEvent.TIME_ENTRY_CREATED);
  }

  @Subscription(() => InvoiceType, {
    name: 'invoiceCreated',
  })
  @UseGuards(GqlAuthGuard)
  invoiceCreated() {
    return pubSub.asyncIterator(SubscriptionEvent.INVOICE_CREATED);
  }

  @Subscription(() => InvoiceType, {
    name: 'invoiceUpdated',
    filter: (payload, variables) => {
      if (variables.invoiceId) {
        return payload.invoiceUpdated.id === variables.invoiceId;
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  invoiceUpdated(@Args('invoiceId', { type: () => ID, nullable: true }) invoiceId?: string) {
    return pubSub.asyncIterator(SubscriptionEvent.INVOICE_UPDATED);
  }

  @Subscription(() => InvoiceType, {
    name: 'invoicePaid',
  })
  @UseGuards(GqlAuthGuard)
  invoicePaid() {
    return pubSub.asyncIterator(SubscriptionEvent.INVOICE_PAID);
  }

  // Notification subscriptions
  @Subscription(() => Notification, {
    name: 'notificationSent',
    filter: (payload, variables, context) => {
      // Only send to the intended user
      return payload.notificationSent.userId === context.req.user?.id;
    },
  })
  @UseGuards(GqlAuthGuard)
  notificationSent() {
    return pubSub.asyncIterator(SubscriptionEvent.NOTIFICATION_SENT);
  }

  // Chat subscriptions
  @Subscription(() => ChatMessage, {
    name: 'chatMessage',
    filter: (payload, variables) => {
      return payload.chatMessage.caseId === variables.caseId;
    },
  })
  @UseGuards(GqlAuthGuard)
  chatMessage(@Args('caseId', { type: () => ID }) caseId: string) {
    return pubSub.asyncIterator(SubscriptionEvent.CHAT_MESSAGE);
  }

  // Task subscriptions
  @Subscription(() => TaskAssignment, {
    name: 'taskAssigned',
    filter: (payload, variables, context) => {
      return payload.taskAssigned.assignedToId === context.req.user?.id;
    },
  })
  @UseGuards(GqlAuthGuard)
  taskAssigned() {
    return pubSub.asyncIterator(SubscriptionEvent.TASK_ASSIGNED);
  }

  // Deadline reminders
  @Subscription(() => DeadlineReminder, {
    name: 'deadlineReminder',
  })
  @UseGuards(GqlAuthGuard)
  deadlineReminder() {
    return pubSub.asyncIterator(SubscriptionEvent.DEADLINE_REMINDER);
  }
}

// Export pubSub instance for use in other modules
export { pubSub };

// Helper function to publish events
export class SubscriptionPublisher {
  static async publishCaseCreated(caseData: any): Promise<void> {
    await pubSub.publish(SubscriptionEvent.CASE_CREATED, { caseCreated: caseData });
  }

  static async publishCaseUpdated(caseData: any): Promise<void> {
    await pubSub.publish(SubscriptionEvent.CASE_UPDATED, { caseUpdated: caseData });
  }

  static async publishCaseDeleted(caseId: string): Promise<void> {
    await pubSub.publish(SubscriptionEvent.CASE_DELETED, { caseDeleted: caseId });
  }

  static async publishDocumentCreated(documentData: any): Promise<void> {
    await pubSub.publish(SubscriptionEvent.DOCUMENT_CREATED, { documentCreated: documentData });
  }

  static async publishDocumentUpdated(documentData: any): Promise<void> {
    await pubSub.publish(SubscriptionEvent.DOCUMENT_UPDATED, { documentUpdated: documentData });
  }

  static async publishDocumentProcessed(documentData: any): Promise<void> {
    await pubSub.publish(SubscriptionEvent.DOCUMENT_PROCESSED, { documentProcessed: documentData });
  }

  static async publishTimeEntryCreated(timeEntryData: any): Promise<void> {
    await pubSub.publish(SubscriptionEvent.TIME_ENTRY_CREATED, { timeEntryCreated: timeEntryData });
  }

  static async publishInvoiceCreated(invoiceData: any): Promise<void> {
    await pubSub.publish(SubscriptionEvent.INVOICE_CREATED, { invoiceCreated: invoiceData });
  }

  static async publishInvoiceUpdated(invoiceData: any): Promise<void> {
    await pubSub.publish(SubscriptionEvent.INVOICE_UPDATED, { invoiceUpdated: invoiceData });
  }

  static async publishInvoicePaid(invoiceData: any): Promise<void> {
    await pubSub.publish(SubscriptionEvent.INVOICE_PAID, { invoicePaid: invoiceData });
  }

  static async publishNotification(notificationData: any): Promise<void> {
    await pubSub.publish(SubscriptionEvent.NOTIFICATION_SENT, { notificationSent: notificationData });
  }

  static async publishChatMessage(messageData: any): Promise<void> {
    await pubSub.publish(SubscriptionEvent.CHAT_MESSAGE, { chatMessage: messageData });
  }

  static async publishTaskAssigned(taskData: any): Promise<void> {
    await pubSub.publish(SubscriptionEvent.TASK_ASSIGNED, { taskAssigned: taskData });
  }

  static async publishDeadlineReminder(reminderData: any): Promise<void> {
    await pubSub.publish(SubscriptionEvent.DEADLINE_REMINDER, { deadlineReminder: reminderData });
  }
}
