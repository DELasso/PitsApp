import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configurar CORS según el entorno
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-domain.com']
    : ['http://localhost:4200'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ['Content-Type', 'Content-Length'],
  });

  // Configurar prefijo global para las APIs
  app.setGlobalPrefix('api');

  // Servir archivos estáticos (imágenes subidas)
  const uploadsPath = join(__dirname, '..', 'uploads');
  
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
    setHeaders: (res, path) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
  });

  // Habilitar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`PitsApp Backend ejecutándose en http://localhost:${port}`);
    console.log(`API Docs disponibles en: http://localhost:${port}/api`);
    console.log(`Archivos estáticos servidos desde: http://localhost:${port}/uploads`);
  }
}
bootstrap();
