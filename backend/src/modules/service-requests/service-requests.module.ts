import { Module } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { BidsService } from './bids.service';
import { ServiceRequestsController } from './service-requests.controller';
import { BidsController } from './bids.controller';
import { ServiceRequestsFileService } from './service-requests-file.service';
import { BidsFileService } from './bids-file.service';

@Module({
  controllers: [ServiceRequestsController, BidsController],
  providers: [
    ServiceRequestsService,
    BidsService,
    ServiceRequestsFileService,
    BidsFileService,
  ],
  exports: [ServiceRequestsService, BidsService],
})
export class ServiceRequestsModule {}
