// Time slot interface
interface OpeningHours {
    start: string;
    end: string;
}

// Location details
interface Location {
    address: string;
    city: string;
    postalCode: string;
    phone: string | null;
    name: string;
}

// Storage capabilities
interface Capabilities {
    fresh: boolean;
    refrigerated: boolean;
    frozen: boolean;
}

// Schedule information
interface Schedule {
    deliveryDay: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    openingHours: OpeningHours[];
    weekOpeningHours?: string[][];
}

// Individual delivery method
export interface DeliveryMethod {
    id: string;
    name: string;
    location: Location;
    schedule?: Schedule;
    capabilities?: Capabilities;
    basePrice: number;
    freeShippingThreshold?: number;
    availableAreas?: string[];
    additionalInfo?: string;
    restrictions?: string | null;
}

// Category containing delivery methods
interface DeliveryCategory {
    id: string;
    name: string;
    methods: DeliveryMethod[];
}

// Root interface
export interface DeliveryMethodsData {
    categories: DeliveryCategory[];
}
