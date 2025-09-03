import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { CreateDriverDto } from '../dto/create-driver.dto';

@Injectable()
export class CreateManyDriversPipe implements PipeTransform {
  transform(body: any, metadata: ArgumentMetadata): CreateDriverDto[] {
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        throw new BadRequestException('Invalid JSON format');
      }
    }

    let data = body;
    if (data && !Array.isArray(data) && Array.isArray(data.items)) {
      data = data.items;
    }

    if (!Array.isArray(data)) {
      throw new BadRequestException('Body must be a JSON array of CreateDriverDto');
    }

    // Aquí se podrían añadir validaciones más complejas para cada item del array si fuera necesario

    return data;
  }
}
