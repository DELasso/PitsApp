import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Bid, BidStatus } from './entities/bid.entity';

@Injectable()
export class BidsFileService {
  private readonly filePath = join(process.cwd(), 'data', 'bids.json');

  async findAll(): Promise<Bid[]> {
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

  async findOne(id: string): Promise<Bid | undefined> {
    const bids = await this.findAll();
    return bids.find(bid => bid.id === id);
  }

  async findByServiceRequestId(serviceRequestId: string): Promise<Bid[]> {
    const bids = await this.findAll();
    return bids.filter(bid => bid.serviceRequestId === serviceRequestId);
  }

  async findByProviderId(providerId: string): Promise<Bid[]> {
    const bids = await this.findAll();
    return bids.filter(bid => bid.providerId === providerId);
  }

  async findByStatus(status: BidStatus): Promise<Bid[]> {
    const bids = await this.findAll();
    return bids.filter(bid => bid.status === status);
  }

  async create(bid: Bid): Promise<Bid> {
    const bids = await this.findAll();
    bids.push(bid);
    await this.saveAll(bids);
    return bid;
  }

  async update(id: string, updateData: Partial<Bid>): Promise<Bid | null> {
    const bids = await this.findAll();
    const index = bids.findIndex(bid => bid.id === id);
    
    if (index === -1) {
      return null;
    }

    bids[index] = {
      ...bids[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await this.saveAll(bids);
    return bids[index];
  }

  async updateStatusByServiceRequestId(
    serviceRequestId: string,
    newStatus: BidStatus,
    excludeBidId?: string
  ): Promise<void> {
    const bids = await this.findAll();
    let modified = false;

    for (const bid of bids) {
      if (bid.serviceRequestId === serviceRequestId && bid.id !== excludeBidId) {
        bid.status = newStatus;
        bid.updatedAt = new Date().toISOString();
        modified = true;
      }
    }

    if (modified) {
      await this.saveAll(bids);
    }
  }

  async delete(id: string): Promise<boolean> {
    const bids = await this.findAll();
    const filteredBids = bids.filter(bid => bid.id !== id);
    
    if (filteredBids.length === bids.length) {
      return false;
    }

    await this.saveAll(filteredBids);
    return true;
  }

  private async saveAll(bids: Bid[]): Promise<void> {
    // Asegurar que el directorio existe
    const dir = join(process.cwd(), 'data');
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Ignorar si ya existe
    }

    await fs.writeFile(this.filePath, JSON.stringify(bids, null, 2), 'utf-8');
  }
}
