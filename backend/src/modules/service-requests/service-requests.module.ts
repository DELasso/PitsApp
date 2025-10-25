import { Module } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { BidsService } from './bids.service';
import { ServiceRequestsController } from './service-requests.controller';
import { BidsController } from './bids.controller';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ServiceRequestsController, BidsController],
  providers: [
    ServiceRequestsService,
    BidsService,
  ],
  exports: [ServiceRequestsService, BidsService],
})
export class ServiceRequestsModule {}
