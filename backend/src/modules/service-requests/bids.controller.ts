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
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: CreateBidDto, @Request() req) {
    const user = req.user;
    const providerName = user.companyName || `${user.firstName} ${user.lastName}`;
    return this.bidsService.create(
      createDto,
      user.userId,
      providerName,
      user.rating || 4.5,
    );
  }

  @Get()
  findAll() {
    return this.bidsService.findAll();
  }

  @Get('my-bids')
  @UseGuards(JwtAuthGuard)
  findMyBids(@Request() req) {
    return this.bidsService.findByProviderId(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bidsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBidDto,
    @Request() req,
  ) {
    return this.bidsService.update(id, updateDto, req.user.userId);
  }

  @Patch(':id/withdraw')
  @UseGuards(JwtAuthGuard)
  withdraw(@Param('id') id: string, @Request() req) {
    return this.bidsService.withdraw(id, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.bidsService.delete(id, req.user.userId);
  }
}
