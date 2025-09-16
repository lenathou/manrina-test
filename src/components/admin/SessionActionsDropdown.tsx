import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MarketSessionWithProducts } from '@/types/market';

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
      icon: '⚙️',
      onClick: () => router.push(`/admin/gestion-marche/${session.id}`),
      disabled: false
    },
    {
      id: 'producers',
      label: 'Voir les producteurs',
      icon: '👨‍🌾',
      onClick: () => router.push(`/admin/gestion-marche/${session.id}/producteurs`),
      disabled: false
    },
    {
      id: 'clients',
      label: 'Voir les clients',
      icon: '👥',
      onClick: () => onShowClients(session),
      disabled: false
    },
    {
      id: 'edit',
      label: 'Modifier',
      icon: '✏️',
      onClick: () => onEdit(session),
      disabled: false
    },
    {
      id: 'delete',
      label: deletingSessionId === session.id ? 'Suppression en cours...' : 'Supprimer',
      icon: deletingSessionId === session.id ? (
        <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin" />
      ) : '🗑️',
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

      {isOpen && (
        <>
          {/* Overlay pour fermer le menu */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu déroulant */}
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48">
            <div className="py-1">
              {actions.map((action, index) => (
                <div key={action.id}>
                  {index === 4 && <hr className="my-1" />}
                  <button
                    onClick={(e) => handleAction(e, action.onClick)}
                    disabled={action.disabled}
                    className={`
                      w-full px-4 py-2 text-left text-sm flex items-center gap-2 whitespace-nowrap
                      hover:bg-gray-100 focus:outline-none focus:bg-gray-100
                      transition-colors duration-150
                      ${action.disabled ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-700 cursor-pointer'}
                      ${action.className || ''}
                    `}
                  >
                    <span className="flex-shrink-0 w-4 flex justify-center">
                      {action.icon}
                    </span>
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