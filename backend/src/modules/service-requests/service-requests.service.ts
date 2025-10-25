import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { ServiceRequest, ServiceStatus } from './entities/service-request.entity';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class ServiceRequestsService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private mapToServiceRequest(data: any): ServiceRequest {
    let serviceDetails: any = data.service_details ? JSON.parse(data.service_details) : null;
    
    const result: ServiceRequest = {
      id: data.id,
      clientId: data.client_id,
      serviceType: data.service_type,
      vehicleType: data.vehicle_type,
      vehiclePlate: data.vehicle_plate,
      vehicleBrand: data.vehicle_brand,
      vehicleModel: data.vehicle_model,
      vehicleYear: data.vehicle_year,
      description: data.description,
      urgencyLevel: data.urgency_level,
      budgetMin: data.budget_min,
      budgetMax: data.budget_max,
      preferredDate: data.preferred_date,
      preferredTimeSlot: data.preferred_time_slot,
      additionalNotes: data.additional_notes,
      status: data.status,
      bidsCount: data.bids_count,
      acceptedBidId: data.accepted_bid_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      expiresAt: data.expires_at,
    };
    
    if (serviceDetails) {
      if (data.service_type === 'home_service') {
        result.homeServiceDetails = serviceDetails;
      } else if (data.service_type === 'tow_truck') {
        result.towTruckDetails = serviceDetails;
      } else if (data.service_type === 'express_oil_change') {
        result.oilChangeDetails = serviceDetails;
      } else if (data.service_type === 'mechanical_diagnosis') {
        result.diagnosisDetails = serviceDetails;
      } else {
        result.repairDetails = serviceDetails;
      }
    }
    
    return result;
  }

  async create(createDto: CreateServiceRequestDto, clientId: string): Promise<ServiceRequest> {
    const supabase = this.supabaseService.getClient();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    let serviceDetails = null;
    if (createDto.homeServiceDetails) {
      serviceDetails = JSON.stringify(createDto.homeServiceDetails);
    } else if (createDto.towTruckDetails) {
      serviceDetails = JSON.stringify(createDto.towTruckDetails);
    } else if (createDto.oilChangeDetails) {
      serviceDetails = JSON.stringify(createDto.oilChangeDetails);
    } else if (createDto.diagnosisDetails) {
      serviceDetails = JSON.stringify(createDto.diagnosisDetails);
    } else if (createDto.repairDetails) {
      serviceDetails = JSON.stringify(createDto.repairDetails);
    }

    const serviceRequestData = {
      client_id: clientId,
      service_type: createDto.serviceType,
      vehicle_type: createDto.vehicleType,
      vehicle_plate: createDto.vehiclePlate,
      vehicle_brand: createDto.vehicleBrand,
      vehicle_model: createDto.vehicleModel,
      vehicle_year: createDto.vehicleYear,
      description: createDto.description,
      urgency_level: createDto.urgencyLevel,
      budget_min: createDto.budgetMin || null,
      budget_max: createDto.budgetMax || null,
      preferred_date: createDto.preferredDate || null,
      preferred_time_slot: createDto.preferredTimeSlot || null,
      additional_notes: createDto.additionalNotes || null,
      service_details: serviceDetails,
      status: ServiceStatus.PENDING,
      bids_count: 0,
      expires_at: expiresAt.toISOString(),
    };

    const { data, error } = await supabase
      .from('service_requests')
      .insert(serviceRequestData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating service request: ${error.message}`);
    }

    return this.mapToServiceRequest(data);
  }

  async findAll(): Promise<ServiceRequest[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching service requests: ${error.message}`);
    }

    return data.map(sr => this.mapToServiceRequest(sr));
  }

  async findAvailableForBids(): Promise<ServiceRequest[]> {
    const supabase = this.supabaseService.getClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .in('status', [ServiceStatus.PENDING, ServiceStatus.RECEIVING_BIDS])
      .gt('expires_at', now)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching available service requests: ${error.message}`);
    }

    return data.map(sr => this.mapToServiceRequest(sr));
  }

  async findOne(id: string): Promise<ServiceRequest> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Solicitud de servicio ${id} no encontrada`);
    }

    return this.mapToServiceRequest(data);
  }

  async findByClientId(clientId: string): Promise<ServiceRequest[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching service requests by client: ${error.message}`);
    }

    return data.map(sr => this.mapToServiceRequest(sr));
  }

  async findByStatus(status: ServiceStatus): Promise<ServiceRequest[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching service requests by status: ${error.message}`);
    }

    return data.map(sr => this.mapToServiceRequest(sr));
  }

  async update(
    id: string,
    updateDto: UpdateServiceRequestDto,
    userId: string,
    isClient: boolean = true
  ): Promise<ServiceRequest> {
    const request = await this.findOne(id);

    if (isClient && request.clientId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta solicitud');
    }

    if (request.status === ServiceStatus.COMPLETED || request.status === ServiceStatus.IN_PROGRESS) {
      throw new BadRequestException('No se puede actualizar una solicitud en progreso o completada');
    }

    const supabase = this.supabaseService.getClient();

    const updateData: any = {};
    if (updateDto.description) updateData.description = updateDto.description;
    if (updateDto.urgencyLevel) updateData.urgency_level = updateDto.urgencyLevel;
    if (updateDto.budgetMin !== undefined) updateData.budget_min = updateDto.budgetMin;
    if (updateDto.budgetMax !== undefined) updateData.budget_max = updateDto.budgetMax;
    if (updateDto.preferredDate) updateData.preferred_date = updateDto.preferredDate;
    if (updateDto.preferredTimeSlot) updateData.preferred_time_slot = updateDto.preferredTimeSlot;
    if (updateDto.additionalNotes) updateData.additional_notes = updateDto.additionalNotes;
    
    if (updateDto.homeServiceDetails) {
      updateData.service_details = JSON.stringify(updateDto.homeServiceDetails);
    } else if (updateDto.towTruckDetails) {
      updateData.service_details = JSON.stringify(updateDto.towTruckDetails);
    } else if (updateDto.oilChangeDetails) {
      updateData.service_details = JSON.stringify(updateDto.oilChangeDetails);
    } else if (updateDto.diagnosisDetails) {
      updateData.service_details = JSON.stringify(updateDto.diagnosisDetails);
    } else if (updateDto.repairDetails) {
      updateData.service_details = JSON.stringify(updateDto.repairDetails);
    }
    
    if (updateDto.status) updateData.status = updateDto.status;

    const { data, error } = await supabase
      .from('service_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Solicitud de servicio ${id} no encontrada`);
    }

    return this.mapToServiceRequest(data);
  }

  async acceptBid(serviceRequestId: string, bidId: string, clientId: string): Promise<ServiceRequest> {
    const request = await this.findOne(serviceRequestId);

    if (request.clientId !== clientId) {
      throw new ForbiddenException('No tienes permiso para aceptar ofertas en esta solicitud');
    }

    const supabase = this.supabaseService.getClient();

    const { data: bid, error: bidError } = await supabase
      .from('service_bids')
      .select('*')
      .eq('id', bidId)
      .eq('request_id', serviceRequestId)
      .single();

    if (bidError || !bid) {
      throw new NotFoundException('Oferta no encontrada');
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from('service_requests')
      .update({
        status: ServiceStatus.BID_ACCEPTED,
        accepted_bid_id: bidId,
      })
      .eq('id', serviceRequestId)
      .select()
      .single();

    if (updateError || !updatedRequest) {
      throw new Error(`Error accepting bid: ${updateError?.message}`);
    }

    await supabase
      .from('service_bids')
      .update({ status: 'accepted' })
      .eq('id', bidId);

    await supabase
      .from('service_bids')
      .update({ status: 'rejected' })
      .eq('request_id', serviceRequestId)
      .neq('id', bidId);

    return this.mapToServiceRequest(updatedRequest);
  }

  async updateStatus(id: string, status: ServiceStatus, userId: string): Promise<ServiceRequest> {
    const request = await this.findOne(id);

    if (status === ServiceStatus.CANCELLED && request.clientId !== userId) {
      throw new ForbiddenException('Solo el cliente puede cancelar la solicitud');
    }

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('service_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Solicitud de servicio ${id} no encontrada`);
    }

    return this.mapToServiceRequest(data);
  }

  async delete(id: string, clientId: string): Promise<void> {
    const request = await this.findOne(id);

    if (request.clientId !== clientId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta solicitud');
    }

    if (request.status !== ServiceStatus.PENDING && request.status !== ServiceStatus.CANCELLED) {
      throw new BadRequestException('Solo se pueden eliminar solicitudes pendientes o canceladas');
    }

    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('service_requests')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting service request: ${error.message}`);
    }
  }
}
