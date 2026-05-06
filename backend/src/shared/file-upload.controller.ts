import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFiles, 
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
  Body
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { FileUploadService } from './file-upload.service';
import { UserRole } from '../modules/users/entities/user.entity';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('workshop-images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5)) // Máximo 5 imágenes
  async uploadWorkshopImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req
  ) {
    const user = req.user;

    // Verificar que el usuario sea un proveedor
    if (user.role !== UserRole.PROVEEDOR) {
      throw new ForbiddenException('Solo los proveedores pueden subir imágenes');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No se han subido archivos');
    }

    try {
      // Subir imágenes a Supabase Storage
      const imageUrls = await this.fileUploadService.uploadMultipleFiles(files, 'workshops');

      return {
        success: true,
        message: 'Imágenes subidas exitosamente',
        data: {
          images: imageUrls,
          count: files.length
        }
      };
    } catch (error) {
      throw new BadRequestException(`Error al subir imágenes: ${error.message}`);
    }
  }

  @Post('part-images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5)) // Máximo 5 imágenes
  async uploadPartImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req
  ) {
    const user = req.user;

    // Verificar que el usuario sea un proveedor
    if (user.role !== UserRole.PROVEEDOR) {
      throw new ForbiddenException('Solo los proveedores pueden subir imágenes');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No se han subido archivos');
    }

    try {
      // Subir imágenes a Supabase Storage
      const imageUrls = await this.fileUploadService.uploadMultipleFiles(files, 'parts');

      return {
        success: true,
        message: 'Imágenes subidas exitosamente',
        data: {
          images: imageUrls,
          count: files.length
        }
      };
    } catch (error) {
      throw new BadRequestException(`Error al subir imágenes: ${error.message}`);
    }
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 5)) // Máximo 5 imágenes
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { uploadType: 'workshop' | 'part' },
    @Request() req
  ) {
    const user = req.user;

    // Verificar que el usuario sea un proveedor
    if (user.role !== UserRole.PROVEEDOR) {
      throw new ForbiddenException(`Solo los proveedores pueden subir imágenes. Tu rol: ${user.role}`);
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No se han subido archivos');
    }

    try {
      // Determinar el bucket basado en el tipo de subida
      const bucket = body.uploadType === 'workshop' ? 'workshops' : 'parts';

      // Subir imágenes a Supabase Storage
      const imageUrls = await this.fileUploadService.uploadMultipleFiles(files, bucket);

      return {
        success: true,
        message: 'Imágenes subidas exitosamente',
        urls: imageUrls,
        count: files.length
      };
    } catch (error) {
      throw new BadRequestException(`Error al subir imágenes: ${error.message}`);
    }
  }
}