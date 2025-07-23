import { useRouter } from 'next/router';
import { useEffect } from 'react';
import SuccessPage from './success';
import FailPage from './fail';

export default function CheckoutOverPage() {
    const router = useRouter();
    const { status } = router.query;

    useEffect(() => {
        // Si aucun statut n'est fourni, rediriger vers la page d'accueil
        if (router.isReady && !status) {
            router.replace('/');
        }
    }, [router.isReady, status, router]);

    if (!router.isReady || !status) {
        return null;
    }

    if (status === 'success') {
        return <SuccessPage />;
    }

    if (status === 'fail') {
        return <FailPage />;
    }

    // Statut inconnu, rediriger vers la page d'accueil
    router.replace('/');
    return null;
}