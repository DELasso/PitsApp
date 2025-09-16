import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
    
    // Crear subdirectorios para workshops y parts
    const workshopsPath = join(this.uploadPath, 'workshops');
    const partsPath = join(this.uploadPath, 'parts');
    
    if (!existsSync(workshopsPath)) {
      mkdirSync(workshopsPath, { recursive: true });
    }
    
    if (!existsSync(partsPath)) {
      mkdirSync(partsPath, { recursive: true });
    }
  }

  getMulterConfig(subfolder: 'workshops' | 'parts') {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(this.uploadPath, subfolder);
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Generar nombre único para el archivo
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Solo permitir imágenes
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
        files: 5, // Máximo 5 archivos por vez
      },
    };
  }

  getFileUrl(filename: string, subfolder: 'workshops' | 'parts'): string {
    return `/uploads/${subfolder}/${filename}`;
  }
}