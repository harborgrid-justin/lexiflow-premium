# VALIDATION QUICK REFERENCE GUIDE
**For LexiFlow Premium Developers**

Quick reference for implementing proper DTO validation based on the enterprise audit findings.

---

## VALIDATION CHECKLIST

Before committing any DTO, verify:

- [ ] All required fields have `@IsNotEmpty()`
- [ ] All strings have `@MaxLength()`
- [ ] All UUIDs use `@IsUUID()` not `@IsString()`
- [ ] All nested objects have `@ValidateNested()` + `@Type()`
- [ ] All arrays have element validation (`{ each: true }`)
- [ ] All emails use `@NormalizeEmail()`
- [ ] All passwords use `@IsStrongPassword()`
- [ ] All enums use `@IsEnum()`
- [ ] All dates use `@IsDate()` + `@Type(() => Date)`
- [ ] All numbers from query params use `@Type(() => Number)`
- [ ] No `Record<string, unknown>` without `@IsSafeObject()`

---

## COMMON PATTERNS

### String Field (Required)
```typescript
@IsString()
@IsNotEmpty()
@MaxLength(255)
@Transform(({ value }) => value.trim())
title!: string;
```

### String Field (Optional)
```typescript
@IsOptional()
@IsString()
@MaxLength(5000)
@Transform(({ value }) => value?.trim())
description?: string;
```

### Email Field
```typescript
@IsEmail()
@Transform(({ value }) => value.toLowerCase().trim())
email!: string;
```

### Password Field
```typescript
import { IsStrongPassword } from '@/common/decorators/is-strong-password.decorator';

@IsString()
@MinLength(8)
@MaxLength(128)
@IsStrongPassword()
password!: string;
```

### UUID Field
```typescript
@IsUUID()
caseId!: string;
```

### Enum Field
```typescript
@IsEnum(CaseStatus)
@IsOptional()
status?: CaseStatus;
```

### Date Field
```typescript
@IsDate()
@Type(() => Date)
@IsOptional()
filingDate?: Date;
```

### Number Field (Body)
```typescript
@IsNumber()
@Min(0)
@Max(1000000)
amount!: number;
```

### Number Field (Query Param)
```typescript
@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
page?: number = 1;
```

### Boolean Field (Query Param)
```typescript
@IsOptional()
@Transform(({ value }) => value === 'true' || value === true)
@IsBoolean()
isActive?: boolean;
```

### Array of Strings
```typescript
@IsArray()
@ArrayMaxSize(100)
@IsString({ each: true })
@MaxLength(100, { each: true })
tags?: string[];
```

### Array of UUIDs
```typescript
@IsArray()
@ArrayMaxSize(1000)
@IsUUID('4', { each: true })
relatedCaseIds?: string[];
```

### Nested Object
```typescript
// First create the nested DTO:
export class AddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  street!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  state!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}(-\d{4})?$/)
  zipCode!: string;
}

// Then use it:
@ValidateNested()
@Type(() => AddressDto)
address!: AddressDto;
```

### Array of Nested Objects
```typescript
@IsArray()
@ArrayMaxSize(50)
@ValidateNested({ each: true })
@Type(() => AttorneyDto)
attorneys?: AttorneyDto[];
```

### Safe Dynamic Object
```typescript
import { IsSafeObject } from '@/common/validators/sanitize-object.validator';

@IsOptional()
@IsSafeObject()
@Transform(({ value }) => sanitizeObject(value))
metadata?: Record<string, unknown>;
```

### URL Field
```typescript
@IsUrl({ protocols: ['http', 'https'], require_protocol: true })
@IsOptional()
website?: string;
```

### Phone Number Field
```typescript
@IsOptional()
@IsPhoneNumber('US')
phone?: string;
```

### HTML Content (Sanitized)
```typescript
import { SanitizeHtml } from '@/common/decorators/sanitize.decorator';

@IsString()
@IsOptional()
@MaxLength(10000)
@SanitizeHtml()
notes?: string;
```

### Sort Field (Whitelisted)
```typescript
const ALLOWED_SORT_FIELDS = ['id', 'createdAt', 'updatedAt', 'title'] as const;

@IsOptional()
@IsEnum(ALLOWED_SORT_FIELDS)
sortBy?: typeof ALLOWED_SORT_FIELDS[number];
```

---

## ANTI-PATTERNS (DON'T DO THIS)

### ❌ BAD: String without MaxLength
```typescript
@IsString()
description?: string;  // UNBOUNDED - DoS risk!
```

### ❌ BAD: Required field without IsNotEmpty
```typescript
@IsString()
title!: string;  // Accepts empty string!
```

### ❌ BAD: UUID as String
```typescript
@IsString()
caseId!: string;  // Not validating UUID format!
```

### ❌ BAD: Nested object without validation
```typescript
address?: {  // No validation!
  street: string;
  city: string;
};
```

### ❌ BAD: Array without element validation
```typescript
@IsArray()
tags?: string[];  // Could be array of numbers!
```

