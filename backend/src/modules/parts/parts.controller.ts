import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  ForbiddenException
} from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole, BusinessType } from '../users/entities/user.entity';

@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPartDto: CreatePartDto, @Request() req) {
    const user = req.user;

    // Verificar que el usuario sea un proveedor
    if (user.role !== UserRole.PROVEEDOR) {
      throw new ForbiddenException('Solo los proveedores pueden crear repuestos');
    }

    // Verificar que el proveedor pueda crear repuestos según su tipo de negocio
    if (user.businessType !== BusinessType.VENTA_REPUESTOS && 
        user.businessType !== BusinessType.TALLER_Y_REPUESTOS) {
      throw new ForbiddenException('Tu tipo de negocio no permite crear repuestos');
    }

    const part = await this.partsService.create(createPartDto, user.sub);
    
    return {
      success: true,
      message: 'Repuesto creado exitosamente',
      data: part
    };
  }

  @Get()
  async findAll() {
    const parts = await this.partsService.findAll();
    return {
      success: true,
      message: 'Repuestos obtenidos exitosamente',
      data: parts
    };
  }

  @Get('my-parts')
  @UseGuards(JwtAuthGuard)
  async findMyParts(@Request() req) {
    const user = req.user;

    if (user.role !== UserRole.PROVEEDOR) {
      throw new ForbiddenException('Solo los proveedores pueden acceder a esta función');
    }

    const parts = await this.partsService.findByOwner(user.sub);
    return {
      success: true,
      message: 'Repuestos del proveedor obtenidos exitosamente',
      data: parts
    };
  }

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query) {
      return {
        success: false,
        message: 'Parámetro de búsqueda requerido',
        data: []
      };
    }

    const parts = await this.partsService.search(query);
    return {
      success: true,
      message: 'Búsqueda realizada exitosamente',
      data: parts
    };
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: string) {
    const parts = await this.partsService.findByCategory(category);
    return {
      success: true,
      message: `Repuestos en categoría ${category} obtenidos exitosamente`,
      data: parts
    };
  }

  @Get('brand/:brand')
  async findByBrand(@Param('brand') brand: string) {
    const parts = await this.partsService.findByBrand(brand);
    return {
      success: true,
      message: `Repuestos de marca ${brand} obtenidos exitosamente`,
      data: parts
    };
  }

  @Get('in-stock')
  async findInStock() {
    const parts = await this.partsService.findInStock();
    return {
      success: true,
      message: 'Repuestos en stock obtenidos exitosamente',
      data: parts
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const part = await this.partsService.findOne(id);
    return {
      success: true,
      message: 'Repuesto obtenido exitosamente',
      data: part
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string, 
    @Body() updatePartDto: UpdatePartDto,
    @Request() req
  ) {
    const user = req.user;

    if (user.role !== UserRole.PROVEEDOR) {
      throw new ForbiddenException('Solo los proveedores pueden actualizar repuestos');
    }

    const part = await this.partsService.update(id, updatePartDto, user.sub);
    
    return {
      success: true,
      message: 'Repuesto actualizado exitosamente',
      data: part
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    const user = req.user;

    if (user.role !== UserRole.PROVEEDOR) {
      throw new ForbiddenException('Solo los proveedores pueden eliminar repuestos');
    }

    await this.partsService.remove(id, user.sub);
    
    return {
      success: true,
      message: 'Repuesto eliminado exitosamente'
    };
  }
}
