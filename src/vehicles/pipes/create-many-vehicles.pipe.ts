import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class CreateManyVehiclesPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    let data = value;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        throw new BadRequestException('Invalid JSON format in body');
      }
    }
    if (data && !Array.isArray(data) && Array.isArray((data as any).items)) {
      data = (data as any).items;
    }
    if (!Array.isArray(data)) {
      throw new BadRequestException('Body must be a JSON array of vehicles');
    }
    return data;
  }
}
