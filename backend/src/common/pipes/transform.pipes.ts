import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';

/**
 * Parse UUID Pipe with Enhanced Validation
 * Validates and transforms UUID strings with detailed error messages
 */
@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {

  constructor(private readonly version: '3' | '4' | '5' | 'all' = '4') {}

  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      throw new BadRequestException(
        `Invalid ${metadata.data || 'id'}: UUID is required`,
      );
    }

    if (!isUUID(value, this.version)) {
      throw new BadRequestException(
        `Invalid ${metadata.data || 'id'}: Must be a valid UUID v${this.version}`,
      );
    }

    return value.toLowerCase();
  }
}

/**
 * Parse Date Pipe with Enhanced Validation
 * Validates and transforms date strings to Date objects
 */
@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {

  constructor(
    private readonly options: {
      allowPast?: boolean;
      allowFuture?: boolean;
      minDate?: Date;
      maxDate?: Date;
    } = {},
  ) {}

  transform(value: string, metadata: ArgumentMetadata): Date {
    if (!value) {
      throw new BadRequestException(
        `Invalid ${metadata.data || 'date'}: Date is required`,
      );
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        `Invalid ${metadata.data || 'date'}: Must be a valid ISO 8601 date string`,
      );
    }

    const now = new Date();

    // Check past date constraint
    if (this.options.allowPast === false && date < now) {
      throw new BadRequestException(
        `Invalid ${metadata.data || 'date'}: Date cannot be in the past`,
      );
    }

    // Check future date constraint
    if (this.options.allowFuture === false && date > now) {
      throw new BadRequestException(
        `Invalid ${metadata.data || 'date'}: Date cannot be in the future`,
      );
    }

    // Check minimum date
    if (this.options.minDate && date < this.options.minDate) {
      throw new BadRequestException(
        `Invalid ${metadata.data || 'date'}: Date must be after ${this.options.minDate.toISOString()}`,
      );
    }

    // Check maximum date
    if (this.options.maxDate && date > this.options.maxDate) {
      throw new BadRequestException(
        `Invalid ${metadata.data || 'date'}: Date must be before ${this.options.maxDate.toISOString()}`,
      );
    }

    return date;
  }
}

/**
 * Parse Integer Pipe with Range Validation
 * Validates and transforms integer strings with min/max constraints
 */
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {

  constructor(
    private readonly options: {
      min?: number;
      max?: number;
      errorMessage?: string;
    } = {},
  ) {}

  transform(value: string, metadata: ArgumentMetadata): number {
    if (value === undefined || value === null || value === '') {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Invalid ${metadata.data || 'value'}: Integer is required`,
      );
    }

    const parsed = parseInt(value, 10);

    if (isNaN(parsed)) {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Invalid ${metadata.data || 'value'}: Must be a valid integer`,
      );
    }

    if (this.options.min !== undefined && parsed < this.options.min) {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Invalid ${metadata.data || 'value'}: Must be at least ${this.options.min}`,
      );
    }

    if (this.options.max !== undefined && parsed > this.options.max) {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Invalid ${metadata.data || 'value'}: Must be at most ${this.options.max}`,
      );
    }

    return parsed;
  }
}

/**
 * Parse Float Pipe with Range Validation
 * Validates and transforms float strings with min/max constraints
 */
@Injectable()
export class ParseFloatPipe implements PipeTransform<string, number> {

  constructor(
    private readonly options: {
      min?: number;
      max?: number;
      precision?: number;
      errorMessage?: string;
    } = {},
  ) {}

  transform(value: string, metadata: ArgumentMetadata): number {
    if (value === undefined || value === null || value === '') {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Invalid ${metadata.data || 'value'}: Number is required`,
      );
    }

    const parsed = parseFloat(value);

    if (isNaN(parsed)) {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Invalid ${metadata.data || 'value'}: Must be a valid number`,
      );
    }

