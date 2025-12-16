import { ObjectType, Field, ID, registerEnumType, HideField } from '@nestjs/graphql';

export enum UserRole {
  ADMIN = 'ADMIN',
  PARTNER = 'PARTNER',
  ATTORNEY = 'ATTORNEY',
  PARALEGAL = 'PARALEGAL',
  LEGAL_ASSISTANT = 'LEGAL_ASSISTANT',
  CLIENT = 'CLIENT',
  EXPERT_WITNESS = 'EXPERT_WITNESS',
  COURT_REPORTER = 'COURT_REPORTER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

registerEnumType(UserRole, { name: 'UserRole' });
registerEnumType(UserStatus, { name: 'UserStatus' });

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  fullName: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => UserStatus)
  status: UserStatus;

  @Field({ nullable: true })
  barNumber?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => Boolean)
  mfaEnabled: boolean;

  @Field(() => Date, { nullable: true })
  lastLoginAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Hidden fields (not exposed in GraphQL)
  @HideField()
  password?: string;

  @HideField()
  passwordHash?: string;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserType)
  user: UserType;

  @Field()
  expiresIn: number;
}

@ObjectType()
export class UserPermission {
  @Field(() => ID)
  id: string;

  @Field()
  resource: string;

  @Field()
  action: string;

  @Field({ nullable: true })
  conditions?: string;
}

@ObjectType()
export class UserPreferences {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  theme?: string;

  @Field({ nullable: true })
  language?: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  notifications?: string;
}
