import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class CreateManyAdministrationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch {
        throw new BadRequestException('Invalid JSON format');
      }
    }

    if (value && !Array.isArray(value) && Array.isArray((value as any).items)) {
      value = (value as any).items;
    }

    if (!Array.isArray(value)) {
      throw new BadRequestException('Body must be a JSON array of CreateAdministrationDto');
    }

    return value;
  }
}
