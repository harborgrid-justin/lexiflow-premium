/**
 * Court Deadline Calculation Service
 * Calculates legal deadlines based on court rules and statutes
 *
 * @module CourtDeadlineService
 * @description Provides court-specific deadline calculations including:
 * - Federal and state court rules
 * - Business day calculations
 * - Holiday exclusions
 * - Service deadlines
 * - Response deadlines
 * - Appeal deadlines
 * - Statute of limitations tracking
 */

import {
  addDays,
  addMonths,
  addYears,
  differenceInDays,
  isWeekend,
  isSameDay,
} from "date-fns";

// ============================================================================
// Types
// ============================================================================

export interface CourtRule {
  id: string;
  name: string;
  jurisdiction: "federal" | "state" | "local";
  state?: string;
  district?: string;
}

export interface DeadlineCalculation {
  dueDate: Date;
  daysFromStart: number;
  businessDays: number;
  excludedDays: Date[];
  rule: string;
  description: string;
  warnings?: string[];
}

export interface StatuteOfLimitations {
  claimType: string;
  jurisdiction: string;
  years: number;
  months?: number;
  days?: number;
  description: string;
  exceptions?: string[];
}

// ============================================================================
// Federal Holidays (observed)
// ============================================================================

export const getFederalHolidays = (year: number): Date[] => {
  const holidays: Date[] = [];

  // New Year's Day
  holidays.push(new Date(year, 0, 1));

  // Martin Luther King Jr. Day (3rd Monday in January)
  const mlkDay = getNthWeekdayOfMonth(year, 0, 1, 3);
  holidays.push(mlkDay);

  // Presidents' Day (3rd Monday in February)
  const presidentsDay = getNthWeekdayOfMonth(year, 1, 1, 3);
  holidays.push(presidentsDay);

  // Memorial Day (last Monday in May)
  const memorialDay = getLastWeekdayOfMonth(year, 4, 1);
  holidays.push(memorialDay);

  // Juneteenth
  holidays.push(new Date(year, 5, 19));

  // Independence Day
  holidays.push(new Date(year, 6, 4));

  // Labor Day (1st Monday in September)
  const laborDay = getNthWeekdayOfMonth(year, 8, 1, 1);
  holidays.push(laborDay);

  // Columbus Day (2nd Monday in October)
  const columbusDay = getNthWeekdayOfMonth(year, 9, 1, 2);
  holidays.push(columbusDay);

  // Veterans Day
  holidays.push(new Date(year, 10, 11));

  // Thanksgiving (4th Thursday in November)
  const thanksgiving = getNthWeekdayOfMonth(year, 10, 4, 4);
  holidays.push(thanksgiving);

  // Christmas
  holidays.push(new Date(year, 11, 25));

  return holidays;
};

/**
 * Get nth weekday of month
 */
const getNthWeekdayOfMonth = (
  year: number,
  month: number,
  weekday: number,
  n: number,
): Date => {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const offset =
    weekday >= firstWeekday
      ? weekday - firstWeekday
      : 7 - firstWeekday + weekday;
  const date = 1 + offset + (n - 1) * 7;
  return new Date(year, month, date);
};

/**
 * Get last weekday of month
 */
const getLastWeekdayOfMonth = (
  year: number,
  month: number,
  weekday: number,
): Date => {
  const lastDay = new Date(year, month + 1, 0);
  const lastWeekday = lastDay.getDay();
  const offset =
    weekday <= lastWeekday ? lastWeekday - weekday : 7 - weekday + lastWeekday;
  const date = lastDay.getDate() - offset;
  return new Date(year, month, date);
};

// ============================================================================
// Court Deadline Service
// ============================================================================

export class CourtDeadlineService {
  private holidays: Map<number, Date[]> = new Map();

