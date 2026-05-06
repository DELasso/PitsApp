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
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { FileUploadService, UploadedFile } from './file-upload.service';
import { UserRole } from '../modules/users/entities/user.entity';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown upload error';
}

const uploadOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (req: unknown, file: UploadedFile, cb: (error: Error | null, acceptFile: boolean) => void) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'), false);
  },
};

@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('workshop-images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5, uploadOptions))
  async uploadWorkshopImages(
    @UploadedFiles() files: UploadedFile[],
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
      throw new BadRequestException(`Error al subir imágenes: ${getErrorMessage(error)}`);
    }
  }

  @Post('part-images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5, uploadOptions))
  async uploadPartImages(
    @UploadedFiles() files: UploadedFile[],
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
      throw new BadRequestException(`Error al subir imágenes: ${getErrorMessage(error)}`);
    }
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 5, uploadOptions))
  async uploadMultipleImages(
    @UploadedFiles() files: UploadedFile[],
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
      throw new BadRequestException(`Error al subir imágenes: ${getErrorMessage(error)}`);
    }
  }
}