### ❌ BAD: Unvalidated Record<string, unknown>
```typescript
metadata?: Record<string, unknown>;  // Prototype pollution risk!
```

### ❌ BAD: Date as String
```typescript
@IsString()
filingDate!: string;  // No date validation!
```

### ❌ BAD: Number without Type transform (query param)
```typescript
@IsNumber()
page?: number;  // Will be string "1", not number 1
```

### ❌ BAD: Weak password validation
```typescript
@MinLength(8)
password!: string;  // "aaaaaaaa" passes!
```

### ❌ BAD: Unwhitelisted sort field
```typescript
@IsString()
sortBy?: string;  // SQL injection risk!
```

---

## VALIDATION DECORATOR REFERENCE

### Basic Type Validators
- `@IsString()` - Validates string type
- `@IsNumber()` - Validates number type
- `@IsInt()` - Validates integer
- `@IsBoolean()` - Validates boolean
- `@IsArray()` - Validates array
- `@IsObject()` - Validates object
- `@IsDate()` - Validates Date object

### String Validators
- `@IsNotEmpty()` - Rejects empty strings
- `@MinLength(n)` - Minimum string length
- `@MaxLength(n)` - Maximum string length
- `@Matches(regex)` - Regex pattern match
- `@IsEmail()` - Email format
- `@IsUrl()` - URL format
- `@IsUUID()` - UUID format
- `@IsPhoneNumber()` - Phone number format

### Number Validators
- `@Min(n)` - Minimum value
- `@Max(n)` - Maximum value
- `@IsPositive()` - Must be > 0
- `@IsNegative()` - Must be < 0
- `@IsDivisibleBy(n)` - Divisible by n

### Date Validators
- `@IsDate()` - Date object
- `@IsDateString()` - ISO 8601 string
- `@MinDate(date)` - Minimum date
- `@MaxDate(date)` - Maximum date

### Array Validators
- `@ArrayMinSize(n)` - Minimum array length
- `@ArrayMaxSize(n)` - Maximum array length
- `@ArrayUnique()` - Unique elements
- `@ArrayNotEmpty()` - Non-empty array

### Object Validators
- `@ValidateNested()` - Validate nested object
- `@IsDefined()` - Cannot be undefined
- `@IsOptional()` - Can be undefined/null

### Enum Validators
- `@IsEnum(enum)` - Must be enum value
- `@IsIn(array)` - Must be in array

### Conditional Validators
- `@ValidateIf(condition)` - Conditional validation
- `@ValidateBy(fn)` - Custom validation function

### Custom Validators (Create These)
- `@IsStrongPassword()` - Enforce password complexity
- `@IsSafeObject()` - Prevent prototype pollution
- `@SanitizeHtml()` - Strip HTML tags
- `@NormalizeEmail()` - Lowercase + trim email
- `@IsSafeSortField(fields)` - Whitelist sort fields

---

## TRANSFORMATION DECORATORS

### class-transformer
- `@Type(() => Class)` - Transform to class instance
- `@Transform(fn)` - Custom transformation
- `@Exclude()` - Exclude from transformation
- `@Expose()` - Include in transformation

### Common Transformations
```typescript
// Trim whitespace
@Transform(({ value }) => value?.trim())

// Lowercase
@Transform(({ value }) => value?.toLowerCase())

// Parse number from string
@Type(() => Number)

// Parse date from string
@Type(() => Date)

// Parse boolean from string
@Transform(({ value }) => value === 'true' || value === true)

// Sanitize object
@Transform(({ value }) => sanitizeObject(value))

// Strip HTML
@Transform(({ value }) => sanitizeHtml(value))
```

---

## VALIDATION ERROR MESSAGES

### Default Messages
```typescript
@MaxLength(100)
title!: string;
// Error: "title must be shorter than or equal to 100 characters"
```

### Custom Messages
```typescript
@MaxLength(100, { message: 'Case title is too long (max 100 characters)' })
title!: string;

@IsEnum(CaseStatus, { message: 'Invalid case status' })
status!: CaseStatus;

@Matches(/^\d{5}(-\d{4})?$/, { message: 'Invalid US ZIP code format' })
zipCode!: string;
```

### Error Contexts
```typescript
@Min(0, { message: 'Amount must be non-negative', context: { errorCode: 'AMOUNT_NEGATIVE' } })
amount!: number;
```

---

## VALIDATION GROUPS

For different validation contexts:

```typescript
export class UpdateUserDto {
  @IsEmail({ groups: ['email'] })
  email?: string;

  @IsStrongPassword({ groups: ['password'] })
  password?: string;
}

// Validate only email:
validate(dto, { groups: ['email'] });

// Validate only password:
validate(dto, { groups: ['password'] });
```

---

## CONDITIONAL VALIDATION

