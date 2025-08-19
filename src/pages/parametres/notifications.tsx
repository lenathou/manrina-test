/* eslint-disable react/no-unescaped-entities */
import { GetServerSideProps } from 'next';
import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';
import { PushNotificationManager } from '../../pwa/PushNotificationManager';

// Interface pour adapter les types de getServerSideProps aux types attendus par apiUseCases
interface AuthRequest {
    req: NextApiRequest;
    res: NextApiResponse;
}

export default function NotificationsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.343 12.344l7.539 7.539a2.25 2.25 0 003.182 0l7.539-7.539a2.25 2.25 0 000-3.182L15.064 1.623a2.25 2.25 0 00-3.182 0L4.343 9.162a2.25 2.25 0 000 3.182z" />
                            </svg>
                            <h1 className="text-2xl font-bold text-gray-900">Paramètres de Notifications</h1>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                            Gérez vos préférences de notifications pour rester informé des événements importants
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Notifications Push Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Notifications Push</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Activez les notifications push pour recevoir des alertes en temps réel
                            </p>
                        </div>
                        <div className="px-6 py-6">
                            <PushNotificationManager hideStatus={true} />
                        </div>
                    </div>

                    {/* Types de Notifications Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Types de Notifications</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Voici les différents types de notifications que vous pouvez recevoir
                            </p>
                        </div>
                        <div className="px-6 py-6">
                            <div className="space-y-4">
                                {/* Annulations de marchés */}
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">Annulations de marchés</h3>
                                        <p className="text-sm text-gray-600">
                                            Soyez informé lorsqu'un marché auquel vous participez est annulé
                                        </p>
                                    </div>
                                </div>

                                {/* Nouvelles commandes */}
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">Nouvelles commandes</h3>
                                        <p className="text-sm text-gray-600">
                                            Recevez une alerte pour chaque nouvelle commande reçue
                                        </p>
                                    </div>
                                </div>

                                {/* Mises à jour de livraisons */}
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">Mises à jour de livraisons</h3>
                                        <p className="text-sm text-gray-600">
                                            Suivez l'état de vos livraisons en temps réel
                                        </p>
                                    </div>
                                </div>

                                {/* Messages système */}
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">Messages système</h3>
                                        <p className="text-sm text-gray-600">
                                            Informations importantes concernant votre compte et la plateforme
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informations supplémentaires */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-medium text-blue-900">À propos des notifications</h3>
                                <div className="mt-2 text-sm text-blue-800">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Les notifications sont automatiquement activées pour tous les nouveaux utilisateurs</li>
                                        <li>Vous pouvez désactiver les notifications à tout moment via le toggle ci-dessus</li>
                                        <li>Les notifications fonctionnent même lorsque votre navigateur est fermé</li>
                                        <li>Assurez-vous d'autoriser les notifications dans les paramètres de votre navigateur</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        // Vérifier l'authentification via les tokens JWT existants
        // Adapter les types de context aux types attendus par apiUseCases
        const authContext: AuthRequest = {
            req: context.req as NextApiRequest,
            res: context.res as NextApiResponse
        };
        
        const adminToken = await apiUseCases.verifyAdminToken(authContext);
        const customerToken = await apiUseCases.verifyCustomerToken(authContext);
        const growerToken = await apiUseCases.verifyGrowerToken(authContext);
        const delivererToken = await apiUseCases.verifyDelivererToken(authContext);
        
        if (!adminToken && !customerToken && !growerToken && !delivererToken) {
            return {
                redirect: {
                    destination: '/auth/signin',
                    permanent: false,
                },
            };
        }

        // Créer un objet session compatible
        const session = {
            user: adminToken || customerToken || growerToken || delivererToken,
            userType: adminToken ? 'admin' : customerToken ? 'customer' : growerToken ? 'grower' : 'deliverer'
        };

        return {
            props: {
                session,
            },
        };
    } catch (error) {
        console.error('Auth error:', error);
        return {
            redirect: {
                destination: '/auth/signin',
                permanent: false,
            },
        };
    }
};