import React from 'react';
import { MarketSessionWithProducts } from '@/types/market';
import SessionActionsDropdown from './SessionActionsDropdown';

interface SessionActionsMenuProps {
  session: MarketSessionWithProducts;
  onEdit: (session: MarketSessionWithProducts) => void;
  onDelete: (sessionId: string) => void;
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
  return (
    <SessionActionsDropdown
      session={session}
      onEdit={onEdit}
      onDelete={onDelete}
      onShowClients={onShowClients}
      deletingSessionId={deletingSessionId}
      className="w-full sm:w-auto"
    />
  );
}