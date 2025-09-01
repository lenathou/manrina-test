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

const UserIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
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
    <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50 overflow-hidden group">
      <CardHeader className="pb-4 relative">
        {/* Accent décoratif */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
        
        <div className="flex items-start gap-4">
          {/* Photo de profil */}
          <div className="flex-shrink-0 relative">
            <div className="relative">
              {exhibitor.profilePhoto ? (
                <Image
                  src={exhibitor.profilePhoto}
                  alt={`Photo de ${exhibitor.name}`}
                  width={isCompact ? 48 : 72}
                  height={isCompact ? 48 : 72}
                  className="rounded-full object-cover ring-3 ring-white shadow-lg group-hover:ring-green-100 transition-all duration-300"
                />
              ) : (
                <div className={`${isCompact ? 'w-12 h-12' : 'w-18 h-18'} bg-gray-100 rounded-full flex items-center justify-center ring-3 ring-white shadow-lg group-hover:ring-green-100 transition-all duration-300`}>
                  <UserIcon className={`${isCompact ? 'w-6 h-6' : 'w-8 h-8'} text-gray-400`} />
                </div>
              )}
              {/* Badge de statut */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
          </div>
          
          {/* Informations principales */}
          <div className="flex-1 min-w-0">
            <Text variant={isCompact ? 'body' : 'h5'} className="font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors duration-200">
              {exhibitor.name}
            </Text>
            
            {exhibitor.description && !isCompact && (
              <Text variant="small" className="text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                {exhibitor.description}
              </Text>
            )}
            
            {/* Spécialités */}
            {exhibitor.specialties && exhibitor.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {exhibitor.specialties.slice(0, isCompact ? 2 : 3).map((specialty, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors duration-200 font-medium px-2 py-1"
                  >
                    {specialty}
                  </Badge>
                ))}
                {exhibitor.specialties && exhibitor.specialties.length > (isCompact ? 2 : 3) && (
                  <Badge 
                    variant="outline" 
                    className="text-xs border-gray-300 text-gray-600 hover:border-green-300 hover:text-green-600 transition-colors duration-200"
                  >
                    +{exhibitor.specialties.length - (isCompact ? 2 : 3)}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Contact et Zone */}
            {!isCompact && (
              <div className="flex flex-col gap-2 text-sm">
                {exhibitor.zone && (
                  <div className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200">
                    <div className="p-1 bg-gray-100 rounded-full group-hover:bg-green-100 transition-colors duration-200">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <span className="font-medium">{exhibitor.zone}</span>
                  </div>
                )}
                {exhibitor.email && (
                  <div className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200">
                    <div className="p-1 bg-gray-100 rounded-full group-hover:bg-green-100 transition-colors duration-200">
                      <MailIcon className="w-3 h-3" />
                    </div>
                    <span className="truncate font-medium">{exhibitor.email}</span>
                  </div>
                )}
                {exhibitor.phone && (
                  <div className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200">
                    <div className="p-1 bg-gray-100 rounded-full group-hover:bg-green-100 transition-colors duration-200">
                      <PhoneIcon className="w-3 h-3" />
                    </div>
                    <span className="font-medium">{exhibitor.phone}</span>
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
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-green-100 rounded-full">
                <ShoppingBagIcon className="w-4 h-4 text-green-600" />
              </div>
              <Text variant="small" className="font-bold text-gray-900">
                Produits annoncés
              </Text>
              <Badge variant="outline" className="ml-auto text-xs bg-green-50 text-green-700 border-green-200">
                {exhibitor.products.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {exhibitor.products.slice(0, 3).map((product) => (
                <div key={product.id} className="group/product flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all duration-200">
                  <div className="flex-1 min-w-0">
                    <Text variant="small" className="font-semibold text-gray-900 truncate group-hover/product:text-green-700 transition-colors duration-200">
                      {product.name}
                    </Text>
                    <div className="flex items-center gap-2 mt-1">
                      <Text variant="small" className="text-green-600 font-bold">
                        {product.price}€{product.unit && `/${product.unit}`}
                      </Text>
                      {product.category && (
                        <Badge variant="outline" className="text-xs bg-white border-gray-200 text-gray-600">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {exhibitor.products.length > 3 && (
              <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-100">
                <Text variant="small" className="text-green-700 font-medium text-center">
                  +{exhibitor.products.length - 3} autres produits disponibles
                </Text>
              </div>
            )}
          </div>
        </CardContent>
      )}
      
      {/* Actions */}
      {!isCompact && (
        <CardContent className="pt-0">
          <div className="border-t border-gray-100 pt-4">
            <Link href={`/manrina-an-peyi-a/exposants/${exhibitor.id}`}>
              <Button 
                variant="outline" 
                className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 hover:text-green-800 transition-all duration-200 font-semibold shadow-sm hover:shadow-md group/button"
              >
                <span className="group-hover/button:scale-105 transition-transform duration-200">
                  Voir la fiche complète
                </span>
              </Button>
            </Link>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ExhibitorCard;