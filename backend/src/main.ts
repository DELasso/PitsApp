import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const normalizeOrigin = (origin: string) => origin.replace(/\/$/, '');
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    ...(process.env.FRONTEND_URLS || '').split(',').map(item => item.trim()),
  ]
    .filter((origin): origin is string => Boolean(origin))
    .map(normalizeOrigin);

  const isAllowedOrigin = (origin?: string): boolean => {
    if (!origin) {
      return true;
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const isConfigured = configuredOrigins.includes(normalizedOrigin);
    const isVercelDomain = normalizedOrigin.endsWith('.vercel.app');
    const isLocalDev = normalizedOrigin === 'http://localhost:4200';

    if (process.env.NODE_ENV === 'production') {
      return isConfigured || isVercelDomain;
    }

    return isConfigured || isVercelDomain || isLocalDev;
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    exposedHeaders: ['Content-Type', 'Content-Length'],
  });

  // Configurar prefijo global para las APIs
  app.setGlobalPrefix('api', {
    exclude: [
      { path: '', method: RequestMethod.GET },
      { path: '', method: RequestMethod.HEAD },
      { path: 'status', method: RequestMethod.GET },
      { path: 'status', method: RequestMethod.HEAD },
    ],
  });

  // Servir archivos estáticos (imágenes subidas) - LEGACY: Ya no se usa con Supabase Storage
  // const uploadsPath = join(__dirname, '..', 'uploads');
  //
  // app.useStaticAssets(uploadsPath, {
  //   prefix: '/uploads/',
  //   setHeaders: (res, path) => {
  //     res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  //   }
  // });

  // Habilitar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`PitsApp Backend ejecutándose en http://localhost:${port}`);
    console.log(`API Docs disponibles en: http://localhost:${port}/api`);
    console.log(`Archivos estáticos servidos desde: http://localhost:${port}/uploads`);
  }
}
bootstrap();
