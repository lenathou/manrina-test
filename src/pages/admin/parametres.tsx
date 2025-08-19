/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { withAdminLayout } from '@/components/layouts/AdminLayout';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { PushNotificationManager } from '@/pwa/PushNotificationManager';

interface AdminParametresPageProps {
    authenticatedAdmin: IAdminTokenPayload;
}

function AdminParametresPage({ authenticatedAdmin }: AdminParametresPageProps) {
    const [activeTab, setActiveTab] = useState('notifications');

    const tabs = [
        { id: 'notifications', label: 'Gestion des notifications', icon: '🔔' },
        { id: 'general', label: 'Paramètres généraux', icon: '⚙️' },
        { id: 'security', label: 'Sécurité', icon: '🔒' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Notifications Push</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Gérez les notifications push pour l'ensemble de la plateforme
                                </p>
                            </div>
                            <div className="px-6 py-6">
                                <PushNotificationManager />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Paramètres de notification</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Configurez les types de notifications envoyées aux utilisateurs
                                </p>
                            </div>
                            <div className="px-6 py-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Notifications d'annulation de marché</h4>
                                            <p className="text-sm text-gray-500">Alerter tous les utilisateurs lors de l'annulation d'un marché</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Notifications de nouvelles commandes</h4>
                                            <p className="text-sm text-gray-500">Alerter les producteurs des nouvelles commandes</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Notifications de livraison</h4>
                                            <p className="text-sm text-gray-500">Alerter les clients des mises à jour de livraison</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Messages système</h4>
                                            <p className="text-sm text-gray-500">Notifications importantes du système</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'general':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Paramètres généraux</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Configuration générale de la plateforme
                            </p>
                        </div>
                        <div className="px-6 py-6">
                            <p className="text-gray-500">Fonctionnalité à venir...</p>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Paramètres de sécurité</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Configuration de la sécurité et des accès
                            </p>
                        </div>
                        <div className="px-6 py-6">
                            <p className="text-gray-500">Fonctionnalité à venir...</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4">
                    Paramètres administrateur
                </h2>
                <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
                    Configurez les paramètres de la plateforme et gérez les notifications.
                </p>
            </div>

            {/* Onglets */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Contenu de l'onglet */}
                <div className="p-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}

export default withAdminLayout(AdminParametresPage);