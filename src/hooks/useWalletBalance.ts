import { useState, useEffect } from 'react';

export const useWalletBalance = () => {
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWalletBalance = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/client/wallet-balance', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du solde');
            }

            const data = await response.json();
            setWalletBalance(data.walletBalance || 0);
        } catch (err) {
            console.error('Erreur lors du chargement du solde des avoirs:', err);
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            setWalletBalance(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletBalance();
    }, []);

    return {
        walletBalance,
        loading,
        error,
        refetch: fetchWalletBalance,
    };
};