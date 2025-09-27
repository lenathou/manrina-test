'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { backendFetchService } from '@/service/BackendFetchService';
import { CLIENT_SIDEBAR_ITEMS, SidebarLink } from '@/constants/CLIENT_SIDEBAR_ITEMS';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { numberFormat } from '@/service/NumberFormat';
import { NavbarBasket } from '@/components/Header/NavbarBasket';
import { ROUTES } from '@/router/routes';

export const ClientSidebar: React.FC<{ className?: string }> = () => {
    const router = useRouter();
    const currentPath = router.pathname;
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { walletBalance, loading: walletLoading } = useWalletBalance();

    const isActive = (href: string) => currentPath === href || currentPath.startsWith(href + '/');

    const handleLogout = async () => {
        try {
            await backendFetchService.customerLogout();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            router.push('/login');
        }
    };

    const renderSidebarItem = (item: SidebarLink, index: number) => {
        const isDropdownOpen = openDropdownIndex === index;
        const hasChildren = !!item.children?.length;

        if (!hasChildren) {
            return (
                <div
                    key={index}
                    className="mb-2 opacity-0 translate-y-2 animate-[fadeInUp_0.3s_ease-out_forwards]"
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
                                className={isCollapsed ? '' : 'mr-3'}
                            />
                        )}
                        {!isCollapsed && <span className="font-bold">{item.label}</span>}
                    </Link>
                    {/* Affichage du solde du portefeuille */}
                     {!isCollapsed && item.label === 'Mon portefeuille' && (
                         <div className="ml-12 mt-1 text-xs text-gray-300">
                             {walletLoading ? (
                                 <span>Chargement...</span>
                             ) : (
                                 <span>Solde: {numberFormat.toPrice(walletBalance)}</span>
                             )}
                         </div>
                     )}
                </div>
            );
        }

        return (
            <div
                key={index}
                className="mb-2 opacity-0 translate-y-2 animate-[fadeInUp_0.3s_ease-out_forwards]"
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <button
                    onClick={() => setOpenDropdownIndex(isDropdownOpen ? null : index)}
                    className={`flex items-center px-4 py-3 w-full text-left transition-all duration-300 rounded-lg cursor-pointer ${
                        isDropdownOpen
                            ? 'bg-primary text-white'
                            : 'hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                >
                    {item.icon && (
                        <Image
                            src={item.icon}
                            alt={item.label}
                            width={40}
                            height={40}
                            className={isCollapsed ? '' : 'mr-3 '}
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
                        {item.children?.map((child, childIndex) => (
                            <Link
                                key={childIndex}
                                href={child.href || '#'}
                                className={`block px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
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
        );
    };

    return (
        <div
            className={`${
                isCollapsed ? 'w-20' : 'w-80'
            } h-screen rounded-tr-[24px] rounded-br-[24px] bg-secondary text-white flex flex-col transition-all duration-300`}
        >
            {/* Logo + Toggle Button */}
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
                {!isCollapsed ? (
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="absolute right-4 p-2 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                        title="Rétracter"
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
                ) : (
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="absolute -right-3 top-1/2 transform -translate-y-1/2 p-2 bg-secondary hover:bg-gray-600 rounded-full transition-colors duration-200 border border-gray-600"
                        title="Étendre"
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

            {/* Navigation Items */}
            <div className="flex-1 px-4 py-4">
                {CLIENT_SIDEBAR_ITEMS.map((item, index) => renderSidebarItem(item, index))}
                
                {/* Panier */}
                <div className="mb-2 opacity-0 translate-y-2 animate-[fadeInUp_0.3s_ease-out_forwards]"
                     style={{ animationDelay: `${CLIENT_SIDEBAR_ITEMS.length * 50}ms` }}>
                    <Link href={ROUTES.PANIER} className={`flex items-center px-4 py-3 w-full text-left transition-all duration-300 rounded-lg cursor-pointer hover:bg-[var(--muted)] hover:text-[var(--foreground)]`}>
                        <div className={isCollapsed ? '' : 'mr-3'}>
                            <NavbarBasket />
                        </div>
                        {!isCollapsed && <span className="font-bold">Mon panier</span>}
                    </Link>
                </div>
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center' : 'justify-center space-x-2'
                    } px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200 hover:shadow-md`}
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
                    {!isCollapsed && <span className="font-bold">Déconnexion</span>}
                </button>
            </div>
        </div>
    );
};

export default ClientSidebar;
