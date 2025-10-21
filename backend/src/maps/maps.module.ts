import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MapsService } from './maps.service';
import { MapsController } from './maps.controller';

@Module({
  imports: [HttpModule],
  providers: [MapsService],
  controllers: [MapsController],
})
export class MapsModule {}