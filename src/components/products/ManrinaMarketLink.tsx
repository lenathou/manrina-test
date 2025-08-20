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
    <div className={`w-full max-w-md mx-auto my-4 ${className || ''}`}>
      <button
        onClick={handlePress}
        className="w-full p-6 bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:bg-white/95 group"
      >
        <div className="flex items-center gap-4">
          {/* Icône */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
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
            <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              Manrina an Peyi a
            </h3>
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Découvrez nos exposants et producteurs locaux
            </p>
          </div>
          
          {/* Flèche */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg 
                className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" 
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