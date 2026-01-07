/**
 * Data redaction utilities for sensitive information
 */

const SENSITIVE_PATTERNS = {
  email: /[\w.-]+@[\w.-]+\.\w+/g,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  apiKey: /\b[a-z0-9]{32,}\b/gi,
};

export function redactEmail(text: string): string {
  return text.replace(SENSITIVE_PATTERNS.email, "[EMAIL_REDACTED]");
}

export function redactPhone(text: string): string {
  return text.replace(SENSITIVE_PATTERNS.phone, "[PHONE_REDACTED]");
}

export function redactSSN(text: string): string {
  return text.replace(SENSITIVE_PATTERNS.ssn, "[SSN_REDACTED]");
}

export function redactCreditCard(text: string): string {
  return text.replace(SENSITIVE_PATTERNS.creditCard, "[CC_REDACTED]");
}

export function redactApiKey(text: string): string {
  return text.replace(SENSITIVE_PATTERNS.apiKey, "[API_KEY_REDACTED]");
}

export function redactAll(text: string): string {
  let redacted = text;
  redacted = redactEmail(redacted);
  redacted = redactPhone(redacted);
  redacted = redactSSN(redacted);
  redacted = redactCreditCard(redacted);
  redacted = redactApiKey(redacted);
  return redacted;
}

export function maskString(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) {
    return "*".repeat(value.length);
  }
  const masked = "*".repeat(value.length - visibleChars);
  return masked + value.slice(-visibleChars);
}
