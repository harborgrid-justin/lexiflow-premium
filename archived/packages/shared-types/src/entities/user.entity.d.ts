import { UserId } from './base.entity';
import { UserRole, UserStatus } from '../enums/user.enums';
export interface User {
    id: UserId;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    phone?: string;
    title?: string;
    department?: string;
    barNumber?: string;
    permissions?: string[];
    preferences?: Record<string, any>;
    avatarUrl?: string;
    lastLoginAt?: string;
    emailVerified?: boolean;
    twoFactorEnabled?: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface UserProfile {
    id: UserId;
    email: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    role: UserRole;
    title?: string;
    avatarUrl?: string;
}
export interface UserSummary {
    id: UserId;
    firstName: string;
    lastName: string;
    fullName?: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
}
