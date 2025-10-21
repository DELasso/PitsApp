import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //habilitar dovent
  dotenv.config();
  
  // Habilitar CORS para el frontend
  app.enableCors({
    origin: 'http://localhost:4200', // Angular dev server
    credentials: true,
  });

  // Configurar prefijo global para las APIs
  app.setGlobalPrefix('api');

  // Servir archivos estáticos (imágenes subidas)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // Servir archivos de prueba
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/test/',
  });

  // Habilitar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`PitsApp Backend ejecutándose en http://localhost:${port}`);
  console.log(`API Docs disponibles en: http://localhost:${port}/api`);
  console.log(`Archivos estáticos servidos desde: http://localhost:${port}/uploads`);
}
bootstrap();
