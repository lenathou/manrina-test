import { DeliveryDayWithTime } from './PostalCodeSelector';

const DAYS_MAP = {
    Dimanche: 0,
    Lundi: 1,
    Mardi: 2,
    Mercredi: 3,
    Jeudi: 4,
    Vendredi: 5,
    Samedi: 6,
};

export const onlyShowDeliveryDaysAtLeastTwoDaysLaterAndNothingOnThursday = (
    deliveryDays: DeliveryDayWithTime[],
    currentDay: number,
) => {
    if (currentDay === 4) {
        return [];
    }
    return onlyShowDeliveryDaysAtLeastTwoDaysLater(deliveryDays, currentDay);
};

export const onlyShowDeliveryDaysAtLeastTwoDaysLater = (deliveryDays: DeliveryDayWithTime[], currentDay: number) => {
    return deliveryDays.filter((deliveryDay) => {
        const deliveryDayNumber = DAYS_MAP[deliveryDay.day];

        // Calculate the difference considering the week cycle (0-6)
        let dayDifference = deliveryDayNumber - currentDay;

        // If the difference is negative, it means we're crossing to the next week
        if (dayDifference < 0) {
            dayDifference += 7;
        }

        // Only show days that are at least 2 days later
        return dayDifference > 2;
    });
};

export const onlyShowDeliveryDaysAtLeastTwoDaysLaterFromDayAsText = (
    deliveryDays: DeliveryDayWithTime[],
    dayAsText: keyof typeof DAYS_MAP,
) => {
    const currentDay = DAYS_MAP[dayAsText];
    return onlyShowDeliveryDaysAtLeastTwoDaysLater(deliveryDays, currentDay);
};
