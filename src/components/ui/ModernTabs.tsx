import React from 'react';

export interface ModernTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface ModernTabsProps {
  items: ModernTabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'elegant' | 'rounded' | 'minimal';
  fullWidth?: boolean;
}

export function ModernTabs({ 
  items, 
  activeTab, 
  onTabChange, 
  className = '',
  variant = 'elegant',
  fullWidth = true
}: ModernTabsProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'rounded':
        return {
          container: 'bg-white/80 backdrop-blur-sm border border-[#e4d9d0] rounded-full p-1 shadow-lg',
          tab: 'rounded-full transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98]',
          activeTab: 'bg-gradient-to-r from-[#f48953] to-[#e67a44] text-white shadow-lg font-semibold',
          inactiveTab: 'text-[#4c5a5a] hover:text-[#f48953] hover:bg-white/60 hover:shadow-sm'
        };
      case 'minimal':
        return {
          container: 'border-b-2 border-[#e4d9d0]',
          tab: 'border-b-3 border-transparent transition-all duration-300 ease-in-out pb-3 px-1',
          activeTab: 'border-[#f48953] text-[#f48953] font-semibold',
          inactiveTab: 'text-[#4c5a5a] hover:text-[#f48953] hover:border-[#f48953]/30'
        };
      default: // elegant
        return {
          container: 'bg-gradient-to-r from-white/90 to-[#f8f0e9]/90 backdrop-blur-sm border border-[#e4d9d0]/50 rounded-2xl p-1.5 shadow-xl',
          tab: 'rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden',
          activeTab: 'bg-gradient-to-r from-[#f48953] to-[#e67a44] text-white shadow-lg font-semibold',
          inactiveTab: 'text-[#4c5a5a] hover:text-[#f48953] hover:bg-white/80 hover:shadow-md'
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <div className={`mx-auto mb-8 w-full max-w-md md:max-w-lg lg:max-w-xl ${className}`}>
      <div className={`flex ${fullWidth ? 'w-full' : 'inline-flex'} ${variantClasses.container}`}>
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`
              ${fullWidth ? 'flex-1' : 'px-8'} 
              py-4 text-center text-lg font-medium ${variantClasses.tab}
              ${activeTab === item.id 
                ? variantClasses.activeTab 
                : variantClasses.inactiveTab
              }
              focus:outline-none focus:ring-2 focus:ring-[#f48953]/50 focus:ring-offset-2 focus:ring-offset-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 ease-out
              ${index === 0 ? 'rounded-l-xl' : ''} 
              ${index === items.length - 1 ? 'rounded-r-xl' : ''}
            `}
            type="button"
            style={{ fontFamily: 'MartelSans-SemiBold, sans-serif' }}
          >
            <div className="flex items-center justify-center gap-2 relative z-10">
              {item.icon && (
                <span className="text-current">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </div>
            
            {/* Effet de brillance pour l'onglet actif */}
            {activeTab === item.id && variant === 'elegant' && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent rounded-xl" />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              </>
            )}
            
            {/* Effet de hover subtil */}
            {activeTab !== item.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#f48953]/5 to-[#21AD84]/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
            )}
          </button>
        ))}
      </div>
      
      {/* Ombre portée décorative */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#f48953]/10 to-transparent rounded-full mx-8 -mt-1" />
    </div>
  );
}

// Hook pour gérer l'état des onglets modernes
export function useModernTabs(defaultTab: string) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  const handleTabChange = React.useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  return {
    activeTab,
    setActiveTab,
    handleTabChange
  };
}