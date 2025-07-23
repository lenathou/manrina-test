/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { backendFetchService } from '@/service/BackendFetchService';
import { ROUTES } from '@/router/routes';

interface SidebarItem {
    label: string;
    icon?: string;
    href?: string;
    children?: SidebarItem[];
}

interface ProducteurMobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProducteurMobileSidebar: React.FC<ProducteurMobileSidebarProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const currentPath = router.pathname;
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

    const isActive = (href: string) => {
        return currentPath === href || currentPath.startsWith(href + '/');
    };

    const sidebarItems: SidebarItem[] = [
        {
            icon: '/icons/resources-color.svg',
            label: 'Mes stocks',
            href: ROUTES.GROWER.STOCKS,
        },
        {
            icon: '/icons/commands-color.svg',
            label: 'Mes produits',
            children: [
                {
                    label: 'Liste des produits',
                    href: '/producteur/produits',
                },
                {
                    label: 'Propositions',
                    href: '/producteur/suggestions',
                },
            ],
        },
        {
            icon: '/icons/deliveries-color.svg',
            label: 'Mon profil',
            children: [
                {
                    label: 'Informations',
                    href: ROUTES.GROWER.PROFILE,
                },
                {
                    label: 'Paramètres',
                    href: '/producteur/parametres',
                },
            ],
        },
        {
            icon: '/icons/resources-color.svg',
            label: 'Aide',
            children: [
                {
                    label: 'FAQ',
                    href: '/producteur/aide/faq',
                },
                {
                    label: 'Contact',
                    href: '/producteur/aide/contact',
                },
            ],
        },
    ];

    const handleLogout = async () => {
        try {
            await backendFetchService.growerLogout();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            router.push(ROUTES.GROWER.LOGIN);
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
                        onClick={onClose}
                    >
                        {item.icon && (
                            <Image
                                src={item.icon}
                                alt={item.label}
                                width={40}
                                height={40}
                                className="mr-3"
                            />
                        )}
                        <span className="font-bold">{item.label}</span>
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
                            className="mr-3"
                        />
                    )}
                    <span className="font-bold">{item.label}</span>
                </button>

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
                                    onClick={onClose}
                                >
                                    {child.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} />

            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-80 bg-secondary text-white z-50 md:hidden flex flex-col transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="w-12 h-12 mr-3">
                            <Image
                                src="/logo-color.png"
                                alt="Logo"
                                width={48}
                                height={48}
                                className="object-contain"
                            />
                        </div>
                        <span className="font-bold text-lg">Producteur</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                        title="Fermer le menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 px-4 py-4 overflow-y-auto">
                    {sidebarItems.map((item, index) => renderSidebarItem(item, index))}
                </div>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200 hover:shadow-md"
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
                        <span className="font-medium">Déconnexion</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default ProducteurMobileSidebar;