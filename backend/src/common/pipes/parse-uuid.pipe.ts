import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ValidationException } from '../exceptions';
import { validate } from 'uuid';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!validate(value)) {
      throw new ValidationException(`Invalid UUID format: ${value}`);
    }
    return value;
  }
}
