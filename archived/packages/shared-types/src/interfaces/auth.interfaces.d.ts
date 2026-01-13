import { UserId } from '../entities/base.entity';
import { UserRole, UserStatus } from '../enums/user.enums';
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: AuthenticatedUser;
    expiresIn: number;
}
export interface AuthenticatedUser {
    id: UserId;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    permissions: string[];
    twoFactorEnabled: boolean;
    emailVerified: boolean;
}
export interface JwtPayload {
    sub: UserId;
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
}
export interface RefreshTokenRequest {
    refreshToken: string;
}
export interface TwoFactorSetupResponse {
    secret: string;
    qrCode: string;
    backupCodes: string[];
}
export interface TwoFactorVerificationRequest {
    code: string;
    trustDevice?: boolean;
}
export interface PasswordResetRequest {
    email: string;
}
export interface PasswordResetConfirmation {
    token: string;
    newPassword: string;
}
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
export interface SessionInfo {
    userId: UserId;
    sessionId: string;
    ip: string;
    userAgent: string;
    createdAt: string;
    lastActivityAt: string;
    expiresAt: string;
}
