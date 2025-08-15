/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { backendFetchService } from '@/service/BackendFetchService';

interface SidebarItem {
    label: string;
    icon?: string;
    href?: string;
    children?: SidebarItem[];
}

export const LivreurSidebar: React.FC<{ className?: string }> = ({}) => {
    const router = useRouter();
    const currentPath = router.pathname;
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isActive = (href: string) => {
        return currentPath === href || currentPath.startsWith(href + '/');
    };

    const sidebarItems: SidebarItem[] = [

        {
            icon: '/icons/dashboard/location.svg',
            label: 'Mes commandes',
            href: '/livreur/commandes',
        },
        {
            icon: '/icons/dashboard/suivi-commande.svg',
            label: 'Historique',
            href: '/livreur/historique',
        },
    ];

    const handleLogout = async () => {
        try {
            await backendFetchService.delivererLogout();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            router.push('/livreur/login');
        }
    };

    const renderSidebarItem = (item: SidebarItem, index: number) => {
        const isDropdownOpen = openDropdownIndex === index;
        const hasChildren = item.children && item.children.length > 0;

        // Si l'item n'a pas d'enfants, c'est un lien direct
        if (!hasChildren) {
            return (
                <div
                    key={index}
                    className={`mb-2 opacity-0 translate-y-2 animate-[fadeInUp_0.3s_ease-out_forwards] ${`animation-delay-[${index * 50}ms]`}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <Link
                        href={item.href || '#'}
                        className={`flex items-center px-4 py-3 w-full text-left transition-all duration-300 rounded-lg cursor-pointer ${
                            isActive(item.href || '')
                                ? 'bg-[var(--primary)] text-white'
                                : 'hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                    >
                        {item.icon && (
                            <Image
                                src={item.icon}
                                alt={item.label}
                                width={40}
                                height={40}
                                className={isCollapsed ? "" : "mr-3"}
                            />
                        )}
                        {!isCollapsed && <span className="font-bold">{item.label}</span>}
                    </Link>
                </div>
            );
        }

        // Si l'item a des enfants, c'est un dropdown
        return (
            <div
                key={index}
                className={`mb-2 opacity-0 translate-y-2 animate-[fadeInUp_0.3s_ease-out_forwards] ${`animation-delay-[${index * 50}ms]`}`}
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <button
                    className={`flex items-center px-4 py-3 w-full text-left transition-all duration-300 rounded-lg cursor-pointer ${
                        isDropdownOpen
                            ? 'bg-[var(--primary)] text-white'
                            : 'hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                    onClick={() => setOpenDropdownIndex(isDropdownOpen ? null : index)}
                >
                    {item.icon && (
                        <Image
                            src={item.icon}
                            alt={item.label}
                            width={40}
                            height={40}
                            className={isCollapsed ? "" : "mr-3"}
                        />
                    )}
                    {!isCollapsed && <span className="font-bold">{item.label}</span>}
                </button>

                {!isCollapsed && (
                    <div
                        className={`overflow-hidden ml-6 mt-2 transition-all duration-300 ease-in-out ${
                            isDropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        {item.children && (
                            <div className="space-y-1">
                                {item.children.map((child, childIndex) => (
                                    <Link
                                        key={childIndex}
                                        href={child.href || '#'}
                                        className={`block px-4 py-2 cursor-pointer text-sm rounded-lg transition-all duration-200 ${
                                            isActive(child.href || '')
                                                ? 'bg-[var(--accent)] text-white'
                                                : 'hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                                        }`}
                                    >
                                        {child.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-80'} h-screen rounded-tr-[24px] rounded-br-[24px] bg-secondary text-white hidden md:flex flex-col transition-all duration-300`}>
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
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
                {isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3 top-1/2 transform -translate-y-1/2 p-2 bg-secondary hover:bg-gray-600 rounded-full transition-colors duration-200 border border-gray-600"
                        title="Étendre la sidebar"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-4">{sidebarItems.map((item, index) => renderSidebarItem(item, index))}</div>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center space-x-2'} px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200 hover:shadow-md`}
                    title={isCollapsed ? "Déconnexion" : ""}
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

export default LivreurSidebar;