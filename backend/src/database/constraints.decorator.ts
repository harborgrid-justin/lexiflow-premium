import { Check, Unique } from "typeorm";

/**
 * Database Constraint Decorators
 *
 * These decorators provide a clean way to define database-level constraints
 * that are enforced by the database engine, providing better data integrity
 * than application-level validation alone.
 */

/**
 * Positive number constraint
 * Ensures a numeric column is greater than 0
 *
 * @param columnName - The name of the column to constrain
 *
 * @example
 * @Entity()
 * @PositiveNumber('price')
 * class Product {
 *   @Column('decimal')
 *   price: number;
 * }
 */
export function PositiveNumber(columnName: string): ClassDecorator {
  return Check(`"${columnName}" > 0`);
}

/**
 * Non-negative number constraint
 * Ensures a numeric column is greater than or equal to 0
 *
 * @param columnName - The name of the column to constrain
 */
export function NonNegativeNumber(columnName: string): ClassDecorator {
  return Check(`"${columnName}" >= 0`);
}

/**
 * Number range constraint
 * Ensures a numeric column is within a specified range
 *
 * @param columnName - The name of the column to constrain
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 */
export function NumberRange(
  columnName: string,
  min: number,
  max: number
): ClassDecorator {
  return Check(`"${columnName}" BETWEEN ${min} AND ${max}`);
}

/**
 * Email format constraint (basic)
 * Ensures a string column contains '@' character
 *
 * @param columnName - The name of the email column
 */
export function EmailFormat(columnName: string): ClassDecorator {
  return Check(`"${columnName}" LIKE '%@%.%'`);
}

/**
 * Non-empty string constraint
 * Ensures a string column is not empty or whitespace-only
 *
 * @param columnName - The name of the column to constrain
 */
export function NonEmptyString(columnName: string): ClassDecorator {
  return Check(`LENGTH(TRIM("${columnName}")) > 0`);
}

/**
 * String length constraint
 * Ensures a string column length is within specified range
 *
 * @param columnName - The name of the column to constrain
 * @param min - Minimum length
 * @param max - Maximum length (optional)
 */
export function StringLength(
  columnName: string,
  min: number,
  max?: number
): ClassDecorator {
  if (max !== undefined) {
    return Check(
      `LENGTH("${columnName}") >= ${min} AND LENGTH("${columnName}") <= ${max}`
    );
  }
  return Check(`LENGTH("${columnName}") >= ${min}`);
}

/**
 * Date range constraint
 * Ensures a date column is within a specified range
 *
 * @param columnName - The name of the date column
 * @param afterColumn - Name of column that this date must be after
 */
export function DateAfter(
  columnName: string,
  afterColumn: string
): ClassDecorator {
  return Check(`"${columnName}" > "${afterColumn}"`);
}

/**
 * Date before constraint
 * Ensures a date is before another date column
 *
 * @param columnName - The name of the date column
 * @param beforeColumn - Name of column that this date must be before
 */
export function DateBefore(
  columnName: string,
  beforeColumn: string
): ClassDecorator {
  return Check(`"${columnName}" < "${beforeColumn}"`);
}

/**
 * Future date constraint
 * Ensures a date column is in the future
 *
 * @param columnName - The name of the date column
 */
export function FutureDate(columnName: string): ClassDecorator {
  return Check(`"${columnName}" > CURRENT_TIMESTAMP`);
}

/**
 * Past date constraint
 * Ensures a date column is in the past
 *
 * @param columnName - The name of the date column
 */
export function PastDate(columnName: string): ClassDecorator {
  return Check(`"${columnName}" < CURRENT_TIMESTAMP`);
}

/**
 * Enum value constraint
 * Ensures a column value is one of the specified values
 *
 * @param columnName - The name of the column
 * @param values - Array of allowed values
 */
export function EnumValues(
  columnName: string,
  values: (string | number)[]
): ClassDecorator {
  const valuesList = values
    .map((v) => (typeof v === "string" ? `'${v}'` : v))
    .join(", ");
  return Check(`"${columnName}" IN (${valuesList})`);
}

/**
 * Mutual exclusivity constraint
 * Ensures that only one of the specified columns is non-null
 *
 * @param columns - Array of column names
 */
export function MutuallyExclusive(...columns: string[]): ClassDecorator {
  const conditions = columns
    .map((col) => `("${col}" IS NOT NULL)::int`)
    .join(" + ");
  return Check(`(${conditions}) <= 1`);
}

/**
 * At least one required constraint
 * Ensures that at least one of the specified columns is non-null
 *
 * @param columns - Array of column names
 */
export function AtLeastOneRequired(...columns: string[]): ClassDecorator {
  const conditions = columns.map((col) => `"${col}" IS NOT NULL`).join(" OR ");
  return Check(`(${conditions})`);
}

