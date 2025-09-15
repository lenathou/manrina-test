// Fonction toast simple pour les notifications
export const success = (message: string) => {
    console.log('✅ Success:', message);
    // Optionnel: afficher une alerte ou notification personnalisée
    // Vous pouvez intégrer ici votre système de toast préféré
};

export const error = (message: string) => {
    console.error('❌ Error:', message);
    // Optionnel: afficher une alerte ou notification personnalisée
    // Vous pouvez intégrer ici votre système de toast préféré
};

// Export par défaut pour compatibilité
export default {
    success,
    error
};