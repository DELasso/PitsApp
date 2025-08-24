import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkshopsModule } from './modules/workshops/workshops.module';
import { PartsModule } from './modules/parts/parts.module';

@Module({
  imports: [WorkshopsModule, PartsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
