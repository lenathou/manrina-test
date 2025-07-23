import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useCheckoutStorage } from '../hooks/useCheckoutStorage';
import { backendFetchService } from '../service/BackendFetchService';
import { DeliveryMethod, DeliveryMethodsData } from '../types/DeliveryMethodsType';
import { AdressForm } from './AdressForm';
import { ContactInfo } from './ContactInfo';
import { ContactForm } from './ContactSection';
import { DeliveryMethodItem } from './DeliveryMethodItem';
import { DeliveryPageContainer } from './DeliveryPageContainer';
import { PostalCodeItem, PostalCodeSelector } from './PostalCodeSelector';
import { SelectDeliveryMethod } from './SelectDeliveryMethod';
import { SummaryPage } from './SummaryPage';

type CheckoutState = 'postalCode' | 'category' | 'deliveryMethod' | 'contact' | 'summary';

export const DeliveryManager = () => {
    const { checkoutStorage, setContact, setCategory, setDeliveryMethod, setPostalCode, setDayChosen } =
        useCheckoutStorage();
    const router = useRouter();
    const navState = router.query.state as CheckoutState;
    const checkoutState = navState || 'postalCode';
    useEffect(() => {}, [router.isReady]);
    const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodsData>({ categories: [] });
    useEffect(() => {
        backendFetchService.getDeliveryMethods().then((data) => setDeliveryMethods(data));
    }, []);

    const updateCheckoutState = (newState: CheckoutState) => {
        // setCheckoutState(newState);
        const currentPagePath = router.pathname;
        router.push(`${currentPagePath}?state=${newState}`);
    };
    const onSelectCateogry = (method: string) => {
        const newNavState = 'deliveryMethod';
        setCategory(method);
        updateCheckoutState(newNavState);
    };
    const setSelectedMethod = (method: DeliveryMethod, dayChosen: string) => {
        const newNavState = 'contact';
        setDeliveryMethod(method, dayChosen);
        updateCheckoutState(newNavState);
    };

    const setContactData = (data: ContactInfo) => {
        const newNavState = 'summary';
        setContact(data);
        updateCheckoutState(newNavState);
    };

    const setPostalCodeData = (postalCode: PostalCodeItem) => {
        const newNavState = 'category';
        setPostalCode(postalCode);
        updateCheckoutState(newNavState);
    };

    if (!checkoutStorage || !router.isReady) {
        return (
            <DeliveryPageContainer title="Chargement...">
                <ActivityIndicator
                    size="large"
                    color="#0000ff"
                />
            </DeliveryPageContainer>
        );
    }

    if (!checkoutStorage.postalCode || checkoutState === 'postalCode') {
        return (
            <DeliveryPageContainer title="Code postal">
                <PostalCodeSelector setPostalCode={(postalCode) => setPostalCodeData(postalCode)} />
            </DeliveryPageContainer>
        );
    }

    const SelectedDeliveryMethodItem = ({ deliveryMethod }: { deliveryMethod: DeliveryMethod }) => {
        return (
            <Text style={styles.deliveryMethodContainer}>
                <Text style={styles.summaryLabel}>Mode de livraison sélectionné : </Text>
                <Text
                    onPress={() => updateCheckoutState('category')}
                    style={styles.updateLink}
                >
                    {deliveryMethod.name} (modifier)
                </Text>
            </Text>
        );
    };

    if (!checkoutStorage.category || checkoutState === 'category') {
        const canDeliveryToHome = checkoutStorage.postalCode.deliveryDays.length > 0;
        return (
            <DeliveryPageContainer title="Livraison">
                <SelectedPostalCode
                    postalCode={checkoutStorage.postalCode}
                    onUpdate={() => updateCheckoutState('postalCode')}
                />
                <SelectDeliveryMethod
                    canDeliveryToHome={canDeliveryToHome}
                    onSelect={(category) => onSelectCateogry(category.title)}
                />
            </DeliveryPageContainer>
        );
    }

    if (!checkoutStorage.deliveryMethod || checkoutState === 'deliveryMethod') {
        const selectedCategory = checkoutStorage.category;
        if (selectedCategory === 'Livraison à domicile') {
            return (
                <DeliveryPageContainer title="Livraison à domicile">
                    <Text style={styles.sectionTitle}>Adresse de livraison</Text>
                    <AdressForm
                        onSubmit={(data, dayChosen) => {
                            setSelectedMethod(
                                {
                                    // name: "Livraison à domicile",
                                    basePrice: 3,
                                    additionalInfo: data.comment,
                                    location: {
                                        postalCode: data.postalCode,
                                        address: data.address,
                                        city: data.city,
                                        // phone: null,
                                    },
                                } as DeliveryMethod,
                                dayChosen,
                            );
                        }}
                        deliveryDays={checkoutStorage.postalCode.deliveryDays}
                    />
                </DeliveryPageContainer>
            );
        }

        const category = deliveryMethods.categories.find((cat) => cat.name === selectedCategory);
        const methods = category?.methods || [];

        const postalCodeSelected = checkoutStorage.postalCode.postalCode;
        const relaysMatchingPostalCode = methods.filter((method) => {
            return method.location?.postalCode === postalCodeSelected;
        });
        const relaysNotMatchingPostalCode = methods.filter((method) => {
            return method.location?.postalCode !== postalCodeSelected;
        });
        const hasRelaysMatchingPostalCode = relaysMatchingPostalCode.length > 0;

        return (
            <DeliveryPageContainer title={selectedCategory}>
                <SelectedPostalCode
                    postalCode={checkoutStorage.postalCode}
                    onUpdate={() => updateCheckoutState('postalCode')}
                />
                {hasRelaysMatchingPostalCode && <Text style={styles.sectionTitle}>Point relais proches de vous</Text>}
                {relaysMatchingPostalCode.map((method) => (
                    <DeliveryMethodItem
                        key={method.id}
                        method={method}
                        onSelect={(dayChosen) => setSelectedMethod(method, dayChosen)}
                    />
                ))}
                {hasRelaysMatchingPostalCode && (
                    <Text style={styles.sectionTitle}>Autres points relais disponibles</Text>
                )}
                {relaysNotMatchingPostalCode.map((method) => (
                    <DeliveryMethodItem
                        key={method.id}
                        method={method}
                        onSelect={(dayChosen) => setSelectedMethod(method, dayChosen)}
                    />
                ))}
            </DeliveryPageContainer>
        );
    }

    if (!checkoutStorage.contact || checkoutState === 'contact') {
        return (
            <DeliveryPageContainer title="Contact">
                <Text style={styles.sectionSubtitle}>
                    Afin de créer vos factures et de suivre vos commandes, nous avons besoin de vos informations de
                    contact.
                </Text>
                <ContactForm
                    onSubmit={(data) => {
                        setContactData(data);
                    }}
                />
            </DeliveryPageContainer>
        );
    }

    return (
        <SummaryPage
            category={checkoutStorage.category}
            deliveryMethod={checkoutStorage.deliveryMethod}
            contactData={checkoutStorage.contact}
            dayChosen={checkoutStorage.dayChosen || ''}
        />
    );
};

export const styles = StyleSheet.create({
    sectionTitle: {
        fontFamily: 'open',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        maxWidth: 300,
        textAlign: 'center',
    },
    postalCodeContainer: {
        marginBottom: 20,
    },
    postalCodeLabel: {
        color: '#666',
    },
    postalCodeLink: {
        color: '#0066CC',
        textDecorationLine: 'underline',
    },
    deliveryMethodContainer: {
        marginBottom: 20,
    },
    summaryLabel: {
        color: '#666',
    },
    updateLink: {
        color: '#0066CC',
        textDecorationLine: 'underline',
    },
});

const SelectedPostalCode = ({ postalCode, onUpdate }: { postalCode: PostalCodeItem; onUpdate: () => void }) => {
    return (
        <Text style={styles.postalCodeContainer}>
            <Text style={styles.postalCodeLabel}>
                Code postal sélectionné{' '}
                <Text
                    onPress={onUpdate}
                    style={styles.postalCodeLink}
                >
                    (modifier)
                </Text>
                :{' '}
            </Text>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
                <PostalCodeItem item={postalCode} />
            </View>
        </Text>
    );
};
