import React from 'react';
import deliveryMethods from '@/mock/deliveryMethods.json';

interface RelayPoint {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  schedule: {
    deliveryDay: string;
    openingHours: Array<{
      start: string;
      end: string;
    }>;
    weekOpeningHours: string[][];
  };
  capabilities: {
    fresh: boolean;
    refrigerated: boolean;
    frozen: boolean;
  };
  basePrice: number;
}

interface RelayPointsListProps {
  selectedRelayPointId?: string | null;
  onRelayPointSelect: (relayPointId: string) => void;
}

const RelayPointsList: React.FC<RelayPointsListProps> = ({
  selectedRelayPointId,
  onRelayPointSelect
}) => {
  // Récupérer les points relais depuis les données mock
  const relayPointsCategory = deliveryMethods.categories.find(
    category => category.id === 'pickup_point'
  );
  
  const relayPoints: RelayPoint[] = (relayPointsCategory?.methods || []).filter(
    (method): method is RelayPoint => 
      'schedule' in method && 'capabilities' in method
  );

  const formatOpeningHours = (hours: Array<{ start: string; end: string }>) => {
    return hours.map(hour => `${hour.start}-${hour.end}`).join(', ');
  };

  if (relayPoints.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="mx-auto h-12 w-12 mb-4 flex items-center justify-center">
          📍
        </div>
        <p>Aucun point relais disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sélectionnez votre point relais
      </h3>
      
      <div className="grid gap-4">
        {relayPoints.map((relayPoint) => (
          <div 
            key={relayPoint.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedRelayPointId === relayPoint.id 
                ? 'ring-2 ring-green-500 border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onRelayPointSelect(relayPoint.id)}
          >
            {/* En-tête avec nom et badge gratuit */}
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-base font-medium text-gray-900">
                {relayPoint.name}
              </h4>
              {relayPoint.basePrice === 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                  Gratuit
                </span>
              )}
            </div>
            
            {/* Adresse */}
            <div className="flex items-start gap-2 mb-3">
              <span className="text-gray-500 mt-0.5">📍</span>
              <div className="text-sm text-gray-600">
                <div>{relayPoint.location.address}</div>
                <div>{relayPoint.location.postalCode} {relayPoint.location.city}</div>
              </div>
            </div>
            
            {/* Horaires */}
            <div className="flex items-start gap-2">
              <span className="text-gray-500 mt-0.5">🕒</span>
              <div className="text-sm text-gray-600">
                <div className="font-medium">
                  Jour de livraison: {relayPoint.schedule.deliveryDay}
                </div>
                <div>
                  Horaires: {formatOpeningHours(relayPoint.schedule.openingHours)}
                </div>
                {relayPoint.schedule.weekOpeningHours && (
                  <div className="mt-1 text-xs text-gray-500">
                    {relayPoint.schedule.weekOpeningHours.map((schedule, index) => (
                      <div key={index}>{schedule.join(' ')}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelayPointsList;