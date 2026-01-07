/**
 * System settings domain model
 */

export interface SystemSettings {
  id: string;
  general: GeneralSettings;
  security: SecuritySettings;
  features: FeatureSettings;
  updatedAt: string;
}

export interface GeneralSettings {
  siteName: string;
  supportEmail: string;
  timezone: string;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  sessionTimeout: number;
  maxLoginAttempts: number;
}

export interface FeatureSettings {
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableBilling: boolean;
}
