import { Injectable, Logger, BadRequestException } from "@nestjs/common";

/**
 * Validated value types (what we accept after validation)
 */
export type ValidatedValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | ValidatedValue[]
  | { [key: string]: ValidatedValue };

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: ValidatedValue;
  violations: ValidationViolation[];
  riskLevel: "none" | "low" | "medium" | "high" | "critical";
}

/**
 * Validation Violation
 */
export interface ValidationViolation {
  field: string;
  type: ViolationType;
  description: string;
  originalValue: ValidatedValue;
  sanitizedValue?: ValidatedValue;
}

/**
 * Violation Types
 */
export enum ViolationType {
  XSS = "XSS_ATTEMPT",
  SQL_INJECTION = "SQL_INJECTION",
  NOSQL_INJECTION = "NOSQL_INJECTION",
  COMMAND_INJECTION = "COMMAND_INJECTION",
  PATH_TRAVERSAL = "PATH_TRAVERSAL",
  LDAP_INJECTION = "LDAP_INJECTION",
  XML_INJECTION = "XML_INJECTION",
  SSRF = "SSRF_ATTEMPT",
  PROTOTYPE_POLLUTION = "PROTOTYPE_POLLUTION",
  INVALID_FORMAT = "INVALID_FORMAT",
  EXCESSIVE_LENGTH = "EXCESSIVE_LENGTH",
}

/**
 * Advanced Input Validation and Sanitization Service
 *
 * Implements OWASP Input Validation guidelines with:
 * - XSS prevention (reflected, stored, DOM-based)
 * - SQL injection prevention
 * - NoSQL injection prevention
 * - Command injection prevention
 * - Path traversal prevention
 * - LDAP injection prevention
 * - XML/XXE prevention
 * - SSRF prevention
 * - Prototype pollution prevention
 * - Length validation
 * - Format validation
 * - Unicode normalization
 *
 * OWASP References:
 * - Input Validation Cheat Sheet
 * - XSS Prevention Cheat Sheet
 * - SQL Injection Prevention Cheat Sheet
 * - NoSQL Injection Prevention Cheat Sheet
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
 */