  constructor() {
    // Pre-cache holidays for current and next 2 years
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year <= currentYear + 2; year++) {
      this.holidays.set(year, getFederalHolidays(year));
    }
  }

  /**
   * Check if a date is a federal holiday
   */
  isFederalHoliday(date: Date): boolean {
    const year = date.getFullYear();
    const holidays = this.holidays.get(year) || getFederalHolidays(year);
    return holidays.some((holiday) => isSameDay(holiday, date));
  }

  /**
   * Check if a date is a business day
   */
  isBusinessDay(date: Date): boolean {
    return !isWeekend(date) && !this.isFederalHoliday(date);
  }

  /**
   * Add business days to a date
   */
  addBusinessDays(startDate: Date, days: number): Date {
    let currentDate = new Date(startDate);
    let remainingDays = days;

    while (remainingDays > 0) {
      currentDate = addDays(currentDate, 1);
      if (this.isBusinessDay(currentDate)) {
        remainingDays--;
      }
    }

    return currentDate;
  }

  /**
   * Calculate business days between two dates
   */
  getBusinessDaysBetween(startDate: Date, endDate: Date): number {
    let count = 0;
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      if (this.isBusinessDay(currentDate)) {
        count++;
      }
      currentDate = addDays(currentDate, 1);
    }

    return count;
  }

  /**
   * Get excluded days (weekends and holidays) between two dates
   */
  getExcludedDays(startDate: Date, endDate: Date): Date[] {
    const excluded: Date[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (!this.isBusinessDay(currentDate)) {
        excluded.push(new Date(currentDate));
      }
      currentDate = addDays(currentDate, 1);
    }

    return excluded;
  }

  // ==========================================================================
  // Federal Rules of Civil Procedure (FRCP) Deadlines
  // ==========================================================================

  /**
   * FRCP 12(a)(1)(A): Answer to complaint served with summons
   * 21 days after being served
   */
  calculateAnswerDeadline(serviceDate: Date): DeadlineCalculation {
    const dueDate = addDays(serviceDate, 21);
    const businessDays = this.getBusinessDaysBetween(serviceDate, dueDate);
    const excludedDays = this.getExcludedDays(serviceDate, dueDate);

    return {
      dueDate,
      daysFromStart: 21,
      businessDays,
      excludedDays,
      rule: "FRCP 12(a)(1)(A)",
      description: "Answer to complaint (21 days from service)",
      warnings: [
        "If service is waived, defendant has 60 days (90 days if outside US)",
      ],
    };
  }

  /**
   * FRCP 12(a)(1)(A)(ii): Answer when served by U.S., officer, or employee
   * 60 days after being served
   */
  calculateAnswerDeadlineUSA(serviceDate: Date): DeadlineCalculation {
    const dueDate = addDays(serviceDate, 60);
    const businessDays = this.getBusinessDaysBetween(serviceDate, dueDate);
    const excludedDays = this.getExcludedDays(serviceDate, dueDate);

    return {
      dueDate,
      daysFromStart: 60,
      businessDays,
      excludedDays,
      rule: "FRCP 12(a)(1)(A)(ii)",
      description: "Answer when United States is a defendant (60 days)",
    };
  }

  /**
   * FRCP 26(a)(1): Initial disclosures
   * 14 days after Rule 26(f) conference
   */
  calculateInitialDisclosuresDeadline(
    conferenceDate: Date,
  ): DeadlineCalculation {
    const dueDate = addDays(conferenceDate, 14);
    const businessDays = this.getBusinessDaysBetween(conferenceDate, dueDate);
    const excludedDays = this.getExcludedDays(conferenceDate, dueDate);

    return {
      dueDate,
      daysFromStart: 14,
      businessDays,
      excludedDays,
      rule: "FRCP 26(a)(1)",
      description: "Initial disclosures (14 days after Rule 26(f) conference)",
    };
  }

  /**
   * FRCP 26(d)(2): Discovery commencement
   * Discovery cannot begin until after Rule 26(f) conference
   */
  calculateDiscoveryStartDate(conferenceDate: Date): DeadlineCalculation {
    const dueDate = addDays(conferenceDate, 1);

    return {
      dueDate,
      daysFromStart: 1,
      businessDays: 0,
      excludedDays: [],
      rule: "FRCP 26(d)(2)",
      description: "Discovery may commence (day after Rule 26(f) conference)",
    };
  }

  /**
   * FRCP 56(c): Summary judgment opposition
   * 21 days after motion filed (or court order)
   */
  calculateSummaryJudgmentOppositionDeadline(
    motionFiledDate: Date,
  ): DeadlineCalculation {
    const dueDate = addDays(motionFiledDate, 21);
    const businessDays = this.getBusinessDaysBetween(motionFiledDate, dueDate);
    const excludedDays = this.getExcludedDays(motionFiledDate, dueDate);

    return {
      dueDate,
      daysFromStart: 21,
      businessDays,
      excludedDays,
      rule: "FRCP 56(c)",
      description: "Summary judgment opposition (21 days from motion)",
    };
  }

  // ==========================================================================
  // Federal Rules of Appellate Procedure (FRAP) Deadlines
  // ==========================================================================

  /**
   * FRAP 4(a)(1)(A): Notice of appeal in civil case
   * 30 days after judgment/order
   */
  calculateAppealDeadline(judgmentDate: Date): DeadlineCalculation {
    const dueDate = addDays(judgmentDate, 30);
    const businessDays = this.getBusinessDaysBetween(judgmentDate, dueDate);
    const excludedDays = this.getExcludedDays(judgmentDate, dueDate);

    return {
      dueDate,
      daysFromStart: 30,
      businessDays,
      excludedDays,
      rule: "FRAP 4(a)(1)(A)",
      description: "Notice of appeal (30 days from judgment)",
      warnings: [
        "If United States is a party, 60 days",
        "Extensions available under certain circumstances",
      ],
    };
  }

  /**
   * FRAP 4(a)(1)(B): Notice of appeal when United States is a party
   * 60 days after judgment/order
   */
  calculateAppealDeadlineUSA(judgmentDate: Date): DeadlineCalculation {
    const dueDate = addDays(judgmentDate, 60);
    const businessDays = this.getBusinessDaysBetween(judgmentDate, dueDate);
    const excludedDays = this.getExcludedDays(judgmentDate, dueDate);

    return {
      dueDate,
      daysFromStart: 60,
      businessDays,
      excludedDays,
      rule: "FRAP 4(a)(1)(B)",
      description: "Notice of appeal when United States is a party (60 days)",
    };
  }

  // ==========================================================================
  // Statute of Limitations
  // ==========================================================================

  /**
   * Calculate statute of limitations deadline
   */
  calculateStatuteOfLimitations(
    incidentDate: Date,
    statute: StatuteOfLimitations,
  ): DeadlineCalculation {
    let dueDate = new Date(incidentDate);

    if (statute.years) {
      dueDate = addYears(dueDate, statute.years);
    }
    if (statute.months) {
      dueDate = addMonths(dueDate, statute.months);
    }
    if (statute.days) {
      dueDate = addDays(dueDate, statute.days);
    }

    const daysFromStart = differenceInDays(dueDate, incidentDate);
    const businessDays = this.getBusinessDaysBetween(incidentDate, dueDate);
    const excludedDays = this.getExcludedDays(incidentDate, dueDate);

    return {
      dueDate,
      daysFromStart,
      businessDays,
      excludedDays,
      rule: `Statute of Limitations - ${statute.jurisdiction}`,
      description: `${statute.claimType} (${statute.years} years)`,
      ...(statute.exceptions ? { warnings: statute.exceptions } : {}),
    };
  }

  /**
   * Common statutes of limitations
   */
  getCommonStatutesOfLimitations(): StatuteOfLimitations[] {
    return [
      {
        claimType: "Personal Injury",
        jurisdiction: "Federal",
        years: 2,
        description: "Federal Tort Claims Act",
      },
      {
        claimType: "Breach of Contract",
        jurisdiction: "Federal",
        years: 6,
        description: "Written contracts",
      },
      {
        claimType: "Securities Fraud",
        jurisdiction: "Federal",
        years: 2,
        description: "From discovery (5 years maximum)",
        exceptions: ["Discovery rule applies"],
      },
      {
        claimType: "Medical Malpractice",
        jurisdiction: "California",
        years: 3,
        description: "From injury or 1 year from discovery",
        exceptions: ["Discovery rule applies", "Minors have extended time"],
      },
      {
        claimType: "Personal Injury",
        jurisdiction: "New York",
        years: 3,
        description: "Most personal injury claims",
      },
      {
        claimType: "Breach of Written Contract",
        jurisdiction: "Texas",
        years: 4,
        description: "Written contracts",
      },
    ];
  }

  // ==========================================================================
  // Service Deadlines
  // ==========================================================================

  /**
   * Calculate service deadline with additional time for mailing
   * Adds 3 days for service by mail per FRCP 6(d)
   */
  calculateServiceByMailDeadline(filingDeadline: Date): DeadlineCalculation {
    // Service must be made at least 3 days before filing deadline
    const dueDate = addDays(filingDeadline, -3);
    const today = new Date();
    const daysFromStart = differenceInDays(dueDate, today);
    const businessDays = this.getBusinessDaysBetween(today, dueDate);
    const excludedDays = this.getExcludedDays(today, dueDate);

    return {
      dueDate,
      daysFromStart,
      businessDays,
      excludedDays,
      rule: "FRCP 6(d)",
      description: "Service deadline (3 days before filing for mail service)",
      warnings: [
        "Add 3 days for service by mail",
        "Electronic service does not add time",
      ],
    };
  }
}

export const courtDeadlineService = new CourtDeadlineService();
