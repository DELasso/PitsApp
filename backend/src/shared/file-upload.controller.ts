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

    // Configurar multer para workshops
    const multerConfig = this.fileUploadService.getMulterConfig('workshops');
    
    // Generar URLs para las imágenes subidas
    const imageUrls = files.map(file => 
      this.fileUploadService.getFileUrl(file.filename, 'workshops')
    );

    return {
      success: true,
      message: 'Imágenes subidas exitosamente',
      data: {
        images: imageUrls,
        count: files.length
      }
    };
  }

  @Post('part-images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5, {
    storage: require('multer').diskStorage({
      destination: (req, file, cb) => {
        const path = require('path');
        const uploadDir = path.join(process.cwd(), 'uploads');
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const crypto = require('crypto');
        const path = require('path');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const hash = crypto.createHash('md5').update(uniqueSuffix.toString()).digest('hex');
        const ext = path.extname(file.originalname);
        cb(null, hash + ext);
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 5
    }
  }))
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

    // Los archivos ya están guardados por multer
    const imageUrls = files.map(file => `/uploads/${file.filename}`);

    return {
      success: true,
      message: 'Imágenes subidas exitosamente',
      data: {
        images: imageUrls,
        count: files.length
      }
    };
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 5, {
    storage: require('multer').diskStorage({
      destination: (req, file, cb) => {
        const path = require('path');
        const uploadDir = path.join(process.cwd(), 'uploads');
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const crypto = require('crypto');
        const path = require('path');
        // Generar nombre único usando timestamp y random
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const hash = crypto.createHash('md5').update(uniqueSuffix.toString()).digest('hex');
        const ext = path.extname(file.originalname);
        cb(null, hash + ext);
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 5
    }
  }))
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
    
    // Los archivos ya están guardados por multer, solo necesitamos generar las URLs
    const imageUrls = files.map(file => `/uploads/${file.filename}`);

    return {
      success: true,
      message: 'Imágenes subidas exitosamente',
      urls: imageUrls,
      count: files.length
    };
  }
}