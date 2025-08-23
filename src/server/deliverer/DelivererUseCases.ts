import { JwtService } from '../services/JwtService';
import { IDeliverer, IDelivererLoginPayload, IDelivererLoginResponse, IDelivererTokenPayload, IDelivery } from './IDeliverer';
import { IDelivererRepository } from './IDelivererRepository';
import { Basket } from '../checkout/IBasket';

export class DelivererUseCases {
  constructor(
    private delivererRepository: IDelivererRepository,
    private jwtService: JwtService,
  ) {}

  public async login(payload: IDelivererLoginPayload): Promise<IDelivererLoginResponse> {
    const deliverer = await this.delivererRepository.findByEmail(payload.email);

    if (!deliverer || !deliverer.isActive) {
      throw new Error('Invalid credentials or account disabled');
    }

    const isPasswordValid = await this.delivererRepository.verifyPassword(payload.password, deliverer.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(deliverer);
    return {
      success: true,
      jwt: token,
    };
  }

  public async getMyDeliveries(delivererId: string): Promise<IDelivery[]> {
    return this.delivererRepository.getAssignedDeliveries(delivererId);
  }

  public async updateDeliveryStatus(deliveryId: string, status: string, notes?: string): Promise<void> {
    return this.delivererRepository.updateDeliveryStatus(deliveryId, status, notes);
  }

  public async changePassword(delivererId: string, currentPassword: string, newPassword: string) {
    // Récupérer le livreur avec son mot de passe
    const deliverer = await this.delivererRepository.findByIdWithPassword(delivererId);
    if (!deliverer) {
      throw new Error('Livreur non trouvé');
    }

    // Vérifier l'ancien mot de passe
    const isCurrentPasswordValid = await this.delivererRepository.verifyPassword(currentPassword, deliverer.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Mot de passe actuel incorrect');
    }

    // Mettre à jour le mot de passe
    return await this.delivererRepository.updatePassword(delivererId, newPassword);
  }

  private generateToken(deliverer: IDeliverer): string {
    const payload: IDelivererTokenPayload = {
      id: deliverer.id,
      email: deliverer.email,
      name: deliverer.name,
      zone: deliverer.zone,
    };
    return this.jwtService.generateToken(payload);
  }

  // Nouvelle méthode pour créer une livraison avec plusieurs paniers
  public async createDeliveryWithBaskets(delivererId: string, basketIds: string[]): Promise<IDelivery> {
      // Vérifier que le livreur existe
      const deliverer = await this.delivererRepository.findByEmail(delivererId);
      if (!deliverer) {
          throw new Error('Deliverer not found');
      }
  
      return this.delivererRepository.assignBasketsToDelivery(basketIds, delivererId);
  }

  public async getUnassignedBaskets(): Promise<Basket[]> {
      const baskets = await this.delivererRepository.getUnassignedBaskets();
      return baskets.map(basket => new Basket(basket));
  }

  public verifyToken(token: string): IDelivererTokenPayload | null {
    try {
      return this.jwtService.verifyToken(token) as IDelivererTokenPayload;
    } catch (error) {
      return null;
    }
  }
}