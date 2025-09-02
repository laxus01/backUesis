import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Delete, Param, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, unlinkSync } from 'fs';
import { basename, join } from 'path';

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: any) {
    // Debug: log what is received
    try {
      console.log('UploadsController.upload() received file:', file ? {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        filename: file.filename,
        destination: file.destination,
        path: file.path,
      } : file);
    } catch {}
    if (!file) throw new BadRequestException('No file uploaded');
    // File is saved by Multer storage config to uploads/photos
    const path = `/photos/${file.filename}`;
    return {
      message: 'Llegamos al servicio de uploads correctamente.',
      filename: file.filename,
      path,
    };
  }

  @Delete(':filename')
  remove(@Param('filename') filename: string) {
    if (!filename) throw new BadRequestException('Nombre de archivo requerido');
    // Previene path traversal: usar solo el basename
    const safe = basename(filename);
    const filePath = join(process.cwd(), 'uploads', 'photos', safe);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Archivo no encontrado');
    }
    try {
      unlinkSync(filePath);
      return { message: 'Archivo eliminado', filename: safe, removed: true };
    } catch (e) {
      throw new BadRequestException('No se pudo eliminar el archivo');
    }
  }
}
