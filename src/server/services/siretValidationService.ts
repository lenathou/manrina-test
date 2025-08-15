export interface ISiretValidationResponse {
    success: boolean;
    companyName?: string;
    message?: string;
}

export interface ISirenApiResponse {
    etablissement: {
        siret: string;
        siren: string;
        nic: string;
        statut_diffusion: string;
        date_creation: string;
        tranche_effectifs?: string;
        annee_effectifs?: string;
        activite_principale_registre_metiers?: string;
        date_dernier_traitement: string;
        etablissement_siege: boolean;
        nombre_periodes: number;
        complement_adresse?: string;
        numero_voie?: string;
        indice_repetition?: string;
        type_voie?: string;
        libelle_voie?: string;
        code_postal?: string;
        libelle_commune?: string;
        libelle_commune_etranger?: string;
        distribution_speciale?: string;
        code_commune?: string;
        code_cedex?: string;
        libelle_cedex?: string;
        code_pays_etranger?: string;
        libelle_pays_etranger?: string;
        date_debut: string;
        etat_administratif: string;
        enseigne_1?: string;
        enseigne_2?: string;
        enseigne_3?: string;
        denomination_usuelle?: string;
        activite_principale?: string;
        nomenclature_activite_principale?: string;
        caractere_employeur?: string;
        unite_legale: {
            siren: string;
            statut_diffusion: string;
            date_creation: string;
            sigle?: string;
            sexe?: string;
            prenom_1?: string;
            prenom_2?: string;
            prenom_3?: string;
            prenom_4?: string;
            prenom_usuel?: string;
            pseudonyme?: string;
            identifiant_association?: string;
            tranche_effectifs?: string;
            annee_effectifs?: string;
            date_dernier_traitement: string;
            nombre_periodes: number;
            categorie_entreprise?: string;
            annee_categorie_entreprise?: string;
            date_fin?: string;
            date_debut: string;
            etat_administratif: string;
            nom?: string;
            nom_usage?: string;
            denomination?: string;
            denomination_usuelle_1?: string;
            denomination_usuelle_2?: string;
            denomination_usuelle_3?: string;
            categorie_juridique: string;
            activite_principale?: string;
            nomenclature_activite_principale?: string;
            nic_siege?: string;
            economie_sociale_solidaire?: string;
            caractere_employeur?: string;
        };
    };
}

export class SiretValidationService {
    private readonly sirenApiKey: string;
    private readonly baseUrl = 'https://data.siren-api.fr';

    constructor() {
        this.sirenApiKey = process.env.SIREN_API_KEY || process.env.INSEE_API_KEY || '';
        if (!this.sirenApiKey) {
            throw new Error('SIREN_API_KEY is required in environment variables');
        }
    }

    /**
     * Valide un numéro SIRET en vérifiant son existence auprès de l'API INSEE
     * @param siret Le numéro SIRET à valider (14 chiffres)
     * @returns Promise<ISiretValidationResponse>
     */
    public async validateSiret(siret: string): Promise<ISiretValidationResponse> {
        try {
            // Validation du format SIRET (14 chiffres)
            if (!this.isValidSiretFormat(siret)) {
                return {
                    success: false,
                    message: 'Le numéro SIRET doit contenir exactement 14 chiffres',
                };
            }

            // Nettoyer le SIRET avant l'appel API
            const cleanedSiret = this.cleanSiret(siret);
            console.log(`Validation SIRET: ${cleanedSiret}`);

            // Appel à l'API Siren-API.fr
            const response = await fetch(`${this.baseUrl}/v3/etablissements/${cleanedSiret}`, {
                method: 'GET',
                headers: {
                    'X-Client-Secret': this.sirenApiKey,
                    'Accept': 'application/json',
                },
            });

            console.log(`Réponse API Siren: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                if (response.status === 404) {
                    return {
                        success: false,
                        message: 'Aucune entreprise trouvée avec ce numéro SIRET',
                    };
                }
                if (response.status === 401) {
                    console.error("Erreur d'authentification Siren-API - Vérifiez votre clé API");
                    return {
                        success: false,
                        message: "Erreur d'authentification avec l'API Siren",
                    };
                }
                if (response.status === 429) {
                    return {
                        success: false,
                        message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
                    };
                }

                const errorText = await response.text();
                console.error(`Erreur API Siren ${response.status}:`, errorText);
                throw new Error(`Erreur API Siren: ${response.status}`);
            }

            const data: ISirenApiResponse = await response.json();
            console.log('Données reçues:', JSON.stringify(data, null, 2));

            // Vérifier si l'établissement existe
            if (!data.etablissement) {
                return {
                    success: false,
                    message: 'SIRET non trouvé',
                };
            }

            const etablissement = data.etablissement;

            // Vérifier si l'établissement est actif
            if (etablissement.etat_administratif !== 'A') {
                return {
                    success: false,
                    message: 'Cet établissement n\'est plus en activité',
                };
            }

            // Extraire le nom de l'entreprise
            let companyName = '';
            if (etablissement.unite_legale?.denomination) {
                companyName = etablissement.unite_legale.denomination;
            } else if (etablissement.unite_legale?.prenom_1 && etablissement.unite_legale?.nom) {
                companyName = `${etablissement.unite_legale.prenom_1} ${etablissement.unite_legale.nom}`;
            } else {
                companyName = 'Nom non disponible';
            }

            return {
                success: true,
                companyName,
                message: 'Entreprise validée avec succès',
            };
        } catch (error) {
            console.error('Erreur lors de la validation SIRET:', error);
            return {
                success: false,
                message: 'Erreur lors de la vérification du SIRET. Veuillez réessayer.',
            };
        }
    }

    /**
     * Valide le format d'un numéro SIRET
     * @param siret Le numéro SIRET à valider
     * @returns boolean
     */
    private isValidSiretFormat(siret: string): boolean {
        // Supprime les espaces et tirets
        const cleanSiret = siret.replace(/[\s-]/g, '');

        // Vérifie que c'est exactement 14 chiffres
        return /^\d{14}$/.test(cleanSiret);
    }



    /**
     * Nettoie un numéro SIRET en supprimant les espaces et tirets
     * @param siret Le numéro SIRET à nettoyer
     * @returns string
     */
    public cleanSiret(siret: string): string {
        return siret.replace(/[\s-]/g, '');
    }
}
