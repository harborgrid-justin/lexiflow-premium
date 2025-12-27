import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface MaskingRule {
  field: string;
  strategy: 'full' | 'partial' | 'hash' | 'tokenize' | 'format-preserving' | 'email' | 'phone' | 'ssn' | 'creditcard';
  preserveLength?: boolean;
  visibleChars?: number;
  visibleStart?: number;
  visibleEnd?: number;
  maskChar?: string;
}

export interface MaskingConfig {
  rules: MaskingRule[];
  defaultStrategy: MaskingRule['strategy'];
  enableReversible: boolean;
}

interface TokenMapping {
  original: string;
  token: string;
  timestamp: Date;
}

@Injectable()
export class DataMaskingService {
  private readonly logger = new Logger(DataMaskingService.name);
  private readonly tokenMappings: Map<string, TokenMapping> = new Map();
  private readonly maskChar = '*';
  private readonly reversibleKey: Buffer;

  private readonly defaultRules: MaskingRule[] = [
    { field: 'ssn', strategy: 'ssn' },
    { field: 'socialSecurityNumber', strategy: 'ssn' },
    { field: 'creditCard', strategy: 'creditcard' },
    { field: 'creditCardNumber', strategy: 'creditcard' },
    { field: 'cardNumber', strategy: 'creditcard' },
    { field: 'email', strategy: 'email' },
    { field: 'phone', strategy: 'phone' },
    { field: 'phoneNumber', strategy: 'phone' },
    { field: 'password', strategy: 'full' },
    { field: 'apiKey', strategy: 'partial', visibleStart: 4, visibleEnd: 4 },
    { field: 'token', strategy: 'partial', visibleEnd: 8 },
    { field: 'barNumber', strategy: 'partial', visibleStart: 3, visibleEnd: 3 },
  ];

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('MASKING_KEY') ||
      this.configService.get<string>('ENCRYPTION_KEY') ||
      'default-masking-key-change-in-production';

