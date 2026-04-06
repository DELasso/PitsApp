import { Controller, Get, Head } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Head()
  healthHead(): void {}

  @Get('status')
  getStatus() {
    return {
      status: 'OK',
      message: 'PitsApp Backend funcionando correctamente',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Head('status')
  statusHead(): void {}
}
