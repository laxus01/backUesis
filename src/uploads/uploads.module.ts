import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UploadsController } from './uploads.controller';

function filenameGenerator(req: any, file: any, cb: (error: Error | null, filename: string) => void) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const fileExt = extname(file.originalname || '').toLowerCase();
  cb(null, `${uniqueSuffix}${fileExt}`);
}

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Save into backend/uploads/photos
          const photosDir = join(process.cwd(), 'uploads', 'photos');
          if (!existsSync(photosDir)) {
            mkdirSync(photosDir, { recursive: true });
          }
          cb(null, photosDir);
        },
        filename: filenameGenerator,
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
