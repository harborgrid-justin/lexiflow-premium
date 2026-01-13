import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { DataSource } from "typeorm";

/**
 * Custom Database Validators
 *
 * These validators work with class-validator to provide
 * database-aware validation at the application level
 */

/**
 * Validator to check if a value exists in the database
 */
@ValidatorConstraint({ name: "Exists", async: true })
@Injectable()
export class ExistsValidator implements ValidatorConstraintInterface {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async validate(value: unknown, args: ValidationArguments): Promise<boolean> {
    const [entityClass, property = "id"] = args.constraints as [
      new (...constructorArgs: unknown[]) => object,
      string,
    ];

    if (!value) return false;

    const repository = this.dataSource.getRepository(entityClass);
    const entity = await repository.findOne({
      where: { [property]: value } as Record<string, unknown>,
    });

    return !!entity;
  }

  defaultMessage(args: ValidationArguments): string {
    const [entityClass, property = "id"] = args.constraints as [
      { name: string },
      string,
    ];
    return `${entityClass.name} with ${property} '${args.value}' does not exist`;
  }
}

/**
 * Decorator to validate that a foreign key exists
 *
 * @param entityClass - The entity class to check
 * @param property - The property name to check (defaults to 'id')
 * @param validationOptions - Validation options
 *
 * @example
 * class CreateDocumentDto {
 *   @Exists(User, 'id')
 *   userId: string;
 * }
 */
export function Exists(
  entityClass: new (...args: unknown[]) => unknown,
  property: string = "id",
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityClass, property],
      validator: ExistsValidator,
    });
  };
}

/**
 * Validator to check if a value is unique in the database
 */
@ValidatorConstraint({ name: "IsUnique", async: true })
@Injectable()
export class IsUniqueValidator implements ValidatorConstraintInterface {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async validate(value: unknown, args: ValidationArguments): Promise<boolean> {
    type EntityConstructor = new (...constructorArgs: unknown[]) => unknown;
    const entityClass = args.constraints[0] as EntityConstructor;
    const property = args.constraints[1] as string;
    const exceptId = args.constraints[2] as string | undefined;

    if (!value) return true; // Let @IsNotEmpty handle empty values

    const repository = this.dataSource.getRepository(entityClass);

    const queryBuilder = repository
      .createQueryBuilder("entity")
      .where(`entity.${property} = :value`, { value });

    // If we're updating, exclude the current entity
    const obj = args.object as Record<string, unknown>;

    if (exceptId && obj[exceptId] && typeof obj[exceptId] === "string") {
      queryBuilder.andWhere(`entity.id != :id`, { id: obj[exceptId] });
    }

    const count = await queryBuilder.getCount();
    return count === 0;
  }

  defaultMessage(args: ValidationArguments): string {
    const [, property] = args.constraints as [unknown, string];
    return `${property} '${args.value}' already exists`;
  }
}

/**
 * Decorator to validate that a value is unique in the database
 *
 * @param entityClass - The entity class to check
 * @param property - The property name to check for uniqueness
 * @param exceptIdProperty - Property name containing the ID to exclude (for updates)
 * @param validationOptions - Validation options
 *
 * @example
 * class CreateUserDto {
 *   @IsUnique(User, 'email')
 *   email: string;
 * }
 *
 * class UpdateUserDto {
 *   id: string;
 *
 *   @IsUnique(User, 'email', 'id')
 *   email: string;
 * }
 */
export function IsUnique(
  entityClass: new (...args: unknown[]) => unknown,
  property: string,
  exceptIdProperty?: string,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityClass, property, exceptIdProperty],
      validator: IsUniqueValidator,
    });
  };
}

/**
 * Validator for composite uniqueness
 */
@ValidatorConstraint({ name: "IsCompositeUnique", async: true })
@Injectable()
export class IsCompositeUniqueValidator implements ValidatorConstraintInterface {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async validate(_value: unknown, args: ValidationArguments): Promise<boolean> {
    const [entityClass, properties, exceptId] = args.constraints as [
      new (...constructorArgs: unknown[]) => object,
      string[],
      string | undefined
    ];

    const repository = this.dataSource.getRepository(entityClass);
    const queryBuilder = repository.createQueryBuilder("entity");
    const obj = args.object as Record<string, unknown>;

    // Build WHERE clause for all properties
    (properties as string[]).forEach((prop: string) => {
      const propValue = obj[prop];
      queryBuilder.andWhere(`entity.${prop} = :${prop}`, { [prop]: propValue });
    });

    // Exclude current entity if updating
    if (exceptId && obj[exceptId]) {
      queryBuilder.andWhere(`entity.id != :id`, { id: obj[exceptId] });
    }

    const count = await queryBuilder.getCount();
    return count === 0;
  }

  defaultMessage(args: ValidationArguments): string {
    const [, properties] = args.constraints as [unknown, string[]];
    return `Combination of ${properties.join(", ")} already exists`;
  }
}

/**
 * Decorator to validate composite uniqueness
 *
 * @param entityClass - The entity class to check
 * @param properties - Array of property names that form the unique composite
 * @param exceptIdProperty - Property name containing the ID to exclude (for updates)
 * @param validationOptions - Validation options
 *
 * @example
 * class CreateAssignmentDto {
 *   @IsCompositeUnique(Assignment, ['userId', 'taskId'])
 *   userId: string;
 *   taskId: string;
 * }
 */
