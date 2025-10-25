import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { Bid, BidStatus } from './entities/bid.entity';
import { ServiceStatus } from './entities/service-request.entity';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class BidsService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private translatePaymentTerms(paymentTerms: string): string {
    const translations: Record<string, string> = {
      'full_upfront': 'Pago Total por Adelantado',
      'partial_upfront': 'Pago Parcial Adelantado (50%)',
      'on_completion': 'Pago al Completar',
      'installments': 'Pago en Cuotas'
    };
    return translations[paymentTerms] || paymentTerms;
  }

  private mapToBid(data: any): Bid {
    return {
      id: data.id,
      serviceRequestId: data.request_id,
      providerId: data.provider_id,
      providerName: data.provider_name,
      totalAmount: data.total_price,
      items: data.items ? JSON.parse(data.items) : undefined,
      warranty: data.warranty_info,
      estimatedTime: data.estimated_time,
      notes: data.notes,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async create(
    createDto: CreateBidDto,
    providerId: string,
    providerName: string,
    providerRating?: number
  ): Promise<Bid> {
    const supabase = this.supabaseService.getClient();

    const { data: serviceRequest, error: srError } = await supabase
      .from('service_requests')
      .select('*')
      .eq('id', createDto.serviceRequestId)
      .single();

    if (srError || !serviceRequest) {
      throw new NotFoundException('Solicitud de servicio no encontrada');
    }

    if (
      serviceRequest.status !== ServiceStatus.PENDING &&
      serviceRequest.status !== ServiceStatus.RECEIVING_BIDS
    ) {
      throw new BadRequestException('Esta solicitud ya no acepta ofertas');
    }

    const { data: existingBids } = await supabase
      .from('service_bids')
      .select('*')
      .eq('request_id', createDto.serviceRequestId)
      .eq('provider_id', providerId);

    if (existingBids && existingBids.length > 0) {
      throw new BadRequestException('Ya has hecho una oferta para esta solicitud');
    }

    const bidData = {
      request_id: createDto.serviceRequestId,
      provider_id: providerId,
      provider_name: providerName,
      total_price: createDto.totalAmount,
      items: createDto.items ? JSON.stringify(createDto.items) : null,
      estimated_time: createDto.estimatedCompletionTime?.toString() || null,
      warranty_info: createDto.warrantyDetails || (createDto.warrantyPeriod ? `${createDto.warrantyPeriod} días` : null),
      notes: [
        createDto.notes,
        createDto.paymentTerms ? `Forma de pago: ${this.translatePaymentTerms(createDto.paymentTerms)}` : null
      ].filter(Boolean).join('\n') || null,
      status: BidStatus.PENDING,
    };

    const { data, error } = await supabase
      .from('service_bids')
      .insert(bidData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating bid: ${error.message}`);
    }

    // El trigger increment_bids_count actualiza automáticamente el contador
    return this.mapToBid(data);
  }

  async findAll(): Promise<Bid[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('service_bids')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching bids: ${error.message}`);
    }

    return data.map(bid => this.mapToBid(bid));
  }

  async findOne(id: string): Promise<Bid> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('service_bids')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Oferta ${id} no encontrada`);
    }

    return this.mapToBid(data);
  }

  async findByServiceRequestId(serviceRequestId: string): Promise<Bid[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('service_bids')
      .select('*')
      .eq('request_id', serviceRequestId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching bids by service request: ${error.message}`);
    }

    return data.map(bid => this.mapToBid(bid));
  }

  async findByProviderId(providerId: string): Promise<Bid[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('service_bids')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false});

    if (error) {
      throw new Error(`Error fetching bids by provider: ${error.message}`);
    }

    return data.map(bid => this.mapToBid(bid));
  }

  async update(id: string, updateDto: UpdateBidDto, providerId: string): Promise<Bid> {
    const bid = await this.findOne(id);

    if (bid.providerId !== providerId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta oferta');
    }

    if (bid.status === BidStatus.ACCEPTED || bid.status === BidStatus.REJECTED) {
      throw new BadRequestException('No se puede actualizar una oferta aceptada o rechazada');
    }

    const supabase = this.supabaseService.getClient();

    const updateData: any = {};
    if (updateDto.totalAmount !== undefined) updateData.total_price = updateDto.totalAmount;
    if (updateDto.items) updateData.items = JSON.stringify(updateDto.items);
    if (updateDto.warranty) updateData.warranty_info = updateDto.warranty;
    if (updateDto.estimatedTime) updateData.estimated_time = updateDto.estimatedTime;
    if (updateDto.notes) updateData.notes = updateDto.notes;

    const { data, error } = await supabase
      .from('service_bids')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Oferta ${id} no encontrada`);
    }

    return this.mapToBid(data);
  }

  async withdraw(id: string, providerId: string): Promise<Bid> {
    const bid = await this.findOne(id);

    if (bid.providerId !== providerId) {
      throw new ForbiddenException('No tienes permiso para retirar esta oferta');
    }

    if (bid.status === BidStatus.ACCEPTED) {
      throw new BadRequestException('No se puede retirar una oferta ya aceptada');
    }

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('service_bids')
      .update({ status: BidStatus.WITHDRAWN })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Oferta ${id} no encontrada`);
    }

    return this.mapToBid(data);
  }

  async delete(id: string, providerId: string): Promise<void> {
    const bid = await this.findOne(id);

    if (bid.providerId !== providerId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta oferta');
    }

    if (bid.status !== BidStatus.PENDING && bid.status !== BidStatus.WITHDRAWN) {
      throw new BadRequestException('Solo se pueden eliminar ofertas pendientes o retiradas');
    }

    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('service_bids')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting bid: ${error.message}`);
    }
  }
}
