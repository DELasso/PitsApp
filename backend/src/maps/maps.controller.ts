import { Controller, Get, Post, Query, Body, BadRequestException } from '@nestjs/common';
import { MapsService } from './maps.service';

@Controller('maps')
export class MapsController {
  constructor(private gm: MapsService) {}

  @Get('nearby')
  async nearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('type') type?: string
  ) {
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (isNaN(latN) || isNaN(lngN)) {
      throw new BadRequestException('lat y lng deben ser números en query params');
    }
    return this.gm.nearby(latN, lngN, radius ? parseInt(radius, 10) : 5000, type || 'car_repair');
  }

  @Post('geocode')
  async getCoordinates(@Body('address') address: string) {
    return this.gm.getCoordinates(address);
  }
}