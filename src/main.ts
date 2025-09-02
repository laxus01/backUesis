import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe()); 
  // Ensure uploads directory exists and serve it statically
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
  // Ensure photos directory exists and serve it statically at /photos
  const photosDir = join(process.cwd(), 'uploads', 'photos');
  if (!existsSync(photosDir)) {
    mkdirSync(photosDir, { recursive: true });
  }
  app.use('/photos', express.static(photosDir));
  const port = parseInt(process.env.PORT as string, 10) || 3000;
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}
bootstrap();