import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface ManrinaMarketLinkProps {
  className?: string;
}

export const ManrinaMarketLink: React.FC<ManrinaMarketLinkProps> = ({ className }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push('/manrina-an-peyi-a');
  };

  return (
    <div className={`w-full mx-auto my-4 ${className || ''}`} style={{ maxWidth: '850px', paddingLeft: '16px', paddingRight: '16px' }}>
      <button
        onClick={handlePress}
        className="w-full p-6 bg-white/20 backdrop-blur-md border border-white/40 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] hover:bg-white/30 group relative overflow-hidden"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-tertiary/60 to-transparent opacity-50 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          {/* Icône */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-secondary/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20">
              <Image
                src="/icons/categories/services.png"
                alt="Manrina an Peyi a"
                width={32}
                height={32}
                className="object-contain filter brightness-0 invert"
              />
            </div>
          </div>
          
          {/* Texte */}
          <div className="flex-1 text-left">
            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors drop-shadow-sm">
              Manrina an Peyi a
            </h3>
            <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors drop-shadow-sm">
              Découvrez nos exposants et producteurs locaux
            </p>
          </div>
          
          {/* Flèche */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors border border-white/20">
              <svg 
                className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" 
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
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};