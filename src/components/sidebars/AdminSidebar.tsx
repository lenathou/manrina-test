/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { backendFetchService } from '@/service/BackendFetchService';
import { ADMIN_SIDEBAR_ITEMS, SidebarLink } from '@/constants/ADMIN_SIDEBAR_ITEMS';
import { useAdminAlerts } from '@/components/alerts/hooks/useAdminAlerts';
import { NotificationBadge } from './NotificationBadge';
import { PendingGrowerBadge } from './PendingGrowerBadge';
import { NewClientBadge } from './NewClientBadge';

export const AdminSidebar: React.FC<{ className?: string }> = ({ className }) => {
    const router = useRouter();
    const currentPath = router.pathname;
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    // Hook central pour toutes les alertes admin
    const { 
        pendingStockCount, 
        pendingMarketCount: pendingMarketSuggestionsCount,
        pendingApplicationsCount,
        newClientsCount
    } = useAdminAlerts();

    const isActive = (href: string) => {
        return currentPath === href || currentPath.startsWith(href + '/');
    };

    // Fonction pour obtenir le nombre de notifications pour un élément spécifique
    const getNotificationCount = (item: SidebarLink): number => {
        // Pour le dropdown "Ressources" - affiche le total des demandes en attente (stock + candidatures + nouveaux clients)
        if (item.label === 'Ressources') {
            return pendingStockCount + pendingApplicationsCount + newClientsCount;
        }
        // Pour le dropdown "Marché"
        if (item.label === 'Marché') {
            return pendingMarketSuggestionsCount;
        }
        // Pour le lien "Stocks" dans Ressources - affiche le nombre de producteurs ayant des demandes en attente
        if (item.href === '/admin/stock') {
            return pendingStockCount;
        }
        // Pour le lien "Producteurs" dans Ressources - affiche le nombre de candidatures en attente
        if (item.href === '/admin/producteurs') {
            return pendingApplicationsCount;
        }
        // Pour le lien "Clients" dans Ressources - affiche le nombre de nouveaux clients
        if (item.href === '/admin/clients') {
            return newClientsCount;
        }
        // Pour le lien "Gestion du marché" dans Marché
        if (item.href === '/admin/gestion-marche') {
            return pendingMarketSuggestionsCount;
        }
        return 0;
    };

    const handleLogout = async () => {
        try {
            await backendFetchService.adminLogout();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            router.push('/admin-login');
        }
    };

    const renderSidebarItem = (item: SidebarLink, index: number) => {
        const isDropdownOpen = openDropdownIndex === index;
        const hasChildren = item.children && item.children.length > 0;

        // Si l'item n'a pas d'enfants, c'est un lien direct
        if (!hasChildren) {
            const notificationCount = getNotificationCount(item);

            return (
                <div
                    key={index}
                    className={`mb-2 opacity-0 translate-y-2 animate-[fadeInUp_0.3s_ease-out_forwards] ${`animation-delay-[${index * 50}ms]`}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <Link
                        href={item.href || '#'}
                        className={`flex items-center justify-between px-4 py-3 w-full text-left transition-all duration-300 rounded-lg cursor-pointer ${
                            isActive(item.href || '')
                                ? 'bg-[var(--primary)] text-white'
                                : 'hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                    >
                        <div className="flex items-center">
                            {item.icon && (
                                <Image
                                    src={item.icon}
                                    alt={item.label}
                                    width={40}
                                    height={40}
                                    className={`${isCollapsed ? '' : 'mr-3'}`}
                                />
                            )}
                            {!isCollapsed && <span className="font-bold">{item.label}</span>}
                        </div>
                        {!isCollapsed && notificationCount > 0 && <NotificationBadge count={notificationCount} />}
                    </Link>
                </div>
            );
        }

        // Si l'item a des enfants, c'est un dropdown
        const dropdownNotificationCount = getNotificationCount(item);

        return (
            <div
                key={index}
                className={`mb-2 opacity-0 translate-y-2 animate-[fadeInUp_0.3s_ease-out_forwards] ${`animation-delay-[${index * 50}ms]`}`}
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <button
                    className={`flex items-center justify-between px-4 py-3 w-full text-left transition-all duration-300 rounded-lg cursor-pointer ${
                        isDropdownOpen
                            ? 'bg-primary text-white'
                            : 'hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                    onClick={() => setOpenDropdownIndex(isDropdownOpen ? null : index)}
                >
                    <div className="flex items-center">
                        {item.icon && (
                            <Image
                                src={item.icon}
                                alt={item.label}
                                width={40}
                                height={40}
                                className={`${isCollapsed ? '' : 'mr-3'}`}
                            />
                        )}
                        {!isCollapsed && <span className="font-bold">{item.label}</span>}
                    </div>
                    {!isCollapsed && dropdownNotificationCount > 0 && (
                        <NotificationBadge count={dropdownNotificationCount} />
                    )}
                </button>

                {!isCollapsed && (
                    <div
                        className={`overflow-hidden  ml-6 mt-2 transition-all duration-300 ease-in-out ${
                            isDropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        {item.children && (
                            <div className="space-y-1">
                                {item.children.map((child, childIndex) => {
                                    const childNotificationCount = getNotificationCount(child);

                                    return (
                                        <Link
                                            key={childIndex}
                                            href={child.href || '#'}
                                            className={`flex items-center justify-between px-4 py-2 cursor-pointer text-sm rounded-lg transition-all duration-200 ${
                                                isActive(child.href || '')
                                                    ? 'bg-[var(--accent)] text-white'
                                                    : 'hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                                            }`}
                                        >
                                            <span>{child.label}</span>
                                            {childNotificationCount > 0 && (
                                                child.href === '/admin/producteurs' ? (
                                                    <PendingGrowerBadge
                                                        count={childNotificationCount}
                                                        className="ml-2"
                                                    />
                                                ) : child.href === '/admin/clients' ? (
                                                    <NewClientBadge
                                                        count={childNotificationCount}
                                                        className="ml-2"
                                                    />
                                                ) : (
                                                    <NotificationBadge
                                                        count={childNotificationCount}
                                                        className="ml-2"
                                                    />
                                                )
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className={`${isCollapsed ? 'w-20' : 'w-80'} h-screen rounded-tr-[24px] rounded-br-[24px] bg-secondary text-white flex flex-col transition-all duration-300 ${className || ''}`}
        >
            {/* Logo et Toggle */}
            <div className="p-6 flex justify-center items-center border-b border-gray-200 relative">
                <div className="w-12 h-12">
                    <Image
                        src="/icons/dashboard/logo.svg"
                        alt="Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                    />
                </div>
                {!isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute right-4 p-2 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                        title="Rétracter la sidebar"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                )}
                {isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3 top-1/2 transform -translate-y-1/2 p-2 bg-secondary hover:bg-gray-600 rounded-full transition-colors duration-200 border border-gray-600"
                        title="Étendre la sidebar"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-4">
                {ADMIN_SIDEBAR_ITEMS.map((item, index) => renderSidebarItem(item, index))}
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center space-x-2'} px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200 hover:shadow-md`}
                    title={isCollapsed ? 'Déconnexion' : ''}
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                    {!isCollapsed && <span className="font-medium">Déconnexion</span>}
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
