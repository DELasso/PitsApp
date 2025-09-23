import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GoogleMapsService } from './google-maps.service';

@Controller('api/maps')
export class GoogleMapsController {
  constructor(private gm: GoogleMapsService) {}

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
}
