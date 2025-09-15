import Image from 'next/image';
import { IGrowerPrice } from '@/server/grower/GrowerPricingService';
import { Button } from '@/components/ui/Button';

interface GrowerPriceCardProps {
  growerPrice: IGrowerPrice;
  onEdit: () => void;
}

export default function GrowerPriceCard({ growerPrice, onEdit }: GrowerPriceCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {growerPrice.growerAvatar ? (
            <Image
              src={growerPrice.growerAvatar}
              alt={growerPrice.growerName}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {growerPrice.growerName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h4 className="font-medium text-gray-900">{growerPrice.growerName}</h4>
            <p className="text-sm text-gray-500">Stock: {growerPrice.stock}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">{growerPrice.price}€</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            Modifier le prix
          </Button>
        </div>
      </div>
    </div>
  );
}