import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRequestsFileService } from './service-requests-file.service';
import { BidsFileService } from './bids-file.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { ServiceRequest, ServiceStatus } from './entities/service-request.entity';

@Injectable()
export class ServiceRequestsService {
  constructor(
    private readonly fileService: ServiceRequestsFileService,
    private readonly bidsFileService: BidsFileService,
  ) {}

  async create(createDto: CreateServiceRequestDto, clientId: string): Promise<ServiceRequest> {
    const now = new Date().toISOString();
    
    // Calcular fecha de expiración (por defecto 7 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const serviceRequest: ServiceRequest = {
      id: uuidv4(),
      clientId,
      ...createDto,
      status: ServiceStatus.PENDING,
      bidsCount: 0,
      createdAt: now,
      updatedAt: now,
      expiresAt: expiresAt.toISOString(),
    };

    return await this.fileService.create(serviceRequest);
  }

  async findAll(): Promise<ServiceRequest[]> {
    return await this.fileService.findAll();
  }

  async findAvailableForBids(): Promise<ServiceRequest[]> {
    return await this.fileService.findAvailableForBids();
  }

  async findOne(id: string): Promise<ServiceRequest> {
    const request = await this.fileService.findOne(id);
    if (!request) {
      throw new NotFoundException(`Solicitud de servicio ${id} no encontrada`);
    }
    return request;
  }

  async findByClientId(clientId: string): Promise<ServiceRequest[]> {
    return await this.fileService.findByClientId(clientId);
  }

  async findByStatus(status: ServiceStatus): Promise<ServiceRequest[]> {
    return await this.fileService.findByStatus(status);
  }

  async update(
    id: string,
    updateDto: UpdateServiceRequestDto,
    userId: string,
    isClient: boolean = true
  ): Promise<ServiceRequest> {
    const request = await this.findOne(id);

    // Solo el cliente puede actualizar su propia solicitud
    if (isClient && request.clientId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta solicitud');
    }

    // No permitir actualizar si ya fue aceptada o completada
    if (request.status === ServiceStatus.COMPLETED || request.status === ServiceStatus.IN_PROGRESS) {
      throw new BadRequestException('No se puede actualizar una solicitud en progreso o completada');
    }

    const updated = await this.fileService.update(id, updateDto);
    if (!updated) {
      throw new NotFoundException(`Solicitud de servicio ${id} no encontrada`);
    }

    return updated;
  }

  async acceptBid(serviceRequestId: string, bidId: string, clientId: string): Promise<ServiceRequest> {
    const request = await this.findOne(serviceRequestId);

    // Verificar que el cliente sea el dueño de la solicitud
    if (request.clientId !== clientId) {
      throw new ForbiddenException('No tienes permiso para aceptar ofertas en esta solicitud');
    }

    // Verificar que la oferta exista
    const bid = await this.bidsFileService.findOne(bidId);
    if (!bid || bid.serviceRequestId !== serviceRequestId) {
      throw new NotFoundException('Oferta no encontrada');
    }

    // Actualizar estado de la solicitud
    const updated = await this.fileService.update(serviceRequestId, {
      status: ServiceStatus.BID_ACCEPTED,
      acceptedBidId: bidId,
    });

    // Actualizar estado de todas las ofertas (aceptada y rechazadas)
    await this.bidsFileService.update(bidId, { status: 'accepted' as any });
    await this.bidsFileService.updateStatusByServiceRequestId(
      serviceRequestId,
      'rejected' as any,
      bidId
    );

    return updated!;
  }

  async updateStatus(id: string, status: ServiceStatus, userId: string): Promise<ServiceRequest> {
    const request = await this.findOne(id);

    // Verificar permisos según el estado
    if (status === ServiceStatus.CANCELLED && request.clientId !== userId) {
      throw new ForbiddenException('Solo el cliente puede cancelar la solicitud');
    }

    const updated = await this.fileService.update(id, { status });
    if (!updated) {
      throw new NotFoundException(`Solicitud de servicio ${id} no encontrada`);
    }

    return updated;
  }

  async delete(id: string, clientId: string): Promise<void> {
    const request = await this.findOne(id);

    // Solo el cliente puede eliminar su propia solicitud
    if (request.clientId !== clientId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta solicitud');
    }

    // Solo se puede eliminar si está en estado PENDING o CANCELLED
    if (request.status !== ServiceStatus.PENDING && request.status !== ServiceStatus.CANCELLED) {
      throw new BadRequestException('Solo se pueden eliminar solicitudes pendientes o canceladas');
    }

    const deleted = await this.fileService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Solicitud de servicio ${id} no encontrada`);
    }
  }
}
