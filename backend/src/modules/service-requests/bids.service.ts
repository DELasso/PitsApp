import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { BidsFileService } from './bids-file.service';
import { ServiceRequestsFileService } from './service-requests-file.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { Bid, BidStatus } from './entities/bid.entity';
import { ServiceStatus } from './entities/service-request.entity';

@Injectable()
export class BidsService {
  constructor(
    private readonly fileService: BidsFileService,
    private readonly serviceRequestsFileService: ServiceRequestsFileService,
  ) {}

  async create(
    createDto: CreateBidDto,
    providerId: string,
    providerName: string,
    providerRating?: number
  ): Promise<Bid> {
    // Verificar que la solicitud de servicio existe y acepta ofertas
    const serviceRequest = await this.serviceRequestsFileService.findOne(createDto.serviceRequestId);
    if (!serviceRequest) {
      throw new NotFoundException('Solicitud de servicio no encontrada');
    }

    // Verificar que la solicitud acepta ofertas
    if (
      serviceRequest.status !== ServiceStatus.PENDING &&
      serviceRequest.status !== ServiceStatus.RECEIVING_BIDS
    ) {
      throw new BadRequestException('Esta solicitud ya no acepta ofertas');
    }

    // Verificar que el proveedor no haya hecho otra oferta
    const existingBids = await this.fileService.findByServiceRequestId(createDto.serviceRequestId);
    const providerAlreadyBid = existingBids.some(bid => bid.providerId === providerId);
    if (providerAlreadyBid) {
      throw new BadRequestException('Ya has hecho una oferta para esta solicitud');
    }

    const now = new Date().toISOString();

    const bid: Bid = {
      id: uuidv4(),
      ...createDto,
      providerId,
      providerName,
      providerRating,
      status: BidStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.fileService.create(bid);

    // Incrementar contador de ofertas en la solicitud
    await this.serviceRequestsFileService.incrementBidsCount(createDto.serviceRequestId);

    return created;
  }

  async findAll(): Promise<Bid[]> {
    return await this.fileService.findAll();
  }

  async findOne(id: string): Promise<Bid> {
    const bid = await this.fileService.findOne(id);
    if (!bid) {
      throw new NotFoundException(`Oferta ${id} no encontrada`);
    }
    return bid;
  }

  async findByServiceRequestId(serviceRequestId: string): Promise<Bid[]> {
    return await this.fileService.findByServiceRequestId(serviceRequestId);
  }

  async findByProviderId(providerId: string): Promise<Bid[]> {
    return await this.fileService.findByProviderId(providerId);
  }

  async update(id: string, updateDto: UpdateBidDto, providerId: string): Promise<Bid> {
    const bid = await this.findOne(id);

    // Solo el proveedor puede actualizar su propia oferta
    if (bid.providerId !== providerId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta oferta');
    }

    // No permitir actualizar si ya fue aceptada o rechazada
    if (bid.status === BidStatus.ACCEPTED || bid.status === BidStatus.REJECTED) {
      throw new BadRequestException('No se puede actualizar una oferta aceptada o rechazada');
    }

    const updated = await this.fileService.update(id, updateDto);
    if (!updated) {
      throw new NotFoundException(`Oferta ${id} no encontrada`);
    }

    return updated;
  }

  async withdraw(id: string, providerId: string): Promise<Bid> {
    const bid = await this.findOne(id);

    // Solo el proveedor puede retirar su propia oferta
    if (bid.providerId !== providerId) {
      throw new ForbiddenException('No tienes permiso para retirar esta oferta');
    }

    // No permitir retirar si ya fue aceptada
    if (bid.status === BidStatus.ACCEPTED) {
      throw new BadRequestException('No se puede retirar una oferta ya aceptada');
    }

    const updated = await this.fileService.update(id, { status: BidStatus.WITHDRAWN });
    if (!updated) {
      throw new NotFoundException(`Oferta ${id} no encontrada`);
    }

    return updated;
  }

  async delete(id: string, providerId: string): Promise<void> {
    const bid = await this.findOne(id);

    // Solo el proveedor puede eliminar su propia oferta
    if (bid.providerId !== providerId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta oferta');
    }

    // Solo se puede eliminar si está en estado PENDING o WITHDRAWN
    if (bid.status !== BidStatus.PENDING && bid.status !== BidStatus.WITHDRAWN) {
      throw new BadRequestException('Solo se pueden eliminar ofertas pendientes o retiradas');
    }

    const deleted = await this.fileService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Oferta ${id} no encontrada`);
    }
  }
}
