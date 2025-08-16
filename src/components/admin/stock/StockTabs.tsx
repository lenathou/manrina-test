import React, { useState } from 'react';
import { IProduct, IUnit } from '@/server/product/IProduct';
import { CatalogueTab } from './tabs/CatalogueTab';
import { GlobalStockTab } from './tabs/GlobalStockTab';
import { PriceValidationTab } from './tabs/PriceValidationTab';
import { SystemToolsTab } from './tabs/SystemToolsTab';

type TabType = 'catalogue' | 'stock' | 'prices' | 'tools';

interface StockTabsProps {
  products: IProduct[];
  units: IUnit[];
  onCreateProduct: () => void;
  onCreateFromAirtable: () => void;
  onManagePanyen: () => void;
  onInvalidateCache: () => void;
  onEditProduct: (product: IProduct) => void;
  onOpenPricesModal: (product: IProduct) => void;
  isCreatingProducts: boolean;
}

const tabs = [
  {
    id: 'catalogue' as TabType,
    label: 'Catalogue',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    description: 'Gestion des produits et variants'
  },
  {
    id: 'stock' as TabType,
    label: 'Stock Global',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    description: 'Vue d\'ensemble et gestion des stocks'
  },
  {
    id: 'prices' as TabType,
    label: 'Prix & Validation',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    description: 'Validation des prix producteurs'
  },
  {
    id: 'tools' as TabType,
    label: 'Outils Système',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: 'Import, cache et outils avancés'
  }
];

export function StockTabs({ 
  products, 
  units, 
  onCreateProduct, 
  onCreateFromAirtable, 
  onManagePanyen, 
  onInvalidateCache, 
  onEditProduct, 
  onOpenPricesModal, 
  isCreatingProducts 
}: StockTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('catalogue');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'catalogue':
        return (
          <CatalogueTab
            products={products}
            units={units}
            onCreateProduct={onCreateProduct}
            onEditProduct={onEditProduct}
            onOpenPricesModal={onOpenPricesModal}
          />
        );
      case 'stock':
        return (
          <GlobalStockTab
            products={products}
            units={units}
          />
        );
      case 'prices':
        return (
          <PriceValidationTab
            products={products}
            units={units}
            onOpenPricesModal={onOpenPricesModal}
          />
        );
      case 'tools':
        return (
          <SystemToolsTab
            products={products}
            units={units}
            onCreateFromAirtable={onCreateFromAirtable}
            onManagePanyen={onManagePanyen}
            onInvalidateCache={onInvalidateCache}
            isCreatingProducts={isCreatingProducts}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white">
      {/* Navigation des onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={`mr-2 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                  {tab.icon}
                </span>
                <span className="font-medium">{tab.label}</span>
                <span className="ml-2 text-xs text-gray-400 hidden lg:block">
                  {tab.description}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="py-6">
        {renderTabContent()}
      </div>
    </div>
  );
}