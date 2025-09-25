import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MarketSessionWithProducts } from '@/types/market';
import { useNewMarketParticipations } from '@/hooks/useNewMarketParticipations';
import { Badge } from '@/components/ui/badge';

interface SessionActionsDropdownProps {
  session: MarketSessionWithProducts;
  onEdit: (session: MarketSessionWithProducts) => void;
  onDelete: (sessionId: string) => void;
  onShowClients: (session: MarketSessionWithProducts) => void;
  deletingSessionId: string | null;
  className?: string;
}

export const SessionActionsDropdown: React.FC<SessionActionsDropdownProps> = ({
  session,
  onEdit,
  onDelete,
  onShowClients,
  deletingSessionId,
  className = ""
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Hook pour récupérer les nouvelles participations pour cette session spécifique
  const { growersWithNewMarketParticipations, isLoading } = useNewMarketParticipations(session.id);
  
  // Vérifier si cette session a de nouvelles participations
  const hasNewParticipations = !isLoading && growersWithNewMarketParticipations.length > 0;
  const newParticipationsCount = isLoading ? 0 : growersWithNewMarketParticipations.length;

  // Fonction pour calculer le statut réel basé sur la date
  const getActualStatus = (session: MarketSessionWithProducts) => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());

    if (sessionDay.getTime() === today.getTime()) {
      return 'ACTIVE';
    } else if (sessionDay > today) {
      return 'UPCOMING';
    } else {
      return 'COMPLETED';
    }
  };

  const sessionStatus = getActualStatus(session);
  const isSessionActive = sessionStatus === 'ACTIVE';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsOpen(false);
  };

  const actions = [
    {
      id: 'manage',
      label: 'Gérer la session',
      onClick: () => router.push(`/admin/gestion-marche/${session.id}`),
      disabled: false
    },
    {
      id: 'producers',
      label: hasNewParticipations ? `Voir les producteurs (${newParticipationsCount} nouveau${newParticipationsCount > 1 ? 'x' : ''})` : 'Voir les producteurs',
      onClick: () => router.push(`/admin/gestion-marche/${session.id}/producteurs`),
      disabled: false,
      icon: hasNewParticipations ? (
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </div>
      ) : (
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'commissions',
      label: isSessionActive ? 'Gérer les commissions' : `Commissions (${sessionStatus === 'UPCOMING' ? 'Session à venir' : 'Session terminée'})`,
      onClick: () => {
        if (isSessionActive) {
          router.push(`/admin/gestion-marche/${session.id}/commissions`);
        }
      },
      disabled: !isSessionActive,
      className: !isSessionActive ? 'text-gray-400 cursor-not-allowed' : ''
    },
    {
      id: 'clients',
      label: 'Voir les clients',
      onClick: () => onShowClients(session),
      disabled: false
    },
    {
      id: 'edit',
      label: 'Modifier',
      onClick: () => onEdit(session),
      disabled: false
    },
    {
      id: 'delete',
      label: deletingSessionId === session.id ? 'Suppression en cours...' : 'Supprimer',
      onClick: () => onDelete(session.id),
      disabled: deletingSessionId === session.id,
      className: 'text-red-600 hover:bg-red-50'
    }
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-between w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 cursor-pointer min-w-[120px]"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-600">⋯</span>
          <span className="text-gray-700 text-sm font-medium">Actions</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {/* Badge d'indication sur le bouton Actions */}
      {hasNewParticipations && (
        <div className="absolute -top-2 -right-2 animate-pulse">
          <Badge 
            variant="destructive" 
            className="text-xs px-2 py-1 min-w-[24px] h-6 flex items-center justify-center text-white bg-orange-500 border-2 border-white shadow-lg font-bold"
          >
            {newParticipationsCount}
          </Badge>
        </div>
      )}

      {isOpen && (
        <>
          {/* Overlay pour fermer le menu */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu déroulant */}
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-48">
            <div className="py-1">
              {actions.map((action, index) => (
                <div key={action.id}>
                  {index === 4 && <hr className="my-1" />}
                  <button
                    onClick={(e) => handleAction(e, action.onClick)}
                    disabled={action.disabled}
                    title={action.id === 'commissions' && action.disabled 
                      ? `Les commissions ne peuvent être gérées que pour les sessions actives. Cette session est ${sessionStatus === 'UPCOMING' ? 'à venir' : 'terminée'}.`
                      : undefined
                    }
                    className={`
                      w-full px-4 py-2 text-left text-sm flex items-center gap-2 whitespace-nowrap
                      hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                      transition-colors duration-150
                      ${action.disabled ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-700 cursor-pointer'}
                      ${action.className || ''}
                    `}
                  >
                    {action.icon && (
                      <span className="flex-shrink-0">
                        {action.icon}
                      </span>
                    )}
                    {action.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SessionActionsDropdown;