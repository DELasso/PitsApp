import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkshopsModule } from './modules/workshops/workshops.module';
import { PartsModule } from './modules/parts/parts.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SharedModule } from './shared/shared.module';
import { ServiceRequestsModule } from './modules/service-requests/service-requests.module';

@Module({
  imports: [
    WorkshopsModule,
    PartsModule,
    AuthModule,
    UsersModule,
    SharedModule,
    ServiceRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
