import { StyleSheet, Text, View } from 'react-native';
import { SelectableList } from '../components/SelectableList';

type DeliveryDays = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';
export type DeliveryDayWithTime = {
    day: DeliveryDays;
    time?: string;
};
export type PostalCodeItem = {
    name: string;
    postalCode: string;
    communalite: string;
    deliveryDays: DeliveryDayWithTime[];
};
export const PostalCodeSelector = ({ setPostalCode }: { setPostalCode: (postalCode: PostalCodeItem) => void }) => {
    return (
        <SelectableList
            title="Sélectionnez votre code postal"
            items={allPostalCodes}
            onSelect={setPostalCode}
            renderContent={(item) => <PostalCodeItem item={item} />}
            keyExtractor={(item) => item.postalCode + item.name}
        />
    );
};

export const PostalCodeItem = ({ item }: { item: PostalCodeItem }) => {
    return (
        <View style={styles.itemContentContainer}>
            <View style={styles.mainContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPostalCode}>{item.postalCode}</Text>
            </View>
            {item.deliveryDays.length > 0 && (
                <View style={styles.deliveryInfo}>
                    <View style={styles.deliveryDot} />
                    <Text style={styles.deliveryText}>Livraison à domicile disponible</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    itemContentContainer: {
        flex: 1,
        gap: 4,
    },
    mainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    itemPostalCode: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    deliveryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
    },
    deliveryText: {
        fontSize: 12,
        color: '#4CAF50',
    },
});

const deliveryDaysCentre: DeliveryDayWithTime[] = [
    // { day: 'Lundi', time: '17h-20h' },
    // { day: 'Mardi', time: '17h-20h' },
    // { day: 'Mercredi', time: '17h-20h' },
    // { day: 'Jeudi', time: '17h-20h' },
    { day: 'Vendredi', time: '17h-20h' },
];
const deliveryDaysOthers: DeliveryDayWithTime[] = [
    // { day: "Mercredi", time: "17h-20h" },
    // { day: "Vendredi", time: "17h-20h" },
];

const allPostalCodes: PostalCodeItem[] = [
    {
        name: 'Basse-Pointe',
        postalCode: '97218',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Bellefontaine',
        postalCode: '97222',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Case-Pilote',
        postalCode: '97222',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysCentre,
    },
    {
        name: 'Ducos',
        postalCode: '97224',
        communalite: 'Espace sud de la Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Fonds-Saint-Denis',
        postalCode: '97250',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Fort-de-France',
        postalCode: '97200',
        communalite: 'Centre Martinique',
        deliveryDays: deliveryDaysCentre,
    },
    {
        name: "Grand'Rivière",
        postalCode: '97218',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Gros-Morne',
        postalCode: '97213',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: "L'Ajoupa-Bouillon",
        postalCode: '97216',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'La Trinité',
        postalCode: '97220',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Le Carbet',
        postalCode: '97221',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Le Diamant',
        postalCode: '97223',
        communalite: 'Espace sud de la Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Le François',
        postalCode: '97240',
        communalite: 'Espace sud de la Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Le Lamentin',
        postalCode: '97232',
        communalite: 'Centre Martinique',
        deliveryDays: deliveryDaysCentre,
    },
    {
        name: 'Le Lorrain',
        postalCode: '97214',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Le Marigot',
        postalCode: '97225',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Le Marin',
        postalCode: '97290',
        communalite: 'Espace sud de la Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Le Morne-Rouge',
        postalCode: '97260',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Le Morne-Vert',
        postalCode: '97226',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Le Prêcheur',
        postalCode: '97250',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Le Robert',
        postalCode: '97231',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Le Vauclin',
        postalCode: '97280',
        communalite: 'Espace sud de la Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: "Les Anses-d'Arlet",
        postalCode: '97217',
        communalite: 'Espace sud de la Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Les Trois-Îlets',
        postalCode: '97229',
        communalite: 'Espace sud de la Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Macouba',
        postalCode: '97218',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Rivière-Pilote',
        postalCode: '97211',
        communalite: 'Espace sud de la Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Rivière-Salée',
        postalCode: '97215',
        communalite: 'Espace sud de la Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Saint-Esprit',
        postalCode: '97270',
        communalite: 'Espace sud de la Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Saint-Joseph',
        postalCode: '97212',
        communalite: 'Centre Martinique',
        deliveryDays: deliveryDaysCentre,
    },
    {
        name: 'Saint-Pierre',
        postalCode: '97250',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Sainte-Anne',
        postalCode: '97227',
        communalite: 'Espace sud de la Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Sainte-Luce',
        postalCode: '97228',
        communalite: 'Espace sud de la Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Sainte-Marie',
        postalCode: '97230',
        communalite: 'Nord Martinique',
        deliveryDays: deliveryDaysOthers,
    },
    {
        name: 'Schœlcher',
        postalCode: '97233',
        communalite: 'Centre Martinique',
        deliveryDays: deliveryDaysCentre,
    },
    {
        name: 'Autre',
        postalCode: '',
        communalite: '',
        deliveryDays: deliveryDaysOthers,
    },
];

const defaultRelayDeliveryDays: DeliveryDayWithTime[] = [{ day: 'Vendredi' }];
const deliveryDaysByCommunalite: Record<string, DeliveryDayWithTime[]> = {
    'Centre Martinique': [{ day: 'Vendredi' }],
    'Nord Martinique': defaultRelayDeliveryDays,
    'Espace sud de la Martinique': defaultRelayDeliveryDays,
};
export const getRelayDeliveryDaysFromPostalCode = (postalCode?: string) => {
    if (!postalCode) {
        return defaultRelayDeliveryDays;
    }
    const matchingPostalCode = allPostalCodes.find((item) => item.postalCode === postalCode);
    const communalite = matchingPostalCode?.communalite;
    const deliveryDays = communalite && deliveryDaysByCommunalite[communalite];
    return deliveryDays || defaultRelayDeliveryDays;
};
