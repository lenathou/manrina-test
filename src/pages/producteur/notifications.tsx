/* eslint-disable react/no-unescaped-entities */
import { withProducteurLayout } from '@/components/layouts/ProducteurLayout';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';
import { PushNotificationManager } from '@/pwa/PushNotificationManager';

interface ProducteurNotificationsPageProps {
    authenticatedGrower: IGrowerTokenPayload;
}

function ProducteurNotificationsPage({ }: ProducteurNotificationsPageProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l10.586 10.586c.781.781 2.047.781 2.828 0l1.414-1.414c.781-.781.781-2.047 0-2.828L9.242 3.828c-.781-.781-2.047-.781-2.828 0L4.828 5.414c-.781.781-.781 2.047 0 2.828z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Notifications Push</h1>
                            <p className="text-sm text-gray-600">
                                Gérez vos préférences de notifications pour rester informé en temps réel
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Gestionnaire de Notifications Push */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Activation des Notifications Push</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Activez ou désactivez les notifications push pour recevoir des alertes en temps réel
                            </p>
                        </div>

                        <div className="px-6 py-6">
                            <PushNotificationManager hideStatus={false} />
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-medium text-blue-900">À propos des notifications push</h3>
                                <div className="mt-2 text-sm text-blue-800">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Utilisez le toggle ci-dessus pour activer ou désactiver les notifications push</li>
                                        <li>Les notifications fonctionnent même lorsque votre navigateur est fermé</li>
                                        <li>Assurez-vous d'autoriser les notifications dans les paramètres de votre navigateur</li>
                                        <li>Vous pouvez tester l'envoi de notifications une fois activées</li>
                                        <li>Les notifications vous alerteront pour les nouveaux marchés, commandes et mises à jour importantes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conseils d'utilisation */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-medium text-green-900">Conseils pour optimiser vos notifications</h3>
                                <div className="mt-2 text-sm text-green-800">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Activez les notifications pour ne manquer aucune opportunité de marché</li>
                                        <li>Testez régulièrement que vous recevez bien les notifications</li>
                                        <li>Vérifiez que les notifications ne sont pas bloquées par votre navigateur</li>
                                        <li>Les notifications vous aideront à réagir rapidement aux nouvelles commandes</li>
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

// Authentification gérée automatiquement par withProducteurLayout

export default withProducteurLayout(ProducteurNotificationsPage);