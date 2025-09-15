import { Module } from '@nestjs/common';
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';
import { PartsFileService } from './parts-file.service';

@Module({
  controllers: [PartsController],
  providers: [PartsService, PartsFileService],
  exports: [PartsService],
})
export class PartsModule {}
