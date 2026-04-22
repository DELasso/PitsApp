import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
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

  @Put('me/vehicles/:plate')
  @UseGuards(JwtAuthGuard)
  async updateMyVehicle(@Request() req, @Param('plate') plate: string, @Body() updateVehicleDto: AddVehicleDto) {
    if (req.user.role !== UserRole.CLIENTE) {
      throw new ForbiddenException('Solo los clientes pueden gestionar vehiculos');
    }

    const decodedPlate = decodeURIComponent(plate);
    const vehicles = await this.usersService.updateUserVehicle(req.user.sub, decodedPlate, updateVehicleDto);
    return {
      success: true,
      message: 'Vehiculo actualizado exitosamente',
      data: vehicles,
    };
  }

  @Delete('me/vehicles/:plate')
  @UseGuards(JwtAuthGuard)
  async deleteMyVehicle(@Request() req, @Param('plate') plate: string) {
    if (req.user.role !== UserRole.CLIENTE) {
      throw new ForbiddenException('Solo los clientes pueden gestionar vehiculos');
    }

    const decodedPlate = decodeURIComponent(plate);
    const vehicles = await this.usersService.deleteUserVehicle(req.user.sub, decodedPlate);
    return {
      success: true,
      message: 'Vehiculo eliminado exitosamente',
      data: vehicles,
    };
  }
}