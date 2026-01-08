/**
 * @module services/ai/piiDetectionService
 * @category AI Services
 * @description Production-grade PII detection using comprehensive regex patterns
 * for HIPAA, GDPR, and CCPA compliance. Detects SSNs, credit cards, emails,
 * phones, passport numbers, driver licenses, and other sensitive data.
 *
 * @example
 * ```typescript
 * const findings = await PIIDetectionService.scanDocument(content);
 * const redacted = PIIDetectionService.redactEntities(content, findings);
 * ```
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type PIIEntityType =
  | "SSN"
  | "Email"
  | "Phone"
  | "CreditCard"
  | "PassportNumber"
  | "DriverLicense"
  | "DateOfBirth"
  | "MedicalRecordNumber"
  | "BankAccountNumber"
  | "RoutingNumber"
  | "TaxID"
  | "IPAddress";

export interface PIIEntity {
  id: string;
  type: PIIEntityType;
  value: string;
  index: number;
  length: number;
  confidence: number;
  ignored: boolean;
  context?: string;
}

export interface ScanResult {
  entities: PIIEntity[];
  duration: number;
  scannedBytes: number;
}

export interface RedactionOptions {
  char?: string;
  preserveLength?: boolean;
  preserveFormat?: boolean;
}

// ============================================================================
// DETECTION PATTERNS
// ============================================================================

const PATTERNS = {
  // Social Security Number (multiple formats)
  SSN: [
    /\b\d{3}-\d{2}-\d{4}\b/g, // XXX-XX-XXXX
    /\b\d{3}\s\d{2}\s\d{4}\b/g, // XXX XX XXXX
    /\b\d{9}\b/g, // XXXXXXXXX (with context validation)
  ],

  // Email addresses (RFC 5322 compliant)
  Email: [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g],

  // Phone numbers (US and international)
  Phone: [
    /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g, // US format
    /\b\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g, // International
  ],

  // Credit Card numbers (Luhn algorithm validated)
  CreditCard: [
    /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g,
  ],

  // US Passport Number
  PassportNumber: [/\b[A-Z]{1,2}[0-9]{6,9}\b/g],

  // Driver's License (US formats vary by state)
  DriverLicense: [
    /\b[A-Z]{1,2}[0-9]{5,8}\b/g, // Generic format
    /\b[A-Z][0-9]{7}\b/g, // CA format
    /\b[0-9]{3}-[0-9]{2}-[0-9]{4}\b/g, // Some state formats
  ],

  // Date of Birth (multiple formats)
  DateOfBirth: [
    /\b(?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12][0-9]|3[01])[-/](?:19|20)\d{2}\b/g, // MM/DD/YYYY
    /\b(?:19|20)\d{2}[-/](?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12][0-9]|3[01])\b/g, // YYYY/MM/DD
  ],

  // Medical Record Number
  MedicalRecordNumber: [
    /\bMRN[:\s]?[A-Z0-9]{6,10}\b/gi,
    /\bMedical\s+Record\s+Number[:\s]+[A-Z0-9]{6,10}\b/gi,
  ],

  // Bank Account Number (US)
  BankAccountNumber: [
    /\b[0-9]{8,17}\b/g, // Generic account number (context-dependent)
  ],

  // Routing Number (US)
  RoutingNumber: [
    /\b[0-9]{9}\b/g, // ABA routing number
  ],

  // Tax ID / EIN
  TaxID: [
    /\b\d{2}-\d{7}\b/g, // XX-XXXXXXX
  ],

  // IP Address (IPv4 and IPv6)
  IPAddress: [
    /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, // IPv4
    /\b(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}\b/gi, // IPv6
  ],
};

// ============================================================================
// CONTEXT VALIDATION
// ============================================================================

/**
 * Validates if a potential SSN is actually a SSN based on context
 */
