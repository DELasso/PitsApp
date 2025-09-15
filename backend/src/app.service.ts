import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '¡Bienvenido a PitsApp! Tu aplicación de servicios automotrices en Medellín';
  }
}
