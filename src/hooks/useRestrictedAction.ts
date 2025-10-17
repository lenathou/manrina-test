import { useFeatureToggle } from '../contexts/FeatureToggleContext';
import { useToast } from '../components/ui/Toast';

/**
 * Hook personnalisé pour gérer les actions restreintes par le toggle deliveryEnabled
 * Affiche un toast informatif si la fonctionnalité est désactivée
 * 
 * @returns Une fonction qui encapsule l'action avec la vérification du toggle
 */
export const useRestrictedAction = () => {
    const { features } = useFeatureToggle();
    const { info } = useToast();

    /**
     * Exécute une action seulement si deliveryEnabled est true
     * Sinon affiche un toast informatif
     * 
     * @param action - La fonction à exécuter si autorisée
     * @param restrictionMessage - Message personnalisé pour le toast (optionnel)
     */
    const executeWithRestriction = (
        action: () => void,
        restrictionMessage: string = "Cette fonctionnalité sera bientôt disponible"
    ) => {
        if (features.deliveryEnabled) {
            action();
        } else {
            info(restrictionMessage);
        }
    };

    return {
        executeWithRestriction,
        isRestricted: !features.deliveryEnabled
    };
};