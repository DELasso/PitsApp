import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { BidsService } from './bids.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ServiceStatus } from './entities/service-request.entity';

@Controller('service-requests')
export class ServiceRequestsController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
    private readonly bidsService: BidsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: CreateServiceRequestDto, @Request() req) {
    return this.serviceRequestsService.create(createDto, req.user.userId);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    if (status) {
      return this.serviceRequestsService.findByStatus(status as ServiceStatus);
    }
    return this.serviceRequestsService.findAll();
  }

  @Get('available')
  findAvailableForBids() {
    return this.serviceRequestsService.findAvailableForBids();
  }

  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  findMyRequests(@Request() req) {
    return this.serviceRequestsService.findByClientId(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceRequestsService.findOne(id);
  }

  @Get(':id/bids')
  findBidsByServiceRequest(@Param('id') id: string) {
    return this.bidsService.findByServiceRequestId(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceRequestDto,
    @Request() req,
  ) {
    return this.serviceRequestsService.update(id, updateDto, req.user.userId);
  }

  @Patch(':id/accept-bid/:bidId')
  @UseGuards(JwtAuthGuard)
  acceptBid(
    @Param('id') id: string,
    @Param('bidId') bidId: string,
    @Request() req,
  ) {
    return this.serviceRequestsService.acceptBid(id, bidId, req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ServiceStatus,
    @Request() req,
  ) {
    return this.serviceRequestsService.updateStatus(id, status, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.serviceRequestsService.delete(id, req.user.userId);
  }
}
