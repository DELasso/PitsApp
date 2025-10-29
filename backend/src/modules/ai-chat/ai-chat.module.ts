import { Module } from '@nestjs/common';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { WorkshopsModule } from '../workshops/workshops.module';
import { PartsModule } from '../parts/parts.module';
import { ServiceRequestsModule } from '../service-requests/service-requests.module';

@Module({
  imports: [WorkshopsModule, PartsModule, ServiceRequestsModule],
  controllers: [AiChatController],
  providers: [AiChatService],
  exports: [AiChatService],
})
export class AiChatModule {}
