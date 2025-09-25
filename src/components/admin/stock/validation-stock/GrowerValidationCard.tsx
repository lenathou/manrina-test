import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface GrowerValidationCardProps {
    growerId: string;
    growerName: string;
    growerEmail: string;
    growerAvatar?: string | null;
    pendingRequestsCount: number;
    productsCount: number;
    lastRequestDate: Date;
    isSelected: boolean;
    onToggleSelection: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClick: () => void;
}

// Fonction utilitaire pour formater les dates
const formatDistanceToNow = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
};

function GrowerValidationCard({
    growerId,
    growerName,
    growerEmail,
    growerAvatar,
    pendingRequestsCount,
    productsCount,
    lastRequestDate,
    isSelected,
    onToggleSelection,
    onClick
}: GrowerValidationCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id={`select-grower-${growerId}`}
                                checked={isSelected}
                                onChange={onToggleSelection}
                                onClick={(e) => e.stopPropagation()}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                            />
                        </div>
                        {growerAvatar ? (
                            <Image
                                src={growerAvatar}
                                alt={growerName}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Text
                                    variant="small"
                                    className="text-gray-600 font-medium"
                                >
                                    {growerName.charAt(0).toUpperCase()}
                                </Text>
                            </div>
                        )}
                        <div>
                            <Text
                                variant="body"
                                className="font-medium text-blue-600 hover:text-blue-800"
                            >
                                {growerName}
                            </Text>
                            <Text
                                variant="small"
                                className="text-gray-500"
                            >
                                {growerEmail}
                            </Text>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {pendingRequestsCount} en attente
                    </Badge>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Text
                            variant="small"
                            className="text-gray-600"
                        >
                            Produits concernés:
                        </Text>
                        <Text
                            variant="body"
                            className="font-semibold text-green-600"
                        >
                            {productsCount}
                        </Text>
                    </div>

                    <div className="flex justify-between items-center">
                        <Text
                            variant="small"
                            className="text-gray-600"
                        >
                            Dernière demande:
                        </Text>
                        <Text
                            variant="small"
                            className="text-gray-500"
                        >
                            {formatDistanceToNow(lastRequestDate)}
                        </Text>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default GrowerValidationCard;