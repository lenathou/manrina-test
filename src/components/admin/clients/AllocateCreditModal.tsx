/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { Client } from './ClientTable';

interface AllocateCreditModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onSuccess?: () => void;
}

export const AllocateCreditModal: React.FC<AllocateCreditModalProps> = ({ isOpen, onClose, client, onSuccess }) => {
    const [amount, setAmount] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [operation, setOperation] = useState<'add' | 'reduce'>('add');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [balanceLoading, setBalanceLoading] = useState(false);

    // Charger le solde du client
    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (!client || !isOpen) return;
            
            setBalanceLoading(true);
            try {
                const response = await fetch(`/api/admin/clients/${client.id}/wallet-balance`, {
                    method: 'GET',
                    credentials: 'include',
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setWalletBalance(data.walletBalance || 0);
                } else {
                    console.error('Erreur lors du chargement du solde');
                    setWalletBalance(0);
                }
            } catch (error) {
                console.error('Erreur lors du chargement du solde:', error);
                setWalletBalance(0);
            } finally {
                setBalanceLoading(false);
            }
        };
        
        fetchWalletBalance();
    }, [client, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!client) return;

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Veuillez saisir un montant valide');
            return;
        }

        // Vérification pour la réduction de crédit
        if (operation === 'reduce' && numericAmount > walletBalance) {
            setError(`Montant trop élevé. Solde disponible: ${walletBalance.toFixed(2)}€`);
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const endpoint = operation === 'add' ? '/api/admin/allocate-credit' : `/api/admin/clients/${client.id}/credit`;
            const body = operation === 'add' 
                ? {
                    customerId: client.id,
                    amount: numericAmount,
                    reason: reason.trim() || undefined,
                }
                : {
                    amount: numericAmount,
                    operation: 'reduce',
                    reason: reason.trim() || undefined,
                };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Erreur lors de l'${operation === 'add' ? 'allocation' : 'réduction'} du crédit`);
            }

            const operationText = operation === 'add' ? 'alloué' : 'réduit';
            setSuccess(`Crédit de ${numericAmount}€ ${operationText} avec succès pour ${client.name}`);
            setAmount('');
            setReason('');
            
            // Recharger le solde
            const balanceResponse = await fetch(`/api/admin/clients/${client.id}/wallet-balance`, {
                method: 'GET',
                credentials: 'include',
            });
            if (balanceResponse.ok) {
                const balanceData = await balanceResponse.json();
                setWalletBalance(balanceData.walletBalance || 0);
            }

            // Attendre un peu pour que l'utilisateur voie le message de succès
            setTimeout(() => {
                onSuccess?.();
                handleClose();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setAmount('');
        setReason('');
        setOperation('add');
        setError('');
        setSuccess('');
        setWalletBalance(0);
        onClose();
    };

    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Gestion du crédit client</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Client Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Client sélectionné</h3>
                        <div className="text-sm text-gray-600">
                            <p>
                                <span className="font-medium">Nom:</span> {client.name}
                            </p>
                            <p>
                                <span className="font-medium">Email:</span> {client.email}
                            </p>
                            <p>
                                <span className="font-medium">ID:</span> #{client.id}
                            </p>
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="font-medium text-blue-900">
                                    Solde actuel: {' '}
                                    {balanceLoading ? (
                                        <span className="text-blue-600">Chargement...</span>
                                    ) : (
                                        <span className={`font-bold ${
                                            walletBalance >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {walletBalance.toFixed(2)}€
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Operation Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Type d'opération
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="operation"
                                    value="add"
                                    checked={operation === 'add'}
                                    onChange={(e) => setOperation(e.target.value as 'add' | 'reduce')}
                                    disabled={isLoading}
                                    className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    <span className="font-medium text-green-600">Ajouter du crédit</span>
                                    <span className="text-gray-500 ml-1">(augmenter le solde)</span>
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="operation"
                                    value="reduce"
                                    checked={operation === 'reduce'}
                                    onChange={(e) => setOperation(e.target.value as 'add' | 'reduce')}
                                    disabled={isLoading}
                                    className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    <span className="font-medium text-red-600">Réduire le crédit</span>
                                    <span className="text-gray-500 ml-1">(diminuer le solde)</span>
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        {/* Amount Input */}
                        <div>
                            <label
                                htmlFor="amount"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Montant (€) *
                                {operation === 'reduce' && (
                                    <span className="text-red-600 text-xs ml-1">
                                        (max: {walletBalance.toFixed(2)}€)
                                    </span>
                                )}
                            </label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                min="0.01"
                                max={operation === 'reduce' ? walletBalance : undefined}
                                required
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Reason Input */}
                        <div>
                            <label
                                htmlFor="reason"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Motif (optionnel)
                            </label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Ex: Compensation pour produit défectueux, geste commercial..."
                                rows={3}
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-600">{success}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !amount}
                                className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] border border-transparent rounded-md shadow-sm hover:bg-[var(--color-primary)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Allocation...
                                    </span>
                                ) : (
                                    operation === 'add' ? 'Ajouter le crédit' : 'Réduire le crédit'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
