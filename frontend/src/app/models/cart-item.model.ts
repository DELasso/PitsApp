import { Part } from './part.model';

export interface CartItem {
  id: string;
  part: Part;
  quantity: number;
  addedAt: Date;
  subtotal: number;
}