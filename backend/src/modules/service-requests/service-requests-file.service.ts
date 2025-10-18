import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ServiceRequest, ServiceStatus } from './entities/service-request.entity';

@Injectable()
export class ServiceRequestsFileService {
  private readonly filePath = join(process.cwd(), 'data', 'service-requests.json');

  async findAll(): Promise<ServiceRequest[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Si el archivo no existe, retornar array vacío
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<ServiceRequest | undefined> {
    const requests = await this.findAll();
    return requests.find(request => request.id === id);
  }

  async findByClientId(clientId: string): Promise<ServiceRequest[]> {
    const requests = await this.findAll();
    return requests.filter(request => request.clientId === clientId);
  }

  async findByStatus(status: ServiceStatus): Promise<ServiceRequest[]> {
    const requests = await this.findAll();
    return requests.filter(request => request.status === status);
  }

  async findAvailableForBids(): Promise<ServiceRequest[]> {
    const requests = await this.findAll();
    return requests.filter(request => 
      request.status === ServiceStatus.PENDING || 
      request.status === ServiceStatus.RECEIVING_BIDS
    );
  }

  async create(request: ServiceRequest): Promise<ServiceRequest> {
    const requests = await this.findAll();
    requests.push(request);
    await this.saveAll(requests);
    return request;
  }

  async update(id: string, updateData: Partial<ServiceRequest>): Promise<ServiceRequest | null> {
    const requests = await this.findAll();
    const index = requests.findIndex(request => request.id === id);
    
    if (index === -1) {
      return null;
    }

    requests[index] = {
      ...requests[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await this.saveAll(requests);
    return requests[index];
  }

  async incrementBidsCount(id: string): Promise<void> {
    const requests = await this.findAll();
    const index = requests.findIndex(request => request.id === id);
    
    if (index !== -1) {
      requests[index].bidsCount = (requests[index].bidsCount || 0) + 1;
      
      // Cambiar estado a RECEIVING_BIDS si está en PENDING
      if (requests[index].status === ServiceStatus.PENDING) {
        requests[index].status = ServiceStatus.RECEIVING_BIDS;
      }
      
      await this.saveAll(requests);
    }
  }

  async delete(id: string): Promise<boolean> {
    const requests = await this.findAll();
    const filteredRequests = requests.filter(request => request.id !== id);
    
    if (filteredRequests.length === requests.length) {
      return false;
    }

    await this.saveAll(filteredRequests);
    return true;
  }

  private async saveAll(requests: ServiceRequest[]): Promise<void> {
    // Asegurar que el directorio existe
    const dir = join(process.cwd(), 'data');
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Ignorar si ya existe
    }

    await fs.writeFile(this.filePath, JSON.stringify(requests, null, 2), 'utf-8');
  }
}