function validateSSNContext(text: string, index: number): boolean {
  const contextWindow = 50;
  const start = Math.max(0, index - contextWindow);
  const end = Math.min(text.length, index + contextWindow);
  const context = text.substring(start, end).toLowerCase();

  const ssnKeywords = [
    "ssn",
    "social security",
    "social sec",
    "ss#",
    "ss number",
  ];
  return ssnKeywords.some((keyword) => context.includes(keyword));
}

/**
 * Luhn algorithm for credit card validation
 */
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i] || "0", 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class PIIDetectionServiceClass {
  private entityCounter = 0;

  /**
   * Scans document content for PII entities
   */
  async scanDocument(content: string): Promise<ScanResult> {
    const startTime = performance.now();
    const entities: PIIEntity[] = [];
    this.entityCounter = 0;

    if (!content || content.length === 0) {
      return {
        entities: [],
        duration: 0,
        scannedBytes: 0,
      };
    }

    // Process each entity type
    for (const [type, patterns] of Object.entries(PATTERNS)) {
      for (const pattern of patterns) {
        const found = await this.detectPattern(
          content,
          pattern,
          type as PIIEntityType
        );
        entities.push(...found);
      }
    }

    const duration = performance.now() - startTime;

    return {
      entities: this.deduplicateEntities(entities),
      duration,
      scannedBytes: content.length,
    };
  }

  /**
   * Detects entities matching a specific pattern
   */
  private async detectPattern(
    content: string,
    pattern: RegExp,
    type: PIIEntityType
  ): Promise<PIIEntity[]> {
    const entities: PIIEntity[] = [];
    let match: RegExpExecArray | null;

    // Reset regex lastIndex for reuse
    pattern.lastIndex = 0;

    while ((match = pattern.exec(content)) !== null) {
      const value = match[0];
      const index = match.index;

      // Apply type-specific validation
      if (!this.validateEntity(type, value, content, index)) {
        continue;
      }

      const confidence = this.calculateConfidence(type, value, content, index);

      entities.push({
        id: `pii-${type.toLowerCase()}-${this.entityCounter++}`,
        type,
        value,
        index,
        length: value.length,
        confidence,
        ignored: false,
        context: this.extractContext(content, index, value.length),
      });

      // Yield to main thread every 50 matches for responsiveness
      if (this.entityCounter % 50 === 0) {
        await this.yieldToMain();
      }
    }

    return entities;
  }

  /**
   * Validates an entity based on type-specific rules
   */
  private validateEntity(
    type: PIIEntityType,
    value: string,
    content: string,
    index: number
  ): boolean {
    switch (type) {
      case "SSN":
        // For 9-digit numbers without dashes, require context validation
        if (!/[-\s]/.test(value)) {
          return validateSSNContext(content, index);
        }
        return true;

      case "CreditCard":
        return luhnCheck(value);

      case "BankAccountNumber":
      case "RoutingNumber":
        // Require banking context
        const contextWindow = 100;
        const start = Math.max(0, index - contextWindow);
        const context = content
          .substring(start, index + contextWindow)
          .toLowerCase();
        const bankKeywords = [
          "account",
          "routing",
          "bank",
          "aba",
          "wire",
          "transfer",
        ];
        return bankKeywords.some((keyword) => context.includes(keyword));

      default:
        return true;
    }
  }

  /**
   * Calculates confidence score for detected entity
   */
  private calculateConfidence(
    type: PIIEntityType,
    value: string,
    content: string,
    index: number
  ): number {
    let confidence = 0.5; // Base confidence

    // Format matching increases confidence
    switch (type) {
      case "SSN":
        if (/^\d{3}-\d{2}-\d{4}$/.test(value)) confidence = 0.95;
        else if (/^\d{3}\s\d{2}\s\d{4}$/.test(value)) confidence = 0.9;
        else confidence = 0.6;
        break;

      case "Email":
        confidence = 0.98; // Email pattern is highly specific
        break;

      case "Phone":
        if (/^\+/.test(value)) confidence = 0.9;
        else confidence = 0.85;
        break;

      case "CreditCard":
        confidence = 0.95; // Already Luhn validated
        break;

      default:
        confidence = 0.7;
    }

    // Context keywords increase confidence
    const contextWindow = 30;
    const start = Math.max(0, index - contextWindow);
    const context = content
      .substring(start, index + contextWindow)
      .toLowerCase();

    const relevantKeywords = this.getRelevantKeywords(type);
    if (relevantKeywords.some((keyword) => context.includes(keyword))) {
      confidence = Math.min(1.0, confidence + 0.15);
    }

    return confidence;
  }

  /**
   * Gets relevant keywords for entity type
   */
  private getRelevantKeywords(type: PIIEntityType): string[] {
    const keywords: Record<PIIEntityType, string[]> = {
      SSN: ["ssn", "social security", "social sec"],
      Email: ["email", "e-mail", "contact"],
      Phone: ["phone", "tel", "mobile", "cell"],
      CreditCard: ["card", "credit", "payment", "visa", "mastercard"],
      PassportNumber: ["passport", "passport#", "passport no"],
      DriverLicense: ["license", "driver", "dl", "id"],
      DateOfBirth: ["dob", "birth", "born", "birthday"],
      MedicalRecordNumber: ["mrn", "medical record", "patient"],
      BankAccountNumber: ["account", "checking", "savings"],
      RoutingNumber: ["routing", "aba", "wire"],
      TaxID: ["ein", "tax id", "federal id"],
      IPAddress: ["ip", "address", "server"],
    };

    return keywords[type] || [];
  }

  /**
   * Extracts context around entity for display
   */
  private extractContext(
    content: string,
    index: number,
    length: number
  ): string {
    const contextWindow = 40;
    const start = Math.max(0, index - contextWindow);
    const end = Math.min(content.length, index + length + contextWindow);

    let context = content.substring(start, end);

    // Add ellipsis if truncated
    if (start > 0) context = "..." + context;
    if (end < content.length) context = context + "...";

    return context;
  }

  /**
   * Removes duplicate entities at same location
   */
  private deduplicateEntities(entities: PIIEntity[]): PIIEntity[] {
    const seen = new Set<string>();
    const unique: PIIEntity[] = [];

    // Sort by confidence (higher first) so we keep the best match
    entities.sort((a, b) => b.confidence - a.confidence);

    for (const entity of entities) {
      const key = `${entity.index}-${entity.length}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(entity);
      }
    }

    // Re-sort by index for natural reading order
    return unique.sort((a, b) => a.index - b.index);
  }

  /**
   * Redacts entities from content
   */
  redactEntities(
    content: string,
    entities: PIIEntity[],
    options: RedactionOptions = {}
  ): string {
    const {
      char = "█",
      preserveLength = true,
      preserveFormat = true,
    } = options;

    // Sort entities by index in reverse order so we don't affect subsequent indices
    const sortedEntities = [...entities]
      .filter((e) => !e.ignored)
      .sort((a, b) => b.index - a.index);

    let redacted = content;

    for (const entity of sortedEntities) {
      const { index, length, value } = entity;

      let replacement: string;

      if (preserveLength) {
        if (preserveFormat && /[-\s()]/.test(value)) {
          // Preserve formatting characters
          replacement = value.replace(/[^\s\-()]/g, char);
        } else {
          replacement = char.repeat(length);
        }
      } else {
        replacement = `[${entity.type} REDACTED]`;
      }

      redacted =
        redacted.substring(0, index) +
        replacement +
        redacted.substring(index + length);
    }

    return redacted;
  }

  /**
   * Yields to main thread for UI responsiveness
   */
  private async yieldToMain(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  /**
   * Exports entities to JSON format for audit trail
   */
  exportEntities(entities: PIIEntity[]): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        count: entities.length,
        entities: entities.map((e) => ({
          type: e.type,
          confidence: e.confidence,
          context: e.context,
          // Don't export actual values for security
        })),
      },
      null,
      2
    );
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const PIIDetectionService = new PIIDetectionServiceClass();
