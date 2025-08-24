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
import { WorkshopsService } from './workshops.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';

@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createWorkshopDto: CreateWorkshopDto) {
    return {
      success: true,
      message: 'Taller creado exitosamente',
      data: this.workshopsService.create(createWorkshopDto)
    };
  }

  @Get()
  findAll() {
    return {
      success: true,
      message: 'Talleres obtenidos exitosamente',
      data: this.workshopsService.findAll()
    };
  }

  @Get('search')
  search(
    @Query('service') service?: string,
    @Query('neighborhood') neighborhood?: string,
    @Query('lat') latitude?: string,
    @Query('lng') longitude?: string,
    @Query('radius') radius?: string
  ) {
    let workshops = this.workshopsService.findAll();

    if (service) {
      workshops = this.workshopsService.findByService(service);
    }

    if (neighborhood) {
      workshops = this.workshopsService.findByNeighborhood(neighborhood);
    }

    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusKm = radius ? parseFloat(radius) : 10;
      
      workshops = this.workshopsService.findByLocation(lat, lng, radiusKm);
    }

    return {
      success: true,
      message: 'Búsqueda completada exitosamente',
      data: workshops,
      count: workshops.length
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return {
      success: true,
      message: 'Taller encontrado exitosamente',
      data: this.workshopsService.findOne(id)
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkshopDto: UpdateWorkshopDto) {
    return {
      success: true,
      message: 'Taller actualizado exitosamente',
      data: this.workshopsService.update(id, updateWorkshopDto)
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    this.workshopsService.remove(id);
    return {
      success: true,
      message: 'Taller eliminado exitosamente'
    };
  }
}
