import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserType } from './user.type';

@ObjectType()
export class NotificationType {
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

  @Field(() => Boolean)
  read: boolean;

  @Field(() => UserType)
  recipient: UserType;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class MessageType {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  conversationId?: string;

  @Field(() => UserType)
  sender: UserType;

  @Field(() => Boolean)
  read: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class SearchResultItem {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  snippet?: string;

  @Field()
  score: number;

  @Field({ nullable: true })
  url?: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class SearchResult {
  @Field(() => [SearchResultItem])
  items: SearchResultItem[];

  @Field()
  totalCount: number;

  @Field()
  took: number;
}

@ObjectType()
export class DashboardData {
  @Field()
  totalCases: number;

  @Field()
  activeCases: number;

  @Field()
  totalDocuments: number;

  @Field()
  pendingTasks: number;

  @Field()
  upcomingDeadlines: number;

  @Field()
  recentActivity: string;

  @Field(() => [ActivityItem])
  activities: ActivityItem[];
}

@ObjectType()
export class ActivityItem {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field()
  description: string;

  @Field(() => UserType)
  user: UserType;

  @Field(() => Date)
  timestamp: Date;
}

@ObjectType()
export class AuditLogEntry {
  @Field(() => ID)
  id: string;

  @Field()
  action: string;

  @Field()
  entityType: string;

  @Field()
  entityId: string;

  @Field({ nullable: true })
  oldValue?: string;

  @Field({ nullable: true })
  newValue?: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field(() => UserType)
  user: UserType;

  @Field(() => Date)
  timestamp: Date;
}
