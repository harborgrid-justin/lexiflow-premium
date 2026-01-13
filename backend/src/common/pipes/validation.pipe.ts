import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata
  ): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype as new (...args: unknown[]) => unknown)) {
      return value;
    }
    const object = plainToInstance(metatype, value) as object;
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map((error) => {
        return {
          property: error.property,
          constraints: error.constraints,
        };
      });

      throw new BadRequestException({
        message: "Validation failed",
        errors: messages,
      });
    }

    return object;
  }

  private toValidate(metatype: new (...args: unknown[]) => unknown): boolean {
    const types: Array<new (...args: unknown[]) => unknown> = [
      String as unknown as new (...args: unknown[]) => unknown,
      Boolean as unknown as new (...args: unknown[]) => unknown,
      Number as unknown as new (...args: unknown[]) => unknown,
      Array as new (...args: unknown[]) => unknown[],
      Object as new (...args: unknown[]) => object
    ];
    return !types.includes(metatype);
  }
}
