import { Entity, Column, Index, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { User } from './user.entity';

export type ThemeType = 'light' | 'dark' | 'auto';
export type ViewType = 'grid' | 'list' | 'kanban' | 'timeline';
export type DateFormatType = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD-MMM-YYYY';
export type TimeFormatType = '12h' | '24h';
export type LanguageType = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'pt' | 'ru';

@Entity('user_preferences')
@Index(['userId'], { unique: true })
export class UserPreferences extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Display & Appearance
  @Column({
    type: 'enum',
    enum: ['light', 'dark', 'auto'],
    default: 'light',
  })
  theme!: ThemeType;

  @Column({
    type: 'enum',
    enum: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'ru'],
    default: 'en',
  })
  language!: LanguageType;

  @Column({ name: 'timezone', type: 'varchar', length: 100, default: 'UTC' })
  timezone!: string;

  @Column({
    name: 'date_format',
    type: 'enum',
    enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MMM-YYYY'],
    default: 'MM/DD/YYYY',
  })
  dateFormat!: DateFormatType;

  @Column({
    name: 'time_format',
    type: 'enum',
    enum: ['12h', '24h'],
    default: '12h',
  })
  timeFormat!: TimeFormatType;

  // Dashboard & Views
  @Column({
    name: 'default_view',
    type: 'enum',
    enum: ['grid', 'list', 'kanban', 'timeline'],
    default: 'list',
  })
  defaultView!: ViewType;

  @Column({ name: 'items_per_page', type: 'integer', default: 25 })
  itemsPerPage!: number;

  @Column({ name: 'show_completed_tasks', type: 'boolean', default: true })
  showCompletedTasks!: boolean;

  @Column({ name: 'show_archived_items', type: 'boolean', default: false })
  showArchivedItems!: boolean;

  @Column({ name: 'dashboard_widgets', type: 'jsonb', nullable: true })
  dashboardWidgets!: Record<string, unknown>[] | null;

  @Column({ name: 'pinned_items', type: 'jsonb', nullable: true })
  pinnedItems!: string[] | null;

  // Notifications
  @Column({ name: 'email_notifications', type: 'boolean', default: true })
  emailNotifications!: boolean;

  @Column({ name: 'push_notifications', type: 'boolean', default: true })
  pushNotifications!: boolean;

  @Column({ name: 'sms_notifications', type: 'boolean', default: false })
  smsNotifications!: boolean;

  @Column({ name: 'notification_digest', type: 'boolean', default: false })
  notificationDigest!: boolean;

  @Column({
    name: 'digest_frequency',
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly'],
    nullable: true,
  })
  digestFrequency!: 'daily' | 'weekly' | 'monthly' | null;

  @Column({ name: 'notify_case_updates', type: 'boolean', default: true })
  notifyCaseUpdates!: boolean;

  @Column({ name: 'notify_task_assignments', type: 'boolean', default: true })
  notifyTaskAssignments!: boolean;

  @Column({ name: 'notify_deadline_reminders', type: 'boolean', default: true })
  notifyDeadlineReminders!: boolean;

  @Column({ name: 'notify_mentions', type: 'boolean', default: true })
  notifyMentions!: boolean;

  @Column({ name: 'notify_document_shares', type: 'boolean', default: true })
  notifyDocumentShares!: boolean;

  @Column({ name: 'notify_messages', type: 'boolean', default: true })
  notifyMessages!: boolean;

  @Column({ name: 'notify_billing_alerts', type: 'boolean', default: true })
  notifyBillingAlerts!: boolean;

  @Column({ name: 'notify_court_dates', type: 'boolean', default: true })
  notifyCourtDates!: boolean;

  @Column({ name: 'deadline_reminder_days', type: 'integer', default: 3 })
  deadlineReminderDays!: number;

  // Calendar & Scheduling
  @Column({ name: 'calendar_start_day', type: 'integer', default: 0 })
  calendarStartDay!: number; // 0 = Sunday, 1 = Monday, etc.

  @Column({ name: 'work_hours_start', type: 'time', nullable: true })
  workHoursStart!: string | null;

  @Column({ name: 'work_hours_end', type: 'time', nullable: true })
  workHoursEnd!: string | null;

  @Column({ name: 'work_days', type: 'jsonb', nullable: true })
  workDays!: number[] | null; // [1,2,3,4,5] for Mon-Fri

  @Column({ name: 'default_event_duration', type: 'integer', default: 60 })
  defaultEventDuration!: number; // in minutes

  // Billing & Time Tracking
  @Column({ name: 'auto_track_time', type: 'boolean', default: false })
  autoTrackTime!: boolean;

  @Column({ name: 'default_billing_increment', type: 'integer', default: 6 })
  defaultBillingIncrement!: number; // in minutes (6 = 0.1 hour)

  @Column({ name: 'time_entry_reminders', type: 'boolean', default: true })
  timeEntryReminders!: boolean;

  @Column({ name: 'reminder_time', type: 'time', nullable: true })
  reminderTime!: string | null;

  // Privacy & Security
  @Column({ name: 'show_profile_publicly', type: 'boolean', default: false })
  showProfilePublicly!: boolean;

  @Column({ name: 'show_email_publicly', type: 'boolean', default: false })
  showEmailPublicly!: boolean;

  @Column({ name: 'allow_mentions', type: 'boolean', default: true })
  allowMentions!: boolean;

  @Column({ name: 'auto_lock_session', type: 'boolean', default: true })
  autoLockSession!: boolean;

  @Column({ name: 'session_timeout_minutes', type: 'integer', default: 30 })
  sessionTimeoutMinutes!: number;

  // Accessibility
  @Column({ name: 'high_contrast_mode', type: 'boolean', default: false })
  highContrastMode!: boolean;

  @Column({ name: 'reduce_animations', type: 'boolean', default: false })
  reduceAnimations!: boolean;

  @Column({ name: 'font_size', type: 'varchar', length: 20, default: 'medium' })
  fontSize!: 'small' | 'medium' | 'large' | 'extra-large';

  @Column({ name: 'keyboard_shortcuts_enabled', type: 'boolean', default: true })
  keyboardShortcutsEnabled!: boolean;

  // Advanced
  @Column({ name: 'beta_features_enabled', type: 'boolean', default: false })
  betaFeaturesEnabled!: boolean;

  @Column({ name: 'analytics_enabled', type: 'boolean', default: true })
  analyticsEnabled!: boolean;

  @Column({ name: 'auto_save_enabled', type: 'boolean', default: true })
  autoSaveEnabled!: boolean;

  @Column({ name: 'auto_save_interval', type: 'integer', default: 30 })
  autoSaveInterval!: number; // in seconds

  @Column({ name: 'custom_shortcuts', type: 'jsonb', nullable: true })
  customShortcuts!: Record<string, string> | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;
}
