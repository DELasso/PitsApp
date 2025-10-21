import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkshopsModule } from './modules/workshops/workshops.module';
import { PartsModule } from './modules/parts/parts.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SharedModule } from './shared/shared.module';
import { ServiceRequestsModule } from './modules/service-requests/service-requests.module';
import { MapsModule } from './maps/maps.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    WorkshopsModule,
    PartsModule,
    AuthModule,
    UsersModule,
    SharedModule,
    ServiceRequestsModule,
    MapsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
