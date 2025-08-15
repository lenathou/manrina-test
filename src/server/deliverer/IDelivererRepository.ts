import { IDeliverer, IDelivery } from './IDeliverer';

export interface IDelivererRepository {
  findByEmail(email: string): Promise<IDeliverer | undefined>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  createDeliverer(data: Omit<IDeliverer, 'id' | 'createdAt' | 'updatedAt'>): Promise<IDeliverer>;
  updatePassword(delivererId: string, newPassword: string): Promise<void>;
  updateProfile(delivererId: string, data: Partial<IDeliverer>): Promise<IDeliverer>;
  listDeliverers(): Promise<IDeliverer[]>;
  
  // Gestion des livraisons
  getAssignedDeliveries(delivererId: string): Promise<IDelivery[]>;
  updateDeliveryStatus(deliveryId: string, status: string, notes?: string): Promise<void>;
  assignDelivery(deliveryId: string, delivererId: string): Promise<void>;
  
  // Nouvelles méthodes
  assignBasketsToDelivery(basketIds: string[], delivererId: string): Promise<IDelivery>;
  getUnassignedBaskets(): Promise<any[]>;
}