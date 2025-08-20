import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicExhibitor } from '@/types/market';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
// Composants d'icônes simples
const MailIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const ShoppingBagIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
);

interface ExhibitorCardProps {
  exhibitor: PublicExhibitor;
  showProducts?: boolean;
  variant?: 'compact' | 'detailed';
}

export const ExhibitorCard: React.FC<ExhibitorCardProps> = ({
  exhibitor,
  showProducts = true,
  variant = 'detailed'
}) => {
  const isCompact = variant === 'compact';

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Photo de profil */}
          <div className="flex-shrink-0">
            <Image
              src={exhibitor.profilePhoto || '/api/placeholder/80/80'}
              alt={`Photo de ${exhibitor.name}`}
              width={isCompact ? 48 : 64}
              height={isCompact ? 48 : 64}
              className="rounded-full object-cover"
            />
          </div>
          
          {/* Informations principales */}
          <div className="flex-1 min-w-0">
            <Text variant={isCompact ? 'body' : 'h5'} className="font-semibold text-gray-900 mb-1">
              {exhibitor.name}
            </Text>
            
            {exhibitor.description && !isCompact && (
              <Text variant="small" className="text-gray-600 mb-2 line-clamp-2">
                {exhibitor.description}
              </Text>
            )}
            
            {/* Spécialités */}
            {exhibitor.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {exhibitor.specialties.slice(0, isCompact ? 2 : 3).map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {exhibitor.specialties.length > (isCompact ? 2 : 3) && (
                  <Badge variant="outline" className="text-xs">
                    +{exhibitor.specialties.length - (isCompact ? 2 : 3)}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Contact */}
            {!isCompact && (
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {exhibitor.email && (
                  <div className="flex items-center gap-1">
                    <MailIcon className="w-4 h-4" />
                    <span className="truncate">{exhibitor.email}</span>
                  </div>
                )}
                {exhibitor.phone && (
                  <div className="flex items-center gap-1">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{exhibitor.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      {/* Produits annoncés */}
      {showProducts && exhibitor.products.length > 0 && (
        <CardContent className="pt-0">
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBagIcon className="w-4 h-4 text-green-600" />
              <Text variant="small" className="font-medium text-gray-900">
                Produits annoncés ({exhibitor.products.length})
              </Text>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {exhibitor.products.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <Text variant="small" className="font-medium text-gray-900 truncate">
                      {product.name}
                    </Text>
                    <Text variant="small" className="text-gray-600">
                      {product.price}€{product.unit && `/${product.unit}`}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
            
            {exhibitor.products.length > 3 && (
              <Text variant="small" className="text-gray-500 mt-2">
                +{exhibitor.products.length - 3} autres produits
              </Text>
            )}
          </div>
        </CardContent>
      )}
      
      {/* Actions */}
      {!isCompact && (
        <CardContent className="pt-0">
          <div className="border-t pt-4">
            <Link href={`/manrina-an-peyi-a/exposants/${exhibitor.id}`}>
              <Button variant="outline" className="w-full">
                Voir la fiche complète
              </Button>
            </Link>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ExhibitorCard;