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
import { WorkshopsService } from './workshops.service';
import { WorkshopReviewsService } from './workshop-reviews.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { CreateWorkshopReviewDto } from './dto/create-workshop-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole, BusinessType } from '../users/entities/user.entity';

@Controller('workshops')
export class WorkshopsController {
  constructor(
    private readonly workshopsService: WorkshopsService,
    private readonly workshopReviewsService: WorkshopReviewsService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createWorkshopDto: CreateWorkshopDto, @Request() req) {
    const user = req.user;

    // Verificar que el usuario sea un proveedor
    if (user.role !== UserRole.PROVEEDOR) {
      throw new ForbiddenException('Solo los proveedores pueden crear talleres');
    }

    // Verificar que el proveedor pueda crear talleres según su tipo de negocio
    if (user.businessType !== BusinessType.TALLER_MECANICO && 
        user.businessType !== BusinessType.TALLER_Y_REPUESTOS) {
      throw new ForbiddenException('Tu tipo de negocio no permite crear talleres');
    }

    const workshop = await this.workshopsService.create(createWorkshopDto, user.sub);
    
    return {
      success: true,
      message: 'Taller creado exitosamente',
      data: workshop
    };
  }

  @Get()
  async findAll() {
    const workshops = await this.workshopsService.findAll();
    return {
      success: true,
      message: 'Talleres obtenidos exitosamente',
      data: workshops
    };
  }

  @Get('my-workshops')
  @UseGuards(JwtAuthGuard)
  async findMyWorkshops(@Request() req) {
    const user = req.user;

    if (user.role !== UserRole.PROVEEDOR) {
      throw new ForbiddenException('Solo los proveedores pueden acceder a esta función');
    }

    const workshops = await this.workshopsService.findByOwner(user.sub);
    return {
      success: true,
      message: 'Talleres del proveedor obtenidos exitosamente',
      data: workshops
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

    const workshops = await this.workshopsService.search(query);
    return {
      success: true,
      message: 'Búsqueda realizada exitosamente',
      data: workshops
    };
  }

  @Get('city/:city')
  async findByCity(@Param('city') city: string) {
    const workshops = await this.workshopsService.findByCity(city);
    return {
      success: true,
      message: `Talleres en ${city} obtenidos exitosamente`,
      data: workshops
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const workshop = await this.workshopsService.findOne(id);
    return {
      success: true,
      message: 'Taller obtenido exitosamente',
      data: workshop
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string, 
    @Body() updateWorkshopDto: UpdateWorkshopDto,
    @Request() req
  ) {
    const user = req.user;

    if (user.role !== UserRole.PROVEEDOR) {
      throw new ForbiddenException('Solo los proveedores pueden actualizar talleres');
    }

    const workshop = await this.workshopsService.update(id, updateWorkshopDto, user.sub);
    
    return {
      success: true,
      message: 'Taller actualizado exitosamente',
      data: workshop
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    const user = req.user;

    if (user.role !== UserRole.PROVEEDOR) {
      throw new ForbiddenException('Solo los proveedores pueden eliminar talleres');
    }

    await this.workshopsService.remove(id, user.sub);
    
    return {
      success: true,
      message: 'Taller eliminado exitosamente'
    };
  }

  // ============ REVIEWS ENDPOINTS ============

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Param('id') workshopId: string,
    @Body() createReviewDto: CreateWorkshopReviewDto,
    @Request() req
  ) {
    const user = req.user;
    
    // Asegurarse de que el workshopId en el DTO coincida con el parámetro de ruta
    createReviewDto.workshopId = workshopId;

    const review = await this.workshopReviewsService.create(
      createReviewDto,
      user.sub,
      user.fullName || user.email,
      user.role
    );

    // Actualizar el rating del taller
    const { averageRating, reviewCount } = await this.workshopReviewsService.getAverageRating(workshopId);
    await this.workshopsService.updateRating(workshopId, averageRating, reviewCount);

    return {
      success: true,
      message: 'Reseña creada exitosamente',
      data: review
    };
  }

  @Get(':id/reviews')
  async getReviews(@Param('id') workshopId: string) {
    const reviews = await this.workshopReviewsService.findByWorkshopId(workshopId);
    const { averageRating, reviewCount } = await this.workshopReviewsService.getAverageRating(workshopId);

    return {
      success: true,
      message: 'Reseñas obtenidas exitosamente',
      data: {
        reviews,
        averageRating,
        reviewCount
      }
    };
  }

  @Delete('reviews/:reviewId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @Request() req
  ) {
    const user = req.user;
    const deletedReview = await this.workshopReviewsService.delete(reviewId, user.sub);

    // Actualizar el rating del taller
    const { averageRating, reviewCount } = await this.workshopReviewsService.getAverageRating(deletedReview.workshopId);
    await this.workshopsService.updateRating(deletedReview.workshopId, averageRating, reviewCount);

    return {
      success: true,
      message: 'Reseña eliminada exitosamente'
    };
  }
}
