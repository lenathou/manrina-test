/* eslint-disable react/no-unescaped-entities */
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/Card';
import { useMarketExhibitors } from '@/hooks/useMarketSessionsQuery';
// Composants d'icônes simples
const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
    </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            ry="2"
        ></rect>
        <line
            x1="16"
            y1="2"
            x2="16"
            y2="6"
        ></line>
        <line
            x1="8"
            y1="2"
            x2="8"
            y2="6"
        ></line>
        <line
            x1="3"
            y1="10"
            x2="21"
            y2="10"
        ></line>
    </svg>
);

const ShoppingBagIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line
            x1="3"
            y1="6"
            x2="21"
            y2="6"
        ></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const ExhibitorDetailPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const { exhibitors, loading, error } = useMarketExhibitors();

    // Trouver l'exposant spécifique dans la liste
    const exhibitor = useMemo(() => {
        if (!id || typeof id !== 'string' || !exhibitors) return null;
        return exhibitors.find(exhibitor => exhibitor.id === id) || null;
    }, [id, exhibitors]);

    const notFound = !loading && !error && !exhibitor;

    if (loading) {
        return (
            <div className="min-h-screen ">
                <div className="flex items-center justify-center h-96">
                    <Text
                        variant="body"
                        className="text-gray-600"
                    >
                        Chargement de la fiche exposant...
                    </Text>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Link
                        href="/manrina-an-peyi-a/exposants"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-8"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>Retour à la liste</span>
                    </Link>

                    <Card>
                        <CardContent className="p-8 text-center">
                            <Text
                                variant="h2"
                                className="text-red-500 mb-4"
                            >
                                Erreur de chargement
                            </Text>
                            <Text
                                variant="body"
                                className="text-gray-600 mb-6"
                            >
                                Une erreur s'est produite lors du chargement des exposants.
                            </Text>
                            <Button 
                                onClick={() => window.location.reload()}
                                variant="outline"
                            >
                                Réessayer
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (notFound || !exhibitor) {
        return (
            <div className="min-h-screen">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Link
                        href="/manrina-an-peyi-a/exposants"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-8"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>Retour à la liste</span>
                    </Link>

                    <div className="text-center py-12">
                        <Text
                            variant="h2"
                            className="text-gray-500 mb-4"
                        >
                            Exposant non trouvé
                        </Text>
                        <Text
                            variant="body"
                            className="text-gray-400 mb-6"
                        >
                            L'exposant que vous recherchez n'existe pas ou n'est plus disponible.
                        </Text>
                        <Link href="/manrina-an-peyi-a/exposants">
                            <Button variant="outline">Voir tous les exposants</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Navigation */}
                <Link
                    href="/manrina-an-peyi-a/exposants"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-8"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Retour à la liste</span>
                </Link>

                {/* En-tête de l'exposant */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Photo de profil */}
                            <div className="flex-shrink-0">
                                {exhibitor.profilePhoto ? (
                                    <Image
                                        src={exhibitor.profilePhoto}
                                        alt={`Photo de ${exhibitor.name}`}
                                        width={192}
                                        height={192}
                                        className="rounded-lg object-cover mx-auto lg:mx-0"
                                    />
                                ) : (
                                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto lg:mx-0">
                                        <UserIcon className="w-20 h-20 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Informations principales */}
                            <div className="flex-1">
                                <Text
                                    variant="h1"
                                    className="text-3xl font-bold text-gray-900 mb-4"
                                >
                                    {exhibitor.name}
                                </Text>

                                {exhibitor.description && (
                                    <Text
                                        variant="body"
                                        className="text-gray-600 mb-6 leading-relaxed line-clamp-3"
                                    >
                                        {exhibitor.description}
                                    </Text>
                                )}
                                
                                {!exhibitor.description && (
                                    <Text
                                        variant="body"
                                        className="text-gray-400 mb-6 italic"
                                    >
                                        Ce producteur n'a pas encore rédigé sa bio.
                                    </Text>
                                )}

                                {/* Spécialités */}
                                <div className="mb-6">
                                    <Text
                                        variant="small"
                                        className="font-medium text-gray-700 mb-2"
                                    >
                                        Spécialités
                                    </Text>
                                    <div className="flex flex-wrap gap-2">
                                        {exhibitor.specialties &&
                                            exhibitor.specialties.map((specialty, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="text-sm"
                                                >
                                                    {specialty}
                                                </Badge>
                                            ))}
                                    </div>
                                </div>

                                {/* Informations de contact */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {exhibitor.zone && (
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            </svg>
                                            <div>
                                                <Text
                                                    variant="small"
                                                    className="font-medium text-gray-700"
                                                >
                                                    Zone
                                                </Text>
                                                <Text
                                                    variant="small"
                                                    className="text-gray-600"
                                                >
                                                    {exhibitor.zone}
                                                </Text>
                                            </div>
                                        </div>
                                    )}

                                    {exhibitor.email && (
                                        <div className="flex items-center gap-3">
                                            <MailIcon className="w-5 h-5 text-green-600" />
                                            <div>
                                                <Text
                                                    variant="small"
                                                    className="font-medium text-gray-700"
                                                >
                                                    Email
                                                </Text>
                                                <Text
                                                    variant="small"
                                                    className="text-gray-600"
                                                >
                                                    {exhibitor.email}
                                                </Text>
                                            </div>
                                        </div>
                                    )}

                                    {exhibitor.phone && (
                                        <div className="flex items-center gap-3">
                                            <PhoneIcon className="w-5 h-5 text-green-600" />
                                            <div>
                                                <Text
                                                    variant="small"
                                                    className="font-medium text-gray-700"
                                                >
                                                    Téléphone
                                                </Text>
                                                <Text
                                                    variant="small"
                                                    className="text-gray-600"
                                                >
                                                    {exhibitor.phone}
                                                </Text>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <CalendarIcon className="w-5 h-5 text-green-600" />
                                        <div>
                                            <Text
                                                variant="small"
                                                className="font-medium text-gray-700"
                                            >
                                                Prochain marché
                                            </Text>
                                            <Text
                                                variant="small"
                                                className="text-gray-600"
                                            >
                                                {exhibitor.nextMarketDate
                                                    ? new Date(exhibitor.nextMarketDate).toLocaleDateString('fr-FR', {
                                                          weekday: 'long',
                                                          day: 'numeric',
                                                          month: 'long',
                                                      })
                                                    : 'Date non définie'}
                                            </Text>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <ShoppingBagIcon className="w-5 h-5 text-green-600" />
                                        <div>
                                            <Text
                                                variant="small"
                                                className="font-medium text-gray-700"
                                            >
                                                Produits disponibles
                                            </Text>
                                            <Text
                                                variant="small"
                                                className="text-gray-600"
                                            >
                                                {exhibitor.products.length} produit
                                                {exhibitor.products.length > 1 ? 's' : ''}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section Produits uniquement */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Text
                            variant="h3"
                            className="text-xl font-semibold"
                        >
                            Produits disponibles
                        </Text>
                        <Badge
                            variant="outline"
                            className="text-sm"
                        >
                            {exhibitor.products.length} produit{exhibitor.products.length > 1 ? 's' : ''}
                        </Badge>
                    </div>

                    {exhibitor.products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exhibitor.products.map((product) => (
                                <Card
                                    key={product.id}
                                    className="hover:shadow-lg transition-shadow"
                                >
                                    <CardContent className="p-4">
                                        {product.imageUrl && (
                                            <Image
                                                src={product.imageUrl}
                                                alt={product.name}
                                                width={400}
                                                height={192}
                                                className="w-full h-48 object-cover rounded-lg mb-4"
                                            />
                                        )}

                                        <div className="space-y-2">
                                            <Text
                                                variant="h5"
                                                className="font-semibold text-gray-900"
                                            >
                                                {product.name}
                                            </Text>

                                            {product.description && (
                                                <Text
                                                    variant="small"
                                                    className="text-gray-600 line-clamp-2"
                                                >
                                                    {product.description}
                                                </Text>
                                            )}

                                            <div className="flex items-center justify-between pt-2">
                                                <div>
                                                    <Text
                                                        variant="body"
                                                        className="font-semibold text-green-600"
                                                    >
                                                        {product.price}€
                                                        {product.unit && (
                                                            <span className="text-gray-500 font-normal">
                                                                /{product.unit}
                                                            </span>
                                                        )}
                                                    </Text>
                                                </div>

                                                {product.category && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {product.category}
                                                    </Badge>
                                                )}
                                            </div>


                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <Text
                                    variant="h4"
                                    className="text-gray-500 mb-2"
                                >
                                    Aucun produit annoncé
                                </Text>
                                <Text
                                    variant="body"
                                    className="text-gray-400"
                                >
                                    Cet exposant n'a pas encore annoncé de produits pour le prochain marché.
                                </Text>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ExhibitorDetailPage;
