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
  HttpStatus
} from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto, VehicleType } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPartDto: CreatePartDto) {
    return {
      success: true,
      message: 'Repuesto creado exitosamente',
      data: this.partsService.create(createPartDto)
    };
  }

  @Get()
  findAll() {
    return {
      success: true,
      message: 'Repuestos obtenidos exitosamente',
      data: this.partsService.findAll()
    };
  }

  @Get('categories')
  getCategories() {
    return {
      success: true,
      message: 'Categorías obtenidas exitosamente',
      data: this.partsService.getCategories()
    };
  }

  @Get('brands')
  getBrands() {
    return {
      success: true,
      message: 'Marcas obtenidas exitosamente',
      data: this.partsService.getBrands()
    };
  }

  @Get('search')
  search(
    @Query('q') query?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('vehicleType') vehicleType?: VehicleType,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string
  ) {
    let parts = this.partsService.findAll();

    if (query) {
      parts = this.partsService.search(query);
    }

    if (category) {
      parts = this.partsService.findByCategory(category);
    }

    if (brand) {
      parts = this.partsService.findByBrand(brand);
    }

    if (vehicleType) {
      parts = this.partsService.findByVehicleType(vehicleType);
    }

    if (minPrice && maxPrice) {
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);
      parts = this.partsService.findByPriceRange(min, max);
    }

    return {
      success: true,
      message: 'Búsqueda completada exitosamente',
      data: parts,
      count: parts.length
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return {
      success: true,
      message: 'Repuesto encontrado exitosamente',
      data: this.partsService.findOne(id)
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePartDto: UpdatePartDto) {
    return {
      success: true,
      message: 'Repuesto actualizado exitosamente',
      data: this.partsService.update(id, updatePartDto)
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    this.partsService.remove(id);
    return {
      success: true,
      message: 'Repuesto eliminado exitosamente'
    };
  }
}
