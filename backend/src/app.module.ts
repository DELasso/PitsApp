import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkshopsModule } from './modules/workshops/workshops.module';
import { PartsModule } from './modules/parts/parts.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SharedModule } from './shared/shared.module';
import { ServiceRequestsModule } from './modules/service-requests/service-requests.module';
import { SupabaseModule } from './common/supabase/supabase.module';
import { AiChatModule } from './modules/ai-chat/ai-chat.module';

@Module({
  imports: [
    SupabaseModule, // Global module para Supabase
    WorkshopsModule,
    PartsModule,
    AuthModule,
    UsersModule,
    SharedModule,
    ServiceRequestsModule,
    AiChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