export function IsCompositeUnique(
  entityClass: new (...args: unknown[]) => unknown,
  properties: string[],
  exceptIdProperty?: string,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityClass, properties, exceptIdProperty],
      validator: IsCompositeUniqueValidator,
    });
  };
}

/**
 * Validator to check if referenced entity is not soft deleted
 */
@ValidatorConstraint({ name: "NotDeleted", async: true })
@Injectable()
export class NotDeletedValidator implements ValidatorConstraintInterface {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async validate(value: unknown, args: ValidationArguments): Promise<boolean> {
    type EntityClass = (new (...constructorArgs: unknown[]) => unknown) | string;
    const entityClass = args.constraints[0] as EntityClass;
    const property = (args.constraints[1] as string) || "id";

    if (!value) return true;

    const repository = this.dataSource.getRepository(entityClass);
    const entity = await repository
      .createQueryBuilder("entity")
      .where(`entity.${property} = :value`, { value })
      .andWhere("entity.deleted_at IS NULL")
      .getOne();

    return !!entity;
  }

  defaultMessage(args: ValidationArguments): string {
    const [entityClass, property = "id"] = args.constraints as [
      { name: string },
      string,
    ];
    return `${entityClass.name} with ${property} '${args.value}' is deleted or does not exist`;
  }
}

/**
 * Decorator to validate that referenced entity is not soft deleted
 *
 * @param entityClass - The entity class to check
 * @param property - The property name to check (defaults to 'id')
 * @param validationOptions - Validation options
 */
export function NotDeleted(
  entityClass: new (...args: unknown[]) => unknown,
  property: string = "id",
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityClass, property],
      validator: NotDeletedValidator,
    });
  };
}

/**
 * Validator to check if count of related entities is within limits
 */
@ValidatorConstraint({ name: "RelationCount", async: true })
@Injectable()
export class RelationCountValidator implements ValidatorConstraintInterface {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async validate(value: unknown, args: ValidationArguments): Promise<boolean> {
    type EntityClass = (new (...constructorArgs: unknown[]) => unknown) | string;
    const entityClass = args.constraints[0] as EntityClass;
    const relationProperty = args.constraints[1] as string;
    const min = args.constraints[2] as number | undefined;
    const max = args.constraints[3] as number | undefined;

    if (!value) return true;

    const repository = this.dataSource.getRepository(entityClass);
    const entity = await repository.findOne({
      where: { id: value },
      relations: [relationProperty],
    });

    if (!entity) return false;

    interface EntityWithRelations {
      [key: string]: unknown[] | undefined;
    }
    const count = (entity as EntityWithRelations)[relationProperty]?.length ?? 0;

    if (min !== undefined && count < min) return false;
    if (max !== undefined && count > max) return false;

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const relationProperty = args.constraints[1] as string;
    const min = args.constraints[2] as number | undefined;
    const max = args.constraints[3] as number | undefined;
      number,
      number,
    ];
    if (min !== undefined && max !== undefined) {
      return `${relationProperty} count must be between ${min} and ${max}`;
    }
    if (min !== undefined) {
      return `${relationProperty} count must be at least ${min}`;
    }
    if (max !== undefined) {
      return `${relationProperty} count must be at most ${max}`;
    }
    return `Invalid ${relationProperty} count`;
  }
}

/**
 * Decorator to validate relation count
 *
 * @param entityClass - The entity class to check
 * @param relationProperty - The relation property name
 * @param min - Minimum count (optional)
 * @param max - Maximum count (optional)
 * @param validationOptions - Validation options
 */
export function RelationCount(
  entityClass: new (...args: unknown[]) => unknown,
  relationProperty: string,
  min?: number,
  max?: number,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityClass, relationProperty, min, max],
      validator: RelationCountValidator,
    });
  };
}

/**
 * Validator to check if a value matches a database enum
 */
@ValidatorConstraint({ name: "MatchesDbEnum", async: true })
@Injectable()
export class MatchesDbEnumValidator implements ValidatorConstraintInterface {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async validate(value: unknown, args: ValidationArguments): Promise<boolean> {
    const tableName = args.constraints[0] as string;
    const columnName = args.constraints[1] as string;

    if (!value) return true;

    const query = `
      SELECT enum_range(NULL::${tableName}_${columnName}_enum) AS enum_values
    `;

    try {
      const result = await this.dataSource.query(query) as [{ enum_values: string[] } | undefined];
      const enumValues = result[0]?.enum_values || [];
      return enumValues.includes(value as string);
    } catch {
      // If enum type doesn't exist, validation passes (let TypeORM handle it)
      return true;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.value} is not a valid enum value`;
  }
}

/**
 * Decorator to validate against database enum
 *
 * @param tableName - The table name
 * @param columnName - The column name with enum type
 * @param validationOptions - Validation options
 */
export function MatchesDbEnum(
  tableName: string,
  columnName: string,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [tableName, columnName],
      validator: MatchesDbEnumValidator,
    });
  };
}
