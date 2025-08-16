import { useRef, useState } from 'react';
import { Animated, Linking, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colorUsages } from '../theme';
import { DeliveryMethod } from '../types/DeliveryMethodsType';
import { DeliveryDayWithTime, getRelayDeliveryDaysFromPostalCode } from './PostalCodeSelector';
import { onlyShowDeliveryDaysAtLeastTwoDaysLaterAndNothingOnThursday } from './onlyShowDeliveryDaysAtLeastTwoDaysLater';

export const DeliveryMethodItem = ({
    method,
    onSelect,
}: {
    method: DeliveryMethod;
    onSelect: (dayChosen: string) => void;
}) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const animationCount = useRef(0);
    const [deliveryDate, setDeliveryDate] = useState<string>('');

    const startPulseAnimation = () => {
        // Reset counter when starting new animation
        animationCount.current = 0;

        const pulse = () => {
            // Only continue if we haven't done 2 pulses yet
            if (animationCount.current < 2) {
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    animationCount.current += 1;
                    pulse();
                });
            } else {
                // Reset animation value when done
                pulseAnim.setValue(1);
            }
        };

        pulse();
    };

    const priceDisplay = method.basePrice === 0 ? 'Gratuit' : `${method.basePrice} €`;

    const openGoogleMaps = (method: DeliveryMethod) => {
        const dataToSearch = `${method.name} ${method.location?.address} ${method.location?.postalCode} ${method.location?.city}`;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dataToSearch)}`;
        Linking.openURL(url);
    };

    // Format capabilities for display
    const formatCapabilities = (capabilities: typeof method.capabilities) => {
        if (!capabilities) return null;
        return (
            <View style={styles.capabilitiesSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🧊 Stockage disponible</Text>
                </View>
                <View style={styles.capabilitiesList}>
                    <View style={[styles.capabilityItem, capabilities.fresh && styles.capabilityEnabled]}>
                        <Text style={[styles.capabilityText, capabilities.fresh && styles.capabilityEnabledText]}>
                            Frais
                        </Text>
                    </View>
                    <View style={[styles.capabilityItem, capabilities.refrigerated && styles.capabilityEnabled]}>
                        <Text
                            style={[styles.capabilityText, capabilities.refrigerated && styles.capabilityEnabledText]}
                        >
                            Réfrigéré
                        </Text>
                    </View>
                    <View style={[styles.capabilityItem, capabilities.frozen && styles.capabilityEnabled]}>
                        <Text style={[styles.capabilityText, capabilities.frozen && styles.capabilityEnabledText]}>
                            Congelé
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    // Format schedule for display
    const formatSchedule = (schedule: typeof method.schedule) => {
        if (!schedule) return null;

        const formatWeekOpeningHours = () => {
            if (!schedule.weekOpeningHours?.length) return null;

            return schedule.weekOpeningHours.map((daySchedule, index) => {
                const [days, ...hours] = daySchedule;
                return (
                    <View
                        key={index}
                        style={styles.weekScheduleItem}
                    >
                        <Text style={styles.weekDays}>{days}</Text>
                        <View style={styles.weekHours}>
                            {hours.map((hour, idx) => (
                                <Text
                                    key={idx}
                                    style={styles.hoursText}
                                >
                                    {hour}
                                </Text>
                            ))}
                        </View>
                    </View>
                );
            });
        };

        const deliveryDays = getRelayDeliveryDaysFromPostalCode(method.location?.postalCode);

        return (
            <View style={styles.scheduleContainer}>
                <Animated.View
                    style={{
                        transform: [{ scale: pulseAnim }],
                    }}
                >
                    <SelectDeliveryDate
                        deliveryDays={deliveryDays}
                        onValidate={onSelect}
                    />
                </Animated.View>

                <View style={styles.openingHoursSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🕒 Horaires d&apos;ouverture</Text>
                    </View>
                    <View style={styles.weekScheduleContainer}>{formatWeekOpeningHours()}</View>
                </View>
            </View>
        );
    };

    return (
        <Pressable
            style={styles.container}
            onPress={() => {
                startPulseAnimation();
            }}
        >
            <View style={styles.contentContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>{method.name}</Text>
                    <Text style={styles.price}>{priceDisplay}</Text>
                </View>

                <View style={styles.detailsContainer}>
                    {method.location && (
                        <View style={styles.locationSection}>
                            <View style={styles.locationContainer}>
                                <View style={styles.locationTextContainer}>
                                    <Text style={styles.locationText}>📍 {method.location.address}</Text>
                                    <Text style={styles.locationText}>
                                        {method.location.postalCode} {method.location.city}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => openGoogleMaps(method)}
                                >
                                    <Text style={styles.actionButtonText}>🗺️ Ouvrir sur Maps</Text>
                                </TouchableOpacity>
                                {/* {method.location?.phone && (
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() =>
                                            Linking.openURL(
                                                `tel:${method.location?.phone}`
                                            )
                                        }
                                    >
                                        <Text style={styles.actionButtonText}>
                                            📞 Appeler
                                        </Text>
                                    </TouchableOpacity>
                                )} */}
                            </View>
                        </View>
                    )}
                    {formatSchedule(method.schedule)}
                    {formatCapabilities(method.capabilities)}
                    {method.additionalInfo && <Text style={styles.additionalInfoText}>ℹ️ {method.additionalInfo}</Text>}
                </View>
            </View>
        </Pressable>
    );
};

export const SelectDeliveryDate = ({
    deliveryDays: _deliveryDays,
    onSelect,
    onValidate,
    selectedDay,
}: {
    deliveryDays: DeliveryDayWithTime[];
    onSelect?: (day: string) => void;
    onValidate?: (day: string) => void;
    selectedDay?: string;
}) => {
    const [deliveryDate, setDeliveryDate] = useState<string>('');
    // TEMPORAIRE: Commenté pour permettre aux utilisateurs sans compte de passer commande sans restriction de jours
    // const deliveryDays = onlyShowDeliveryDaysAtLeastTwoDaysLaterAndNothingOnThursday(
    //     _deliveryDays,
    //     new Date().getDay(),
    // );
    const deliveryDays = _deliveryDays; // Utilise tous les jours disponibles sans restriction
    const hasNoDeliveryDays = deliveryDays.length === 0;
    if (hasNoDeliveryDays) {
        return (
            <View style={styles.deliverySection}>
                <View style={styles.noDeliveryContainer}>
                    <Text style={styles.noDeliveryIcon}>⏰</Text>
                    <Text style={styles.noDeliveryTitle}>Livraisons temporairement indisponibles</Text>
                    <Text style={styles.noDeliveryText}>
                        Les stocks producteurs sont mis à jour chaque jeudi pour garantir des produits de saison et une
                        fraîcheur optimale.
                        {'\n'}Revenez dès vendredi matin pour découvrir les nouvelles sélections et choisir votre jour
                        de livraison ! 🌱
                    </Text>
                </View>
            </View>
        );
    }
    return (
        <View style={styles.deliverySection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📦 Sélectionnez un jour de livraison</Text>
            </View>
            <View style={styles.deliveryDaysContainer}>
                {deliveryDays.map((day, index) => {
                    const isSelected = day.day === deliveryDate;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                if (deliveryDate === day.day) {
                                    setDeliveryDate('');
                                } else {
                                    setDeliveryDate(day.day);
                                    onSelect?.(day.day);
                                }
                            }}
                        >
                            <Text style={[styles.deliveryDayPill, isSelected && styles.selectedDayPill]}>
                                {day.day}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {deliveryDate && onValidate ? (
                <TouchableOpacity onPress={() => onValidate?.(deliveryDate)}>
                    <Text
                        style={[
                            styles.deliveryDayPill,
                            {
                                backgroundColor: '#28a745',
                                color: 'white',
                                width: 'fit-content',
                                marginTop: 10,
                            },
                        ]}
                    >
                        Confirmer
                    </Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        width: '100%',
        maxWidth: 500,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    // selectedContainer: {
    //     backgroundColor: "#F3F9F5",
    //     borderColor: "#28a745",
    //     borderWidth: 2,
    // },
    contentContainer: {
        gap: 8,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    detailsContainer: {
        gap: 4,
    },
    title: {
        fontFamily: 'open',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        flex: 1,
        marginRight: 16,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#28a745',
        backgroundColor: '#F3F9F5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    locationSection: {
        padding: 8,
        borderRadius: 6,
        gap: 8,
    },
    locationContainer: {
        gap: 2,
    },
    locationTextContainer: {
        gap: 2,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    locationText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        fontWeight: '500',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        display: 'flex',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        padding: 2,
        fontWeight: '500',
    },
    scheduleContainer: {
        gap: 8,
        marginTop: 4,
    },
    sectionHeader: {
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    deliverySection: {
        backgroundColor: colorUsages.background, // Light indigo background
        borderWidth: 3,
        borderColor: colorUsages.primary,
        padding: 8,
        borderRadius: 6,
    },
    deliveryDaysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    deliveryDayPill: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        fontSize: 14,
        color: colorUsages.primary,
        fontWeight: '500',
        // Add hover effect styles
        cursor: 'pointer',
    },
    selectedDayPill: {
        backgroundColor: colorUsages.primary,
        color: '#FFFFFF',
    },
    openingHoursSection: {
        backgroundColor: '#FEFEFE',
        padding: 8,
        borderRadius: 6,
    },
    weekScheduleContainer: {
        gap: 4,
    },
    weekScheduleItem: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    weekDays: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
        minWidth: 120,
    },
    weekHours: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        rowGap: 4,
    },
    hoursText: {
        fontSize: 14,
        color: '#4B5563',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    capabilitiesSection: {
        backgroundColor: '#FEFEFE',
        padding: 8,
        borderRadius: 6,
        gap: 4,
    },
    capabilitiesList: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    capabilityItem: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        minWidth: 80,
        alignItems: 'center',
    },
    capabilityEnabled: {
        backgroundColor: '#D1FAE5',
    },
    capabilityText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    capabilityEnabledText: {
        color: '#047857',
    },
    additionalInfoText: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
        lineHeight: 20,
        backgroundColor: '#FEFEFE',
        padding: 8,
        borderRadius: 4,
    },
    noDeliveryContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
    },
    noDeliveryIcon: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#28a745',
    },
    noDeliveryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    noDeliveryText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        padding: 12,
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#F59E0B',
        fontWeight: '500',
    },
});