    if (this.options.min !== undefined && parsed < this.options.min) {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Invalid ${metadata.data || 'value'}: Must be at least ${this.options.min}`,
      );
    }

    if (this.options.max !== undefined && parsed > this.options.max) {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Invalid ${metadata.data || 'value'}: Must be at most ${this.options.max}`,
      );
    }

    // Apply precision if specified
    if (this.options.precision !== undefined) {
      return parseFloat(parsed.toFixed(this.options.precision));
    }

    return parsed;
  }
}

/**
 * Parse Boolean Pipe
 * Validates and transforms boolean strings
 */
@Injectable()
export class ParseBooleanPipe implements PipeTransform<string | boolean, boolean> {

  private readonly truthyValues = ['true', '1', 'yes', 'on'];
  private readonly falsyValues = ['false', '0', 'no', 'off'];

  transform(value: string | boolean, metadata: ArgumentMetadata): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (!value) {
      throw new BadRequestException(
        `Invalid ${metadata.data || 'value'}: Boolean is required`,
      );
    }

    const normalized = value.toLowerCase().trim();

    if (this.truthyValues.includes(normalized)) {
      return true;
    }

    if (this.falsyValues.includes(normalized)) {
      return false;
    }

    throw new BadRequestException(
      `Invalid ${metadata.data || 'value'}: Must be a valid boolean (true, false, 1, 0, yes, no, on, off)`,
    );
  }
}

/**
 * Parse Array Pipe
 * Validates and transforms comma-separated strings to arrays
 */
@Injectable()
export class ParseArrayPipe implements PipeTransform<string, string[]> {

  constructor(
    private readonly options: {
      separator?: string;
      minLength?: number;
      maxLength?: number;
      unique?: boolean;
      errorMessage?: string;
    } = {},
  ) {}

  transform(value: string, metadata: ArgumentMetadata): string[] {
    if (!value) {
      return [];
    }

    const separator = this.options.separator || ',';
    let array = value.split(separator).map((item) => item.trim()).filter((item) => item);

    // Check unique constraint
    if (this.options.unique) {
      array = [...new Set(array)];
    }

    // Check minimum length
    if (this.options.minLength !== undefined && array.length < this.options.minLength) {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Invalid ${metadata.data || 'array'}: Must contain at least ${this.options.minLength} items`,
      );
    }

    // Check maximum length
    if (this.options.maxLength !== undefined && array.length > this.options.maxLength) {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Invalid ${metadata.data || 'array'}: Must contain at most ${this.options.maxLength} items`,
      );
    }

    return array;
  }
}

/**
 * Parse JSON Pipe
 * Validates and transforms JSON strings to objects
 */
@Injectable()
export class ParseJsonPipe implements PipeTransform<string, unknown> {

  constructor(
    private readonly options: {
      errorMessage?: string;
    } = {},
  ) {}

  transform(value: string, metadata: ArgumentMetadata): unknown {
    if (!value) {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Invalid ${metadata.data || 'json'}: JSON string is required`,
      );
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Invalid ${metadata.data || 'json'}: Must be a valid JSON string`,
      );
    }
  }
}

/**
 * Trim Pipe
 * Trims whitespace from string values
 */
@Injectable()
export class TrimPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  }
}

/**
 * Lowercase Pipe
 * Converts string to lowercase
 */
@Injectable()
export class LowercasePipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  }
}

/**
 * Uppercase Pipe
 * Converts string to uppercase
 */
@Injectable()
export class UppercasePipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    return value;
  }
}

/**
 * Default Value Pipe
 * Provides a default value if input is null/undefined
 */
@Injectable()
export class DefaultValuePipe implements PipeTransform {
  constructor(private readonly defaultValue: unknown) {}

  transform(value: unknown): unknown {
    if (value === null || value === undefined || value === '') {
      return this.defaultValue;
    }
    return value;
  }
}

/**
 * Sanitize String Pipe
 * Removes potentially dangerous characters from strings
 */
@Injectable()
export class SanitizeStringPipe implements PipeTransform<string, string> {

  private readonly dangerousPatterns = [
    /<script[^>]*>.*?</script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  transform(value: string): string {
    if (typeof value !== 'string') {
      return value;
    }

    let sanitized = value;

    for (const pattern of this.dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    return sanitized;
  }
}