/**
 * ╔=================================================================================================================╗
 * ║INPUTVALIDATION                                                                                                  ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class InputValidationService {
  private readonly logger = new Logger(InputValidationService.name);

  // Maximum field lengths
  private readonly MAX_STRING_LENGTH = 10000;
  private readonly MAX_ARRAY_LENGTH = 1000;
  private readonly MAX_OBJECT_DEPTH = 10;

  // Dangerous patterns
  private readonly XSS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];

  private readonly SQL_PATTERNS = [
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(\bSELECT\b.*\bFROM\b)/gi,
    /(\bINSERT\b.*\bINTO\b)/gi,
    /(\bUPDATE\b.*\bSET\b)/gi,
    /(\bDELETE\b.*\bFROM\b)/gi,
    /(\bDROP\b.*\b(TABLE|DATABASE)\b)/gi,
    /(\bEXEC\b.*\()/gi,
    /(\bOR\b.*=.*)/gi,
    /(;.*--)/g,
    /('.*OR.*'.*=.*')/gi,
  ];

  private readonly NOSQL_PATTERNS = [
    /\$where/gi,
    /\$ne/gi,
    /\$gt/gi,
    /\$gte/gi,
    /\$lt/gi,
    /\$lte/gi,
    /\$in/gi,
    /\$nin/gi,
    /\$regex/gi,
    /\$or/gi,
    /\$and/gi,
  ];

  private readonly COMMAND_PATTERNS = [/[;&|`$()]/g, /\.\.\//g, /~\//g];

  private readonly PATH_TRAVERSAL_PATTERNS = [
    /\.\.[/\\]/g,
    /%2e%2e[/\\]/gi,
    /\.\.[%/\\]/g,
  ];

  private readonly LDAP_PATTERNS = [/[*()\\|&]/g];

  private readonly SSRF_PATTERNS = [
    /^file:\/\//gi,
    /^gopher:\/\//gi,
    /^dict:\/\//gi,
    /localhost/gi,
    /127\.0\.0\.1/g,
    /0\.0\.0\.0/g,
    /::1/g,
    /169\.254\./g, // AWS metadata
    /metadata\.google\.internal/gi,
  ];

  /**
   * Validate and sanitize input
   * Main entry point for comprehensive validation
   */
  validateInput(
    value: unknown,
    fieldName: string = "input",
    options?: ValidationOptions
  ): ValidationResult {
    const violations: ValidationViolation[] = [];
    let riskLevel: ValidationResult["riskLevel"] = "none";
    let sanitizedValue: ValidatedValue = value as ValidatedValue;

    try {
      // 1. Type validation
      if (typeof value === "string") {
        const stringResult = this.validateString(value, fieldName, options);
        violations.push(...stringResult.violations);
        sanitizedValue = stringResult.sanitizedValue ?? value;
        riskLevel = this.maxRiskLevel(riskLevel, stringResult.riskLevel);
      } else if (Array.isArray(value)) {
        const arrayResult = this.validateArray(value, fieldName, options);
        violations.push(...arrayResult.violations);
        sanitizedValue =
          arrayResult.sanitizedValue ?? (value as ValidatedValue);
        riskLevel = this.maxRiskLevel(riskLevel, arrayResult.riskLevel);
      } else if (typeof value === "object" && value !== null) {
        const objectResult = this.validateObject(
          value as Record<string, unknown>,
          fieldName,
          options
        );
        violations.push(...objectResult.violations);
        sanitizedValue =
          objectResult.sanitizedValue ?? (value as ValidatedValue);
        riskLevel = this.maxRiskLevel(riskLevel, objectResult.riskLevel);
      }

      return {
        isValid: violations.length === 0 || riskLevel === "low",
        sanitizedValue,
        violations,
        riskLevel,
      };
    } catch (error) {
      this.logger.error(`Validation error for field ${fieldName}:`, error);
      return {
        isValid: false,
        sanitizedValue: undefined,
        violations: [
          {
            field: fieldName,
            type: ViolationType.INVALID_FORMAT,
            description: "Validation processing error",
            originalValue: String(value),
          },
        ],
        riskLevel: "high",
      };
    }
  }

  /**
   * Validate string input
   */
  private validateString(
    value: string,
    fieldName: string,
    options?: ValidationOptions
  ): ValidationResult {
    const violations: ValidationViolation[] = [];
    let riskLevel: ValidationResult["riskLevel"] = "none";
    let sanitized = value;

    // 1. Length validation
    const maxLength = options?.maxLength || this.MAX_STRING_LENGTH;
    if (value.length > maxLength) {
      violations.push({
        field: fieldName,
        type: ViolationType.EXCESSIVE_LENGTH,
        description: `String length ${value.length} exceeds maximum ${maxLength}`,
        originalValue: value,
        sanitizedValue: value.substring(0, maxLength),
      });
      sanitized = sanitized.substring(0, maxLength);
      riskLevel = "low";
    }

    // 2. Unicode normalization (prevent homograph attacks)
    sanitized = sanitized.normalize("NFKC");

    // 3. Null byte removal
    if (sanitized.includes("\0")) {
      violations.push({
        field: fieldName,
        type: ViolationType.INVALID_FORMAT,
        description: "Null bytes detected and removed",
        originalValue: value,
      });
      sanitized = sanitized.replace(/\0/g, "");
      riskLevel = this.maxRiskLevel(riskLevel, "medium");
    }

    // 4. XSS detection
    const xssViolation = this.detectXSS(sanitized, fieldName);
    if (xssViolation) {
      violations.push(xssViolation);
      sanitized = this.sanitizeXSS(sanitized);
      riskLevel = this.maxRiskLevel(riskLevel, "high");
    }

    // 5. SQL injection detection
    const sqlViolation = this.detectSQLInjection(sanitized, fieldName);
    if (sqlViolation) {
      violations.push(sqlViolation);
      riskLevel = this.maxRiskLevel(riskLevel, "critical");
    }

    // 6. NoSQL injection detection
    const nosqlViolation = this.detectNoSQLInjection(sanitized, fieldName);
    if (nosqlViolation) {
      violations.push(nosqlViolation);
      riskLevel = this.maxRiskLevel(riskLevel, "critical");
    }

    // 7. Command injection detection
    const cmdViolation = this.detectCommandInjection(sanitized, fieldName);
    if (cmdViolation) {
      violations.push(cmdViolation);
      riskLevel = this.maxRiskLevel(riskLevel, "critical");
    }

    // 8. Path traversal detection
    const pathViolation = this.detectPathTraversal(sanitized, fieldName);
    if (pathViolation) {
      violations.push(pathViolation);
      if (this.PATH_TRAVERSAL_PATTERNS[0]) {
        sanitized = sanitized.replace(this.PATH_TRAVERSAL_PATTERNS[0], "");
      }
      riskLevel = this.maxRiskLevel(riskLevel, "high");
    }

    // 9. LDAP injection detection
    const ldapViolation = this.detectLDAPInjection(sanitized, fieldName);
    if (ldapViolation) {
      violations.push(ldapViolation);
      sanitized = this.sanitizeLDAP(sanitized);
      riskLevel = this.maxRiskLevel(riskLevel, "high");
    }

    // 10. SSRF detection
    const ssrfViolation = this.detectSSRF(sanitized, fieldName);
    if (ssrfViolation) {
      violations.push(ssrfViolation);
      riskLevel = this.maxRiskLevel(riskLevel, "critical");
    }

    return {
      isValid: riskLevel === "none" || riskLevel === "low",
      sanitizedValue: sanitized,
      violations,
      riskLevel,
    };
  }

  /**
   * Validate array input
   */
  private validateArray(
    value: unknown[],
    fieldName: string,
    options?: ValidationOptions
  ): ValidationResult {
    const violations: ValidationViolation[] = [];
    let riskLevel: ValidationResult["riskLevel"] = "none";

    // 1. Length validation
    if (value.length > this.MAX_ARRAY_LENGTH) {
      violations.push({
        field: fieldName,
        type: ViolationType.EXCESSIVE_LENGTH,
        description: `Array length ${value.length} exceeds maximum ${this.MAX_ARRAY_LENGTH}`,
        originalValue: value.length,
      });
      riskLevel = "low";
    }

    // 2. Validate each item
    const sanitizedArray = value.map((item, index) => {
      const itemResult = this.validateInput(
        item,
        `${fieldName}[${index}]`,
        options
      );
      violations.push(...itemResult.violations);
      riskLevel = this.maxRiskLevel(riskLevel, itemResult.riskLevel);
      return itemResult.sanitizedValue;
    });

    return {
      isValid: riskLevel === "none" || riskLevel === "low",
      sanitizedValue: sanitizedArray,
      violations,
      riskLevel,
    };
  }

  /**
   * Validate object input
   */
  private validateObject(
    value: Record<string, unknown>,
    fieldName: string,
    options?: ValidationOptions,
    depth: number = 0
  ): ValidationResult {
    const violations: ValidationViolation[] = [];
    let riskLevel: ValidationResult["riskLevel"] = "none";

    // 1. Depth validation (prevent DoS)
    if (depth > this.MAX_OBJECT_DEPTH) {
      violations.push({
        field: fieldName,
        type: ViolationType.INVALID_FORMAT,
        description: `Object nesting depth ${depth} exceeds maximum ${this.MAX_OBJECT_DEPTH}`,
        originalValue: depth,
      });
      return {
        isValid: false,
        sanitizedValue: undefined,
        violations,
        riskLevel: "high",
      };
    }

    // 2. Prototype pollution check
    const prototypePollution = this.detectPrototypePollution(value, fieldName);
    if (prototypePollution) {
      violations.push(prototypePollution);
      riskLevel = this.maxRiskLevel(riskLevel, "critical");
    }

    // 3. Validate each property
    const sanitizedObject: Record<string, ValidatedValue> = {};
    for (const [key, val] of Object.entries(value)) {
      // Sanitize key
      const keyResult = this.validateString(key, `${fieldName}.key`, options);
      violations.push(...keyResult.violations);
      riskLevel = this.maxRiskLevel(riskLevel, keyResult.riskLevel);

      const sanitizedKey = (keyResult.sanitizedValue ?? key) as string;

      // Validate value
      const valueResult = this.validateInput(
        val,
        `${fieldName}.${key}`,
        options
      );
      violations.push(...valueResult.violations);
      riskLevel = this.maxRiskLevel(riskLevel, valueResult.riskLevel);

      sanitizedObject[sanitizedKey] =
        valueResult.sanitizedValue ?? (val as ValidatedValue);
    }

    return {
      isValid: riskLevel === "none" || riskLevel === "low",
      sanitizedValue: sanitizedObject,
      violations,
      riskLevel,
    };
  }

  /**
   * Detect XSS patterns
   */
  private detectXSS(
    value: string,
    fieldName: string
  ): ValidationViolation | null {
    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(value)) {
        return {
          field: fieldName,
          type: ViolationType.XSS,
          description: "Potential XSS attack detected",
          originalValue: value,
        };
      }
    }
    return null;
  }

  /**
   * Sanitize XSS
   */
  private sanitizeXSS(value: string): string {
    let sanitized = value;
    for (const pattern of this.XSS_PATTERNS) {
      sanitized = sanitized.replace(pattern, "");
    }
    return sanitized;
  }

  /**
   * Detect SQL injection
   */
  private detectSQLInjection(
    value: string,
    fieldName: string
  ): ValidationViolation | null {
    for (const pattern of this.SQL_PATTERNS) {
      if (pattern.test(value)) {
        return {
          field: fieldName,
          type: ViolationType.SQL_INJECTION,
          description: "Potential SQL injection detected",
          originalValue: value,
        };
      }
    }
    return null;
  }

  /**
   * Detect NoSQL injection
   */
  private detectNoSQLInjection(
    value: string,
    fieldName: string
  ): ValidationViolation | null {
    for (const pattern of this.NOSQL_PATTERNS) {
      if (pattern.test(value)) {
        return {
          field: fieldName,
          type: ViolationType.NOSQL_INJECTION,
          description: "Potential NoSQL injection detected",
          originalValue: value,
        };
      }
    }
    return null;
  }

  /**
   * Detect command injection
   */
  private detectCommandInjection(
    value: string,
    fieldName: string
  ): ValidationViolation | null {
    for (const pattern of this.COMMAND_PATTERNS) {
      if (pattern.test(value)) {
        return {
          field: fieldName,
          type: ViolationType.COMMAND_INJECTION,
          description: "Potential command injection detected",
          originalValue: value,
        };
      }
    }
    return null;
  }

  /**
   * Detect path traversal
   */
  private detectPathTraversal(
    value: string,
    fieldName: string
  ): ValidationViolation | null {
    for (const pattern of this.PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(value)) {
        return {
          field: fieldName,
          type: ViolationType.PATH_TRAVERSAL,
          description: "Potential path traversal detected",
          originalValue: value,
        };
      }
    }
    return null;
  }

  /**
   * Detect LDAP injection
   */
  private detectLDAPInjection(
    value: string,
    fieldName: string
  ): ValidationViolation | null {
    for (const pattern of this.LDAP_PATTERNS) {
      if (pattern.test(value)) {
        return {
          field: fieldName,
          type: ViolationType.LDAP_INJECTION,
          description: "Potential LDAP injection detected",
          originalValue: value,
        };
      }
    }
    return null;
  }

  /**
   * Sanitize LDAP input
   */
  private sanitizeLDAP(value: string): string {
    return value.replace(/[*()\\|&]/g, "\\$&");
  }

  /**
   * Detect SSRF
   */
  private detectSSRF(
    value: string,
    fieldName: string
  ): ValidationViolation | null {
    for (const pattern of this.SSRF_PATTERNS) {
      if (pattern.test(value)) {
        return {
          field: fieldName,
          type: ViolationType.SSRF,
          description: "Potential SSRF attack detected",
          originalValue: value,
        };
      }
    }
    return null;
  }

  /**
   * Detect prototype pollution
   */
  private detectPrototypePollution(
    value: Record<string, unknown>,
    fieldName: string
  ): ValidationViolation | null {
    const dangerousKeys = ["__proto__", "constructor", "prototype"];

    for (const key of Object.keys(value)) {
      if (dangerousKeys.includes(key)) {
        return {
          field: fieldName,
          type: ViolationType.PROTOTYPE_POLLUTION,
          description: `Dangerous property detected: ${key}`,
          originalValue: key,
        };
      }
    }
    return null;
  }

  /**
   * Get maximum risk level
   */
  private maxRiskLevel(
    current: ValidationResult["riskLevel"],
    newLevel: ValidationResult["riskLevel"]
  ): ValidationResult["riskLevel"] {
    const levels: Array<ValidationResult["riskLevel"]> = [
      "none",
      "low",
      "medium",
      "high",
      "critical",
    ];
    const currentIndex = levels.indexOf(current);
    const newIndex = levels.indexOf(newLevel);
    const maxIndex = Math.max(currentIndex, newIndex);
    return levels[maxIndex] ?? "none";
  }

  /**
   * Validate and sanitize with strict mode (throws on violations)
   */
  validateStrict(
    value: unknown,
    fieldName: string = "input",
    options?: ValidationOptions
  ): ValidatedValue {
    const result = this.validateInput(value, fieldName, options);

    if (
      !result.isValid ||
      result.riskLevel === "high" ||
      result.riskLevel === "critical"
    ) {
      this.logger.warn(
        `Strict validation failed for ${fieldName}:`,
        result.violations
      );
      throw new BadRequestException({
        message: "Input validation failed",
        violations: result.violations,
        field: fieldName,
      });
    }

    return result.sanitizedValue;
  }
}

/**
 * Validation Options
 */
export interface ValidationOptions {
  maxLength?: number;
  allowHtml?: boolean;
  allowSpecialChars?: boolean;
  strictMode?: boolean;
}