```typescript
export class FeeAgreementDto {
  @IsEnum(FeeAgreementType)
  agreementType!: FeeAgreementType;

  // Only validate if agreementType is HOURLY
  @ValidateIf(o => o.agreementType === FeeAgreementType.HOURLY)
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  // Only validate if agreementType is FIXED
  @ValidateIf(o => o.agreementType === FeeAgreementType.FIXED)
  @IsNumber()
  @Min(0)
  fixedFeeAmount?: number;

  // Only validate if agreementType is CONTINGENCY
  @ValidateIf(o => o.agreementType === FeeAgreementType.CONTINGENCY)
  @IsNumber()
  @Min(0)
  @Max(100)
  contingencyPercentage?: number;
}
```

---

## TESTING VALIDATION

### Unit Test Example
```typescript
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCaseDto } from './create-case.dto';

describe('CreateCaseDto', () => {
  it('should validate valid case', async () => {
    const dto = plainToInstance(CreateCaseDto, {
      title: 'Test Case',
      caseNumber: 'CASE-2025-001',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject empty title', async () => {
    const dto = plainToInstance(CreateCaseDto, {
      title: '',
      caseNumber: 'CASE-2025-001',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should reject title exceeding max length', async () => {
    const dto = plainToInstance(CreateCaseDto, {
      title: 'A'.repeat(256),
      caseNumber: 'CASE-2025-001',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should validate nested relatedCases', async () => {
    const dto = plainToInstance(CreateCaseDto, {
      title: 'Test Case',
      caseNumber: 'CASE-2025-001',
      relatedCases: [
        { court: 'Test Court', caseNumber: 'TEST-001' }
      ],
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject malformed relatedCases', async () => {
    const dto = plainToInstance(CreateCaseDto, {
      title: 'Test Case',
      caseNumber: 'CASE-2025-001',
      relatedCases: [
        { court: '', caseNumber: '' }
      ],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
```

---

## ESLINT RULES (Recommended)

Add to `.eslintrc.js`:

```javascript
{
  rules: {
    // Require @IsNotEmpty on required fields
    '@typescript-eslint/no-unsafe-assignment': 'error',

    // Warn on untyped Record<string, unknown>
    '@typescript-eslint/no-explicit-any': 'warn',

    // Custom rules (requires plugin):
    'validation/require-is-not-empty': 'error',
    'validation/require-max-length': 'error',
    'validation/require-uuid-validation': 'error',
    'validation/require-nested-validation': 'error',
  }
}
```

---

## PRE-COMMIT HOOK

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for common validation issues
echo "🔍 Checking DTO validation..."

# Find DTOs with required fields lacking @IsNotEmpty
git diff --cached --name-only | grep "dto.ts$" | while read file; do
  if grep -q "!: string" "$file" && ! grep -q "@IsNotEmpty()" "$file"; then
    echo "❌ $file: Required string fields must have @IsNotEmpty()"
    exit 1
  fi
done

# Find DTOs with @IsString but no @MaxLength
git diff --cached --name-only | grep "dto.ts$" | while read file; do
  if grep -q "@IsString()" "$file" && ! grep -q "@MaxLength" "$file"; then
    echo "⚠️  $file: String fields should have @MaxLength()"
  fi
done

echo "✅ Validation checks passed"
```

---

## COMMON MISTAKES

### 1. Forgetting @Type() with @ValidateNested
```typescript
// ❌ BAD - nested validation won't work
@ValidateNested()
address?: AddressDto;

// ✅ GOOD
@ValidateNested()
@Type(() => AddressDto)
address?: AddressDto;
```

### 2. Using @IsOptional with required fields
```typescript
// ❌ BAD - contradictory
@IsOptional()
title!: string;

// ✅ GOOD
@IsNotEmpty()
title!: string;

// ✅ OR
@IsOptional()
title?: string;
```

### 3. Validating query params without @Type()
```typescript
// ❌ BAD - page will be string "1"
@IsNumber()
page?: number;

// ✅ GOOD
@Type(() => Number)
@IsInt()
page?: number;
```

### 4. Not trimming user input
```typescript
// ❌ BAD - "  test  " !== "test"
@IsString()
title!: string;

// ✅ GOOD
@IsString()
@Transform(({ value }) => value.trim())
title!: string;
```

### 5. Not normalizing emails
```typescript
// ❌ BAD - User@Example.com !== user@example.com
@IsEmail()
email!: string;

// ✅ GOOD
@IsEmail()
@Transform(({ value }) => value.toLowerCase().trim())
email!: string;
```

---

## RESOURCES

### Documentation
- [class-validator](https://github.com/typestack/class-validator)
- [class-transformer](https://github.com/typestack/class-transformer)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)

### Internal Resources
- Detailed Audit Report: `/home/user/lexiflow-premium/VALIDATION_AUDIT_REPORT.json`
- Executive Summary: `/home/user/lexiflow-premium/VALIDATION_AUDIT_SUMMARY.md`
- Custom Validators: `/backend/src/common/validators/`
- Custom Decorators: `/backend/src/common/decorators/`

### Security Resources
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html)

---

**Last Updated:** 2025-12-27
**Maintained By:** Enterprise Agent 9 - VALIDATION AUDIT AGENT
