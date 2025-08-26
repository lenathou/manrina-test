import React from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/Button';

interface MarketActionsButtonsProps {
  onCreateAutoMarket: () => void;
  onCreateNewSession: () => void;
}

export function MarketActionsButtons({
  onCreateAutoMarket,
  onCreateNewSession
}: MarketActionsButtonsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
      <Button
        onClick={() => router.push('/admin/gestion-marche/historique-sessions')}
        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors w-full sm:w-auto"
      >
        📋 Historique
      </Button>
      <Button
        onClick={onCreateAutoMarket}
        className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors w-full sm:w-auto"
      >
        🤖 Créer Marché Auto
      </Button>
      <Button
        onClick={onCreateNewSession}
        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors w-full sm:w-auto"
      >
        ➕ Nouvelle Session
      </Button>
    </div>
  );
}