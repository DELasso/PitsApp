import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersFileService } from './users-file.service';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: UsersService,
      useClass: UsersFileService, // Cambiamos a almacenamiento en archivo
    }
  ],
  exports: [UsersService],
})
export class UsersModule {}