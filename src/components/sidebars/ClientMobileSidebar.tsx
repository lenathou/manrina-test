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

export const ClientMobileSidebar: React.FC<{ className?: string }> = () => {
    const router = useRouter();
    const currentPath = router.pathname;
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);
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

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setOpenDropdownIndex(null);
    };

    const closeSidebar = () => {
        setIsOpen(false);
        setOpenDropdownIndex(null);
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
                        onClick={closeSidebar}
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
                                className="mr-3 "
                            />
                        )}
                        <span className="font-bold">{item.label}</span>
                    </Link>
                    {/* Affichage du solde du portefeuille */}
                     {item.label === 'Mon portefeuille' && (
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
                    {item.children?.map((child, childIndex) => (
                        <Link
                            key={childIndex}
                            href={child.href || '#'}
                            onClick={closeSidebar}
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
            </div>
        );
    };

    return (
        <>
            {/* Bouton hamburger */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95"
                aria-label="Menu de navigation"
            >
                <div className="relative w-6 h-6">
                    <span
                        className={`absolute block w-6 h-0.5 bg-white transition-all duration-300 ${
                            isOpen ? 'rotate-45 top-3' : 'top-1'
                        }`}
                    />
                    <span
                        className={`absolute block w-6 h-0.5 bg-white transition-all duration-300 top-3 ${
                            isOpen ? 'opacity-0' : 'opacity-100'
                        }`}
                    />
                    <span
                        className={`absolute block w-6 h-0.5 bg-white transition-all duration-300 ${
                            isOpen ? '-rotate-45 top-3' : 'top-5'
                        }`}
                    />
                </div>
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                    onClick={closeSidebar}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            closeSidebar();
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Fermer le menu"
                />
            )}

            <div
                className={`fixed top-0 left-0 rounded-tr-[24px] rounded-br-[24px] h-full w-4/5 bg-secondary text-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-6 flex justify-between items-center border-b border-gray-200">
                    <div className="w-12 h-12">
                        <Image
                            src="/icons/dashboard/logo.svg"
                            alt="Logo"
                            width={48}
                            height={48}
                            className="object-contain"
                        />
                    </div>
                    <button
                        onClick={closeSidebar}
                        className="p-2 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                        aria-label="Fermer le menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 px-4 py-4 overflow-y-auto">
                    {CLIENT_SIDEBAR_ITEMS.map((item, index) => renderSidebarItem(item, index))}
                    
                    {/* Panier */}
                    <div className="mb-2 opacity-0 translate-y-2 animate-[fadeInUp_0.3s_ease-out_forwards]"
                         style={{ animationDelay: `${CLIENT_SIDEBAR_ITEMS.length * 50}ms` }}>
                        <Link href={ROUTES.PANIER} className="flex items-center px-4 py-3 w-full text-left transition-all duration-300 rounded-lg cursor-pointer hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
                            <div className="mr-3">
                                <NavbarBasket />
                            </div>
                            <span className="font-bold">Mon panier</span>
                        </Link>
                    </div>
                </div>

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
                        <span className="font-bold">Déconnexion</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default ClientMobileSidebar;