    this.reversibleKey = crypto.scryptSync(key, 'masking-salt', 32);
  }

  maskData(data: any, rules?: MaskingRule[]): any {
    if (data === null || data === undefined) {
      return data;
    }

    const maskingRules = rules || this.defaultRules;

    if (typeof data === 'string') {
      return this.maskString(data, 'partial');
    }

    if (Array.isArray(data)) {
      return data.map(item => this.maskData(item, maskingRules));
    }

    if (typeof data === 'object') {
      return this.maskObject(data, maskingRules);
    }

    return data;
  }

  private maskObject(obj: Record<string, any>, rules: MaskingRule[]): Record<string, any> {
    const masked: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      const rule = rules.find(r => r.field.toLowerCase() === key.toLowerCase());

      if (rule && typeof value === 'string') {
        masked[key] = this.applyMaskingStrategy(value, rule);
      } else if (value !== null && typeof value === 'object') {
        masked[key] = this.maskData(value, rules);
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }

  private applyMaskingStrategy(value: string, rule: MaskingRule): string {
    switch (rule.strategy) {
      case 'full':
        return this.maskFull(value, rule.maskChar);
      case 'partial':
        return this.maskPartial(value, rule);
      case 'hash':
        return this.maskHash(value);
      case 'tokenize':
        return this.maskTokenize(value);
      case 'format-preserving':
        return this.maskFormatPreserving(value);
      case 'email':
        return this.maskEmail(value);
      case 'phone':
        return this.maskPhone(value);
      case 'ssn':
        return this.maskSSN(value);
      case 'creditcard':
        return this.maskCreditCard(value);
      default:
        return this.maskPartial(value, rule);
    }
  }

  private maskString(value: string, strategy: MaskingRule['strategy'] = 'partial'): string {
    const rule: MaskingRule = { field: '', strategy, visibleStart: 0, visibleEnd: 4 };
    return this.applyMaskingStrategy(value, rule);
  }

  private maskFull(value: string, maskChar: string = this.maskChar): string {
    return maskChar.repeat(value.length);
  }

  private maskPartial(value: string, rule: MaskingRule): string {
    if (value.length === 0) return value;

    const start = rule.visibleStart || 0;
    const end = rule.visibleEnd || 4;
    const maskCharacter = rule.maskChar || this.maskChar;

    if (value.length <= start + end) {
      return maskCharacter.repeat(value.length);
    }

    const visiblePrefix = value.substring(0, start);
    const visibleSuffix = value.substring(value.length - end);
    const maskedMiddle = maskCharacter.repeat(value.length - start - end);

    return visiblePrefix + maskedMiddle + visibleSuffix;
  }

  private maskHash(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex').substring(0, 16);
  }

  private maskTokenize(value: string): string {
    const existingMapping = Array.from(this.tokenMappings.values())
      .find(m => m.original === value);

    if (existingMapping) {
      return existingMapping.token;
    }

    const token = `TKN-${crypto.randomBytes(16).toString('hex')}`;
    this.tokenMappings.set(token, {
      original: value,
      token,
      timestamp: new Date(),
    });

    return token;
  }

  private maskFormatPreserving(value: string): string {
    return value.replace(/[a-zA-Z]/g, 'X').replace(/[0-9]/g, '0');
  }

  maskEmail(value: string): string {
    if (!value || !value.includes('@')) {
      return value;
    }

    const [localPart, domain] = value.split('@');

    if (localPart.length <= 2) {
      return `${this.maskChar.repeat(localPart.length)}@${domain}`;
    }

    const visibleChars = Math.min(2, localPart.length - 1);
    const maskedLocal = localPart.substring(0, visibleChars) +
      this.maskChar.repeat(localPart.length - visibleChars);

    return `${maskedLocal}@${domain}`;
  }

  maskPhone(value: string): string {
    const digits = value.replace(/\D/g, '');

    if (digits.length === 0) {
      return value;
    }

    if (digits.length === 10) {
      return `(${this.maskChar.repeat(3)}) ${this.maskChar.repeat(3)}-${digits.substring(6)}`;
    }

    if (digits.length === 11) {
      return `+${digits[0]} (${this.maskChar.repeat(3)}) ${this.maskChar.repeat(3)}-${digits.substring(7)}`;
    }

    const visible = digits.substring(digits.length - 4);
    return this.maskChar.repeat(digits.length - 4) + visible;
  }

  maskSSN(value: string): string {
    const digits = value.replace(/\D/g, '');

    if (digits.length !== 9) {
      return this.maskChar.repeat(value.length);
    }

    return `${this.maskChar.repeat(3)}-${this.maskChar.repeat(2)}-${digits.substring(5)}`;
  }

  maskCreditCard(value: string): string {
    const digits = value.replace(/\D/g, '');

    if (digits.length < 13 || digits.length > 19) {
      return this.maskChar.repeat(value.length);
    }

    const lastFour = digits.substring(digits.length - 4);
    const masked = this.maskChar.repeat(digits.length - 4);

    if (value.includes(' ')) {
      const groups = [];
      for (let i = 0; i < masked.length; i += 4) {
        groups.push(this.maskChar.repeat(4));
      }
      return `${groups.join(' ')} ${lastFour}`;
    }

    return masked + lastFour;
  }

  maskForLogging(data: any): any {
    const loggingRules: MaskingRule[] = [
      { field: 'password', strategy: 'full' },
      { field: 'token', strategy: 'full' },
      { field: 'apiKey', strategy: 'partial', visibleEnd: 4 },
      { field: 'ssn', strategy: 'ssn' },
      { field: 'creditCard', strategy: 'creditcard' },
      { field: 'email', strategy: 'email' },
      { field: 'phone', strategy: 'phone' },
    ];

    return this.maskData(data, loggingRules);
  }

  maskForExport(data: any, exportType: 'public' | 'internal' | 'restricted' = 'public'): any {
    let rules: MaskingRule[];

    switch (exportType) {
      case 'public':
        rules = [
          { field: 'ssn', strategy: 'full' },
          { field: 'creditCard', strategy: 'full' },
          { field: 'password', strategy: 'full' },
          { field: 'token', strategy: 'full' },
          { field: 'apiKey', strategy: 'full' },
          { field: 'email', strategy: 'email' },
          { field: 'phone', strategy: 'phone' },
        ];
        break;

      case 'internal':
        rules = [
          { field: 'ssn', strategy: 'ssn' },
          { field: 'creditCard', strategy: 'creditcard' },
          { field: 'password', strategy: 'full' },
          { field: 'token', strategy: 'partial', visibleEnd: 8 },
        ];
        break;

      case 'restricted':
        rules = [
          { field: 'password', strategy: 'full' },
          { field: 'token', strategy: 'full' },
        ];
        break;

      default:
        rules = this.defaultRules;
    }

    return this.maskData(data, rules);
  }

  reversibleMask(value: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', this.reversibleKey, iv);

      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      this.logger.error('Reversible masking failed', error);
      return this.maskFull(value);
    }
  }

  reversibleUnmask(maskedValue: string, isAuthorized: boolean): string {
    if (!isAuthorized) {
      return maskedValue;
    }

    try {
      const [ivHex, encrypted] = maskedValue.split(':');

      if (!ivHex || !encrypted) {
        return maskedValue;
      }

      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.reversibleKey, iv);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Reversible unmasking failed', error);
      return maskedValue;
    }
  }

  detokenize(token: string): string | null {
    const mapping = this.tokenMappings.get(token);
    return mapping ? mapping.original : null;
  }

  clearTokenCache(): void {
    this.tokenMappings.clear();
    this.logger.log('Token cache cleared');
  }

  getTokenCacheSize(): number {
    return this.tokenMappings.size;
  }

  createCustomRule(field: string, strategy: MaskingRule['strategy'], options?: Partial<MaskingRule>): MaskingRule {
    return {
      field,
      strategy,
      ...options,
    };
  }
}
