import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/Button';
import { MarketSessionWithProducts } from '@/types/market';

interface SessionActionsMenuProps {
  session: MarketSessionWithProducts;
  onEdit: (session: MarketSessionWithProducts) => void;
  onDelete: (sessionId: string, isAutomatic: boolean) => void;
  onShowClients: (session: MarketSessionWithProducts) => void;
  deletingSessionId: string | null;
}

export function SessionActionsMenu({
  session,
  onEdit,
  onDelete,
  onShowClients,
  deletingSessionId
}: SessionActionsMenuProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Version desktop - boutons visibles */}
      <div className="hidden lg:flex gap-2 flex-wrap">
        <Button
          onClick={(e) => handleAction(e, () => router.push(`/admin/gestion-marche/${session.id}`))}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors font-medium"
        >
          ⚙️ Gérer
        </Button>
        <Button
          onClick={(e) => handleAction(e, () => router.push(`/admin/gestion-marche/${session.id}/producteurs`))}
          className="bg-secondary text-white px-3 py-1 rounded text-sm hover:bg-secondary/80 transition-colors font-medium"
        >
          Producteurs
        </Button>
        <Button
          onClick={(e) => handleAction(e, () => onShowClients(session))}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors font-medium"
        >
          👥 Clients
        </Button>
        <Button
          onClick={(e) => handleAction(e, () => onEdit(session))}
          className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-secondary transition-colors font-medium"
        >
          Modifier
        </Button>
        <Button
          onClick={(e) => handleAction(e, () => onDelete(session.id, session.isAutomatic || false))}
          disabled={deletingSessionId === session.id}
          className="bg-[var(--color-danger)] text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {deletingSessionId === session.id ? (
            <>
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              Suppression...
            </>
          ) : (
            <>🗑️ Supprimer</>
          )}
        </Button>
      </div>

      {/* Version mobile et tablette - menu déroulant */}
      <div className="lg:hidden relative">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors font-medium flex items-center gap-1"
        >
          ⋯ Actions
          <svg 
            className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>

        {isMenuOpen && (
          <>
            {/* Overlay pour fermer le menu */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu déroulant */}
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48">
              <div className="py-1">
                <button
                  onClick={(e) => handleAction(e, () => router.push(`/admin/gestion-marche/${session.id}`))}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  ⚙️ Gérer la session
                </button>
                <button
                  onClick={(e) => handleAction(e, () => router.push(`/admin/gestion-marche/${session.id}/producteurs`))}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  👥 Voir les producteurs
                </button>
                <button
                  onClick={(e) => handleAction(e, () => onShowClients(session))}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  👥 Voir les clients
                </button>
                <hr className="my-1" />
                <button
                  onClick={(e) => handleAction(e, () => onEdit(session))}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={(e) => handleAction(e, () => onDelete(session.id, session.isAutomatic || false))}
                  disabled={deletingSessionId === session.id}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingSessionId === session.id ? (
                    <>
                      <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin" />
                      Suppression en cours...
                    </>
                  ) : (
                    <>🗑️ Supprimer</>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}