import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import * as Joi from "joi";

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  sanitized?: unknown;
}

export interface DeepValidationOptions {
  maxDepth?: number;
  maxArrayLength?: number;
  maxStringLength?: number;
  allowUnknown?: boolean;
}

/**
 * ╔=================================================================================================================╗
 * ║REQUESTVALIDATION                                                                                                ║
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
export class RequestValidationService {
  private readonly logger = new Logger(RequestValidationService.name);

  // SQL injection patterns
  private readonly sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(;|--|\/\*|\*\/|xp_|sp_)/gi,
    /('|('')|;|--|\/\*|\*\/)/gi,
    /(\bOR\b.*=.*|1=1|'=')/gi,
  ];

  // XSS patterns
  private readonly xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /on\w+\s*=\s*["']?[^"']*["']?/gi,
    /javascript:/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi,
    /<img\b[^>]*\s+src\s*=\s*["']?javascript:/gi,
    /<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi,
  ];

  // Path traversal patterns
  private readonly pathTraversalPatterns = [
    /..[/\\]/g,
    /..[/\\]/g,
    /%2e%2e[/\\]/gi,
    /..%2f/gi,
    /..%5c/gi,
  ];

  // Command injection patterns
  private readonly commandInjectionPatterns = [
    /[;&|`$(){}[\]<>]/g,
    /\$\(.*\)/g,
    /`.*`/g,
  ];

  validateWithSchema(data: unknown, schema: Joi.Schema): ValidationResult {
    const result = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    const error = result.error as Joi.ValidationError | undefined;
    const value = result.value as unknown;

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      this.logger.warn(`Schema validation failed: ${errors.join(", ")}`);

      return {
        valid: false,
        errors,
      };
    }

    return {
      valid: true,
      sanitized: value,
    };
  }

  validateDeep(
    data: unknown,
    options?: DeepValidationOptions
  ): ValidationResult {
    const opts: Required<DeepValidationOptions> = {
      maxDepth: options?.maxDepth || 10,
      maxArrayLength: options?.maxArrayLength || 1000,
      maxStringLength: options?.maxStringLength || 10000,
      allowUnknown: options?.allowUnknown !== false,
    };

    const errors: string[] = [];

    const validate = (
      obj: unknown,
      path: string = "",
      depth: number = 0
    ): unknown => {
      if (depth > opts.maxDepth) {
        errors.push(`Maximum depth exceeded at ${path}`);
        return obj;
      }

      if (obj === null || obj === undefined) {
        return obj;
      }

      if (typeof obj === "string") {
        if (obj.length > opts.maxStringLength) {
          errors.push(
            `String too long at ${path} (max: ${opts.maxStringLength})`
          );
        }
        return this.sanitizeString(obj);
      }

      if (Array.isArray(obj)) {
        if (obj.length > opts.maxArrayLength) {
          errors.push(
            `Array too long at ${path} (max: ${opts.maxArrayLength})`
          );
          return obj.slice(0, opts.maxArrayLength);
        }

        return obj.map((item, index) =>
          validate(item, `${path}[${index}]`, depth + 1)
        );
      }

      if (typeof obj === "object") {
        const sanitized: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(obj)) {
          const sanitizedKey = this.sanitizeString(key);
          const newPath = path ? `${path}.${sanitizedKey}` : sanitizedKey;
          sanitized[sanitizedKey] = validate(value, newPath, depth + 1);
        }

        return sanitized;
      }

      return obj;
    };

    try {
      const sanitized = validate(data);

      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        sanitized,
      };
    } catch (error) {
      this.logger.error("Deep validation error", error);
      return {
        valid: false,
        errors: ["Validation failed due to internal error"],
      };
    }
  }

  detectSqlInjection(input: string): boolean {
    if (!input || typeof input !== "string") {
      return false;
    }

    for (const pattern of this.sqlInjectionPatterns) {
      if (pattern.test(input)) {
        this.logger.warn(
          `SQL injection attempt detected: ${input.substring(0, 100)}`
        );
        return true;
      }
    }

    return false;
  }

  detectXss(input: string): boolean {
    if (!input || typeof input !== "string") {
      return false;
    }

    for (const pattern of this.xssPatterns) {
      if (pattern.test(input)) {
        this.logger.warn(`XSS attempt detected: ${input.substring(0, 100)}`);
        return true;
      }
    }

    return false;
  }

  detectPathTraversal(input: string): boolean {
    if (!input || typeof input !== "string") {
      return false;
    }

    for (const pattern of this.pathTraversalPatterns) {
      if (pattern.test(input)) {
        this.logger.warn(`Path traversal attempt detected: ${input}`);
        return true;
      }
    }

    return false;
  }

  detectCommandInjection(input: string): boolean {
    if (!input || typeof input !== "string") {
      return false;
    }

    for (const pattern of this.commandInjectionPatterns) {
      if (pattern.test(input)) {
        this.logger.warn(
          `Command injection attempt detected: ${input.substring(0, 100)}`
        );
        return true;
      }
    }

    return false;
  }

  sanitizeString(input: string): string {
    if (!input || typeof input !== "string") {
      return input;
    }

    // Remove null bytes
    let sanitized = input.replace(/\0/g, "");

    // Remove control characters except newline, tab, and carriage return
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    // Normalize unicode
    sanitized = sanitized.normalize("NFC");

    return sanitized;
  }

  sanitizeHtml(input: string): string {
    if (!input || typeof input !== "string") {
      return input;
    }

    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  validateBusinessRules(
    data: unknown,
    rules: BusinessRule[]
  ): ValidationResult {
    const errors: string[] = [];

    for (const rule of rules) {
      try {
        const result = rule.validate(data);

        if (!result.valid) {
          errors.push(result.message || `Business rule '${rule.name}' failed`);
        }
      } catch (error) {
        this.logger.error(`Business rule '${rule.name}' threw error`, error);
        errors.push(`Business rule '${rule.name}' failed to execute`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  validateAndSanitize(data: unknown, options?: DeepValidationOptions): unknown {
    // Deep validation and sanitization
    const deepResult = this.validateDeep(data, options);

    if (!deepResult.valid) {
      throw new BadRequestException(deepResult.errors?.join(", "));
    }

    // Check for security threats in all string values
    const checkSecurity = (obj: unknown): void => {
      if (typeof obj === "string") {
        if (this.detectSqlInjection(obj)) {
          throw new BadRequestException("SQL injection attempt detected");
        }
        if (this.detectXss(obj)) {
          throw new BadRequestException("XSS attempt detected");
        }
        if (this.detectPathTraversal(obj)) {
          throw new BadRequestException("Path traversal attempt detected");
        }
        if (this.detectCommandInjection(obj)) {
          throw new BadRequestException("Command injection attempt detected");
        }
      } else if (Array.isArray(obj)) {
        obj.forEach(checkSecurity);
      } else if (obj && typeof obj === "object") {
        Object.values(obj).forEach(checkSecurity);
      }
    };

    checkSecurity(deepResult.sanitized);

    return deepResult.sanitized;
  }

  createJoiSchema(definition: SchemaDefinition): Joi.Schema {
    const schema: Record<string, Joi.Schema> = {};

    for (const [field, config] of Object.entries(definition)) {
      let fieldSchema: Joi.Schema;

      switch (config.type) {
        case "string":
          fieldSchema = Joi.string();
          if (config.min)
            fieldSchema = (fieldSchema as Joi.StringSchema).min(
              config.min as number
            );
          if (config.max)
            fieldSchema = (fieldSchema as Joi.StringSchema).max(
              config.max as number
            );
          if (config.pattern)
            fieldSchema = (fieldSchema as Joi.StringSchema).pattern(
              config.pattern
            );
          if (config.email)
            fieldSchema = (fieldSchema as Joi.StringSchema).email();
          if (config.uri) fieldSchema = (fieldSchema as Joi.StringSchema).uri();
          break;

        case "number":
          fieldSchema = Joi.number();
          if (config.min !== undefined)
            fieldSchema = (fieldSchema as Joi.NumberSchema).min(
              config.min as number
            );
          if (config.max !== undefined)
            fieldSchema = (fieldSchema as Joi.NumberSchema).max(
              config.max as number
            );
          if (config.integer)
            fieldSchema = (fieldSchema as Joi.NumberSchema).integer();
          if (config.positive)
            fieldSchema = (fieldSchema as Joi.NumberSchema).positive();
          break;

        case "boolean":
          fieldSchema = Joi.boolean();
          break;

        case "date":
          fieldSchema = Joi.date();
          if (config.min)
            fieldSchema = (fieldSchema as Joi.DateSchema).min(config.min);
          if (config.max)
            fieldSchema = (fieldSchema as Joi.DateSchema).max(config.max);
          break;

        case "array":
          fieldSchema = Joi.array();
          if (config.items)
            fieldSchema = (fieldSchema as Joi.ArraySchema).items(config.items);
          if (config.min)
            fieldSchema = (fieldSchema as Joi.ArraySchema).min(
              config.min as number
            );
          if (config.max)
            fieldSchema = (fieldSchema as Joi.ArraySchema).max(
              config.max as number
            );
          break;

        case "object":
          fieldSchema = Joi.object(config.properties || {});
          break;

        default:
          fieldSchema = Joi.any();
      }

      if (config.required) {
        fieldSchema = fieldSchema.required();
      } else {
        fieldSchema = fieldSchema.optional();
      }

      if (config.default !== undefined) {
        fieldSchema = fieldSchema.default(config.default);
      }

      schema[field] = fieldSchema;
    }

    return Joi.object(schema);
  }
}

export interface BusinessRule {
  name: string;
  validate: (data: unknown) => { valid: boolean; message?: string };
}

export interface SchemaDefinition {
  [field: string]: FieldConfig;
}

export interface FieldConfig {
  type: "string" | "number" | "boolean" | "date" | "array" | "object";
  required?: boolean;
  min?: number | Date;
  max?: number | Date;
  pattern?: RegExp;
  email?: boolean;
  uri?: boolean;
  integer?: boolean;
  positive?: boolean;
  items?: Joi.Schema;
  properties?: Record<string, Joi.Schema>;
  default?: unknown;
}
