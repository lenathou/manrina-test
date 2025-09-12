import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '../../service/BackendFetchService';

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
      <div
        className="bg-white rounded-xl p-8 w-[500px] max-w-[90vw] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête du modal */}
        <div className="mb-6">
          <h3 className="text-xl font-secondary font-bold text-secondary mb-3">
            Modifier le prix du producteur
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Producteur:</span> {growerName}</p>
            <p><span className="font-medium">Produit:</span> {productName}</p>
            <p><span className="font-medium">Variant:</span> {variantName}</p>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3">
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGrowerPriceModal;