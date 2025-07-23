import { IPanyenProduct, IPanyenCreateInput, IPanyenUpdateInput } from './IPanyen';

export interface IPanyenRepository {
  findAll(): Promise<IPanyenProduct[]>;
  findById(id: string): Promise<IPanyenProduct | null>;
  create(data: IPanyenCreateInput): Promise<IPanyenProduct>;
  update(id: string, data: IPanyenUpdateInput): Promise<IPanyenProduct>;
  delete(id: string): Promise<void>;
  calculateStock(id: string): Promise<number>;
}