/**
 * Conditional required constraint
 * Ensures columnB is required when columnA has a specific value
 *
 * @param columnA - The condition column
 * @param valueA - The value that triggers the requirement
 * @param columnB - The column that becomes required
 */
export function ConditionalRequired(
  columnA: string,
  valueA: string | number | boolean,
  columnB: string
): ClassDecorator {
  const value = typeof valueA === "string" ? `'${valueA}'` : valueA;
  return Check(
    `("${columnA}" != ${value}) OR ("${columnA}" = ${value} AND "${columnB}" IS NOT NULL)`
  );
}

/**
 * Percentage constraint
 * Ensures a numeric column is between 0 and 100
 *
 * @param columnName - The name of the percentage column
 */
export function Percentage(columnName: string): ClassDecorator {
  return Check(`"${columnName}" BETWEEN 0 AND 100`);
}

/**
 * JSON not empty constraint
 * Ensures a JSONB column is not an empty object or array
 *
 * @param columnName - The name of the JSONB column
 */
export function JsonNotEmpty(columnName: string): ClassDecorator {
  return Check(
    `jsonb_array_length("${columnName}") > 0 OR jsonb_typeof("${columnName}") = 'object'`
  );
}

/**
 * Case-insensitive unique constraint
 * Creates a unique index on the lowercase version of a column
 *
 * @param columnName - The name of the column
 */
export function CaseInsensitiveUnique(columnName: string): ClassDecorator {
  return function (target: object) {
    // This creates a unique index on LOWER(column)
    Reflect.defineMetadata(
      "typeorm:indices",
      [
        ...((Reflect.getMetadata("typeorm:indices", target) as any[]) || []),
        {
          name: `IDX_${columnName}_lower_unique`,
          columns: [columnName],
          unique: true,
          synchronize: true,
          where: undefined,
          spatial: false,
          fulltext: false,
          parser: undefined,
          sparse: false,
          background: false,
          expireAfterSeconds: undefined,
          // Custom expression for case-insensitive unique
          expression: `LOWER("${columnName}")`,
        },
      ],
      target
    );
  };
}

/**
 * Composite unique constraint
 * Creates a unique constraint across multiple columns
 *
 * @param name - The name of the constraint
 * @param columns - Array of column names
 */
export function CompositeUnique(
  name: string,
  ...columns: string[]
): ClassDecorator {
  return Unique(name, columns);
}

/**
 * Partial unique constraint
 * Creates a unique constraint with a WHERE clause
 *
 * @param columnName - The name of the column
 * @param whereClause - The WHERE clause for the partial index
 *
 * @example
 * // Unique email only for non-deleted users
 * @PartialUnique('email', 'deleted_at IS NULL')
 */
export function PartialUnique(
  columnName: string,
  whereClause: string
): ClassDecorator {
  return function (target: object) {
    Reflect.defineMetadata(
      "typeorm:indices",
      [
        ...((Reflect.getMetadata("typeorm:indices", target) as any[]) || []),
        {
          name: `IDX_${columnName}_partial_unique`,
          columns: [columnName],
          unique: true,
          where: whereClause,
          synchronize: true,
          spatial: false,
          fulltext: false,
          parser: undefined,
          sparse: false,
          background: false,
          expireAfterSeconds: undefined,
        },
      ],
      target
    );
  };
}

/**
 * Currency amount constraint
 * Ensures a decimal column has proper precision for currency
 *
 * @param columnName - The name of the currency column
 */
export function CurrencyAmount(columnName: string): ClassDecorator {
  return Check(
    `"${columnName}" >= 0 AND ROUND("${columnName}"::numeric, 2) = "${columnName}"`
  );
}

/**
 * Phone number format constraint (basic)
 * Ensures a phone number has at least 10 digits
 *
 * @param columnName - The name of the phone number column
 */
export function PhoneNumberFormat(columnName: string): ClassDecorator {
  return Check(
    `LENGTH(REGEXP_REPLACE("${columnName}", '[^0-9]', '', 'g')) >= 10`
  );
}

/**
 * URL format constraint (basic)
 * Ensures a URL starts with http:// or https://
 *
 * @param columnName - The name of the URL column
 */
export function UrlFormat(columnName: string): ClassDecorator {
  return Check(
    `"${columnName}" LIKE 'http://%' OR "${columnName}" LIKE 'https://%'`
  );
}

/**
 * Alphanumeric constraint
 * Ensures a string contains only alphanumeric characters
 *
 * @param columnName - The name of the column
 */
export function Alphanumeric(columnName: string): ClassDecorator {
  return Check(`"${columnName}" ~ '^[a-zA-Z0-9]+$'`);
}

/**
 * IP address format constraint
 * Ensures a string is a valid IPv4 address
 *
 * @param columnName - The name of the IP address column
 */
export function IpAddressFormat(columnName: string): ClassDecorator {
  return Check(
    `"${columnName}" ~ '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'`
  );
}
