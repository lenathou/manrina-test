import React, { useState, useEffect } from 'react';

export interface DeliveryDayWithTime {
  day: string;
  time: string;
}

export interface PostalCodeData {
  city: string;
  postalCode: string;
  communality: string;
  deliveryDays: DeliveryDayWithTime[];
}

export interface DeliveryInfo {
  zone: string;
  isAvailable: boolean;
  deliveryDays: DeliveryDayWithTime[];
}

interface CityPostalCodeSelectorProps {
  city: string;
  postalCode: string;
  onCityChange: (city: string) => void;
  onPostalCodeChange: (postalCode: string) => void;
  onValidationChange: (isValid: boolean, deliveryInfo: DeliveryInfo | null) => void;
}

// Jours de livraison pour les différentes zones
const deliveryDaysCentre: DeliveryDayWithTime[] = [
  { day: "Mercredi", time: "17h-20h" },
  { day: "Vendredi", time: "17h-20h" }
];
const deliveryDaysOthers: DeliveryDayWithTime[] = [];

// Liste statique des codes postaux avec informations de livraison (identique à PostalCodeSelector.tsx)
const allPostalCodes: PostalCodeData[] = [
  {
    city: "Basse-Pointe",
    postalCode: "97218",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Bellefontaine",
    postalCode: "97222",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Case-Pilote",
    postalCode: "97222",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysCentre
  },
  {
    city: "Ducos",
    postalCode: "97224",
    communality: "Espace sud de la Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Fonds-Saint-Denis",
    postalCode: "97250",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Fort-de-France",
    postalCode: "97200",
    communality: "Centre Martinique",
    deliveryDays: deliveryDaysCentre
  },
  {
    city: "Grand'Rivière",
    postalCode: "97218",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Gros-Morne",
    postalCode: "97213",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "L'Ajoupa-Bouillon",
    postalCode: "97216",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "La Trinité",
    postalCode: "97220",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Le Carbet",
    postalCode: "97221",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Le Diamant",
    postalCode: "97223",
    communality: "Espace sud de la Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Le François",
    postalCode: "97240",
    communality: "Espace sud de la Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Le Lamentin",
    postalCode: "97232",
    communality: "Centre Martinique",
    deliveryDays: deliveryDaysCentre
  },
  {
    city: "Le Lorrain",
    postalCode: "97214",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Le Marigot",
    postalCode: "97225",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Le Marin",
    postalCode: "97290",
    communality: "Espace sud de la Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Le Morne-Rouge",
    postalCode: "97260",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Le Morne-Vert",
    postalCode: "97226",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Le Prêcheur",
    postalCode: "97250",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Le Robert",
    postalCode: "97231",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Le Vauclin",
    postalCode: "97280",
    communality: "Espace sud de la Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Les Anses-d'Arlet",
    postalCode: "97217",
    communality: "Espace sud de la Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Les Trois-Îlets",
    postalCode: "97229",
    communality: "Espace sud de la Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Macouba",
    postalCode: "97218",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Rivière-Pilote",
    postalCode: "97211",
    communality: "Espace sud de la Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Rivière-Salée",
    postalCode: "97215",
    communality: "Espace sud de la Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Saint-Esprit",
    postalCode: "97270",
    communality: "Espace sud de la Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Saint-Joseph",
    postalCode: "97212",
    communality: "Centre Martinique",
    deliveryDays: deliveryDaysCentre
  },
  {
    city: "Saint-Pierre",
    postalCode: "97250",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Sainte-Anne",
    postalCode: "97227",
    communality: "Espace sud de la Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Sainte-Luce",
    postalCode: "97228",
    communality: "Espace sud de la Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Sainte-Marie",
    postalCode: "97230",
    communality: "Nord Martinique",
    deliveryDays: deliveryDaysOthers
  },
  {
    city: "Schœlcher",
    postalCode: "97233",
    communality: "Centre Martinique",
    deliveryDays: deliveryDaysCentre
  }
];

// Fonction pour valider une combinaison ville/code postal
export const isValidCityPostalCode = (city: string, postalCode: string): boolean => {
  return allPostalCodes.some(
    item => item.city.toLowerCase() === city.toLowerCase() && item.postalCode === postalCode
  );
};

