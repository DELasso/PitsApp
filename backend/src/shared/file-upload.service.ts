import { Injectable } from '@nestjs/common';
import { supabaseClient } from '../config/supabase.config';
import { extname } from 'path';

@Injectable()
export class FileUploadService {
  constructor() {}

  async uploadFile(file: Express.Multer.File, bucket: 'workshops' | 'parts'): Promise<string> {
    try {
      // Generar nombre único para el archivo
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = extname(file.originalname);
      const filename = `${bucket}-${uniqueSuffix}${ext}`;

      // Subir archivo a Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from(bucket)
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        throw new Error(`Error uploading file: ${error.message}`);
      }

      // Obtener URL pública del archivo
      const { data: urlData } = supabaseClient.storage
        .from(bucket)
        .getPublicUrl(filename);

      return urlData.publicUrl;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[], bucket: 'workshops' | 'parts'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, bucket));
    return Promise.all(uploadPromises);
  }

  // Método legacy para compatibilidad - ahora retorna configuración vacía
  getMulterConfig(subfolder: 'workshops' | 'parts') {
    return {
      storage: null, // Ya no usamos diskStorage
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

  // Método legacy - ya no se usa
  getFileUrl(filename: string, subfolder: 'workshops' | 'parts'): string {
    // Este método ya no se usa, pero lo mantenemos por compatibilidad
    return `legacy-url-${filename}`;
  }
}