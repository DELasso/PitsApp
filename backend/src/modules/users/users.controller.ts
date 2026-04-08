import { Body, Controller, ForbiddenException, Get, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from './entities/user.entity';
import { AddVehicleDto } from './dto/add-vehicle.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('me/vehicles')
  @UseGuards(JwtAuthGuard)
  async getMyVehicles(@Request() req) {
    if (req.user.role !== UserRole.CLIENTE) {
      throw new ForbiddenException('Solo los clientes pueden gestionar vehiculos');
    }

    const vehicles = await this.usersService.getUserVehicles(req.user.sub);
    return {
      success: true,
      message: 'Vehiculos obtenidos exitosamente',
      data: vehicles,
    };
  }

  @Post('me/vehicles')
  @UseGuards(JwtAuthGuard)
  async addMyVehicle(@Request() req, @Body() addVehicleDto: AddVehicleDto) {
    if (req.user.role !== UserRole.CLIENTE) {
      throw new ForbiddenException('Solo los clientes pueden gestionar vehiculos');
    }

    const vehicles = await this.usersService.addUserVehicle(req.user.sub, addVehicleDto);
    return {
      success: true,
      message: 'Vehiculo agregado exitosamente',
      data: vehicles,
    };
  }
}