// Fonction pour obtenir les informations de livraison d'un code postal
export const getDeliveryInfoFromPostalCode = (city: string, postalCode: string): DeliveryInfo | null => {
  const match = allPostalCodes.find(
    item => item.city.toLowerCase() === city.toLowerCase() && item.postalCode === postalCode
  );
  
  if (match) {
    return {
      zone: match.communality,
      isAvailable: match.deliveryDays.length > 0,
      deliveryDays: match.deliveryDays
    };
  }
  
  return null;
};

// Fonction pour obtenir les jours de livraison en fonction du code postal et de la communalité (identique à PostalCodeSelector.tsx)
export function getRelayDeliveryDaysFromPostalCode(postalCode: string, communality: string): DeliveryDayWithTime[] {
  const postalCodeData = allPostalCodes.find(data => 
    data.postalCode === postalCode && data.communality === communality
  );
  return postalCodeData ? postalCodeData.deliveryDays : [];
}

const CityPostalCodeSelector: React.FC<CityPostalCodeSelectorProps> = ({
  city,
  postalCode,
  onCityChange,
  onPostalCodeChange,
  onValidationChange
}) => {
  const [filteredCities, setFilteredCities] = useState<PostalCodeData[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);

  // Filtrer les villes en fonction de la saisie
  useEffect(() => {
    if (city.length > 0) {
      const filtered = allPostalCodes.filter(item =>
        item.city.toLowerCase().includes(city.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowCityDropdown(filtered.length > 0 && city !== filtered[0]?.city);
    } else {
      setFilteredCities([]);
      setShowCityDropdown(false);
    }
  }, [city]);

  // Valider la combinaison ville/code postal
  useEffect(() => {
    const valid = isValidCityPostalCode(city, postalCode);
    const info = getDeliveryInfoFromPostalCode(city, postalCode);
    
    setIsValid(valid);
    setDeliveryInfo(info);
    onValidationChange(valid, info);
  }, [city, postalCode, onValidationChange]);

  const handleCitySelect = (selectedCity: PostalCodeData) => {
    onCityChange(selectedCity.city);
    onPostalCodeChange(selectedCity.postalCode);
    setShowCityDropdown(false);
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCityChange(e.target.value);
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPostalCodeChange(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* Champ Ville */}
      <div className="relative">
        <label htmlFor="city-input" className="block text-sm font-medium text-gray-700 mb-1">
          Ville *
        </label>
        <input
          id="city-input"
          type="text"
          value={city}
          onChange={handleCityInputChange}
          onFocus={() => city.length > 0 && setShowCityDropdown(filteredCities.length > 0)}
          onBlur={() => {
            // Délai pour permettre la sélection avant fermeture
            setTimeout(() => setShowCityDropdown(false), 300);
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            city && !isValid ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Saisissez votre ville"
          required
        />
        
        {/* Menu déroulant des villes */}
        {showCityDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredCities.map((item, index) => (
              <div
                key={index}
                role="button"
                tabIndex={0}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCitySelect(item);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCitySelect(item);
                  }
                }}
                aria-label={`Sélectionner ${item.city}, ${item.postalCode}`}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium">{item.city}</div>
                <div className="text-sm text-gray-600">
                  {item.postalCode} • Zone {item.communality}
                </div>
                {item.deliveryDays.length > 0 && item.deliveryDays !== deliveryDaysOthers && (
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Livraison à domicile disponible
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Champ Code postal */}
      <div>
        <label htmlFor="postal-code-input" className="block text-sm font-medium text-gray-700 mb-1">
          Code postal *
        </label>
        <input
          id="postal-code-input"
          type="text"
          value={postalCode}
          onChange={handlePostalCodeChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            postalCode && !isValid ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="97200"
          required
        />
      </div>

      {/* Affichage des informations de livraison */}
      {city && postalCode && (
        <div className={`p-3 rounded-md ${
          isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {isValid && deliveryInfo ? (
            <div>
              <div className="text-sm font-medium text-green-800">
                ✓ Adresse valide
              </div>
              <div className="text-sm text-green-700 mt-1">
                Zone: {deliveryInfo.zone}
              </div>
              {deliveryInfo.isAvailable && deliveryInfo.deliveryDays.length > 0 && (
                <div className="text-sm text-green-700 mt-1">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Livraison à domicile disponible
                  </div>
                  <div className="text-xs mt-1">
                    {deliveryInfo.deliveryDays.map((day, index) => (
                      <span key={index} className="mr-2">
                        {day.day} {day.time}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-red-800">
              ✗ Combinaison ville/code postal non valide ou livraison non disponible
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CityPostalCodeSelector;