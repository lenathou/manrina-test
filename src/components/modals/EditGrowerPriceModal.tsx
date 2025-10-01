import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '../../service/BackendFetchService';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/Card';

interface EditGrowerPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  growerId: string;
  variantId: string;
  productId: string;
  currentPrice: number;
  variantName: string;
  productName: string;
  growerName: string;
}

const EditGrowerPriceModal: React.FC<EditGrowerPriceModalProps> = ({
  isOpen,
  onClose,
  growerId,
  variantId,
  productId,
  currentPrice,
  variantName,
  productName,
  growerName,
}) => {
  const [price, setPrice] = useState<string>(currentPrice.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setPrice(currentPrice.toString());
    }
  }, [isOpen, currentPrice]);

  const updatePriceMutation = useMutation({
    mutationFn: async (newPrice: number) => {
      const response = await backendFetchService.updateGrowerProductPrice({
        growerId,
        variantId,
        price: newPrice,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-grower-prices', productId] });
      onClose();
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du prix:', error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) {
      alert('Veuillez entrer un prix valide');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePriceMutation.mutateAsync(newPrice);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      style={{ zIndex: 9999 }}
      onClick={handleClose}
    >
      <Card
        className="w-[500px] max-w-[90vw] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête du modal */}
        <CardHeader className="bg-secondary text-white p-0 m-0">
          <div className="flex items-center justify-between p-6">
            <div>
              <CardTitle className="text-xl font-bold text-white mb-3">
                Modifier le prix du producteur
              </CardTitle>
              <div className="text-sm text-white space-y-1 opacity-90">
                <p><span className="font-medium">Producteur:</span> {growerName}</p>
                <p><span className="font-medium">Produit:</span> {productName}</p>
                <p><span className="font-medium">Variant:</span> {variantName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-white hover:text-white/80 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </CardHeader>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <CardContent className="bg-background space-y-6 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (€)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                step="0.01"
                min="0"
                required
                disabled={isSubmitting}
                placeholder="0.00"
              />
            </div>
          </CardContent>

          {/* Boutons d'action */}
          <CardFooter className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditGrowerPriceModal;