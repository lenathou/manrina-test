const dataProduit = {
    id: 'recgovWyInhbXHGx3',
    createdTime: '2024-03-04T23:38:13.000Z',
    fields: {
        'Name': 'Banane Figues pommes',
        'Category': 'Fruits',
        'Pas sur sumup': true,
        'Produit SUMUP': ['rec4HoeLAn4p255TM'],
    },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dataActualisation = {
    id: 'rec5fQr9U7EmxCZ51',
    createdTime: '2024-06-04T17:47:49.000Z',
    fields: {
        'Unité': 'pièce' as 'pièce' | 'kg',
        'Quantité disponible': 20,
        'Prix achat': 90,
        'Type': 'Artisanat',
        'Statut': 'Terminé',
        'Actualiser Sumup': 'En attente',
        'Actualiser BO': 'En attente',
        'Cible': 'Professionnel',
        'Statut récupération': 'En attente',
        'Produit Lien': ['rec56lSXrrYJ0zCzJ'],
        'Producteur ✏️': ['recVB1rs57NtgqL8Z'],
        'Produit': 'Yole personnalisable 38cm',
        'Producteur': ['Manuel Palix (Manuel X)'],
        'Quantité CMD Summum': 0,
        'Totale à commander': 0,
        'Commission 10%': 100,
        'Commission 20%': 112.5,
        'Commission 30%': 128.57142857142858,
        'Prix vente MARGE 40%': 125.99999999999999,
        'Prix vente COM 30%': 128.57142857142858,
        'Prix quantité panier': 0,
        'Dernière Modification': '2024-09-17T21:02:09.000Z',
        'Créé par': {
            id: 'usrDX96tdBTOaKipK',
            email: 'contact@tanou.bio',
            name: 'Ta Nou',
        },
        'CA MdB Potentiel': 0,
        'Prix Professionnel': 105.88235294117646,
        'Prix quantité KM': 0,
        'Prix kit': 0,
        'Total CMD Élidiet': 0,
        'Bénéfice net': 0,
        'Category (from Produit Lien)': ['Artisanat'],
        'Produit SUMUP (from Produit Lien)': ['rec4HoeLAn4p255TM'],
    },
};
export type ManrinaProduct = typeof dataProduit;
export type ManrinaActualisationElement = typeof dataActualisation;
