import { describe, expect, it } from '@jest/globals';
import { onlyShowDeliveryDaysAtLeastTwoDaysLaterFromDayAsText } from './onlyShowDeliveryDaysAtLeastTwoDaysLater';

describe('[onlyShowDeliveryDaysAtLeastTwoDaysLater]', () => {
    it('should return the delivery days at least two days later', () => {
        const deliveryDays = onlyShowDeliveryDaysAtLeastTwoDaysLaterFromDayAsText(
            [{ day: 'Lundi', time: '10:00' }],
            'Lundi',
        );
        expect(deliveryDays).toEqual([]);
    });

    it('should return the delivery days at least two days later', () => {
        const deliveryDays = onlyShowDeliveryDaysAtLeastTwoDaysLaterFromDayAsText(
            [
                { day: 'Lundi', time: '10:00' },
                { day: 'Mardi', time: '10:00' },
                { day: 'Mercredi', time: '10:00' },
                { day: 'Jeudi', time: '10:00' },
                { day: 'Vendredi', time: '10:00' },
                { day: 'Samedi', time: '10:00' },
                { day: 'Dimanche', time: '10:00' },
            ],
            'Lundi',
        );
        expect(deliveryDays).toEqual([
            { day: 'Jeudi', time: '10:00' },
            { day: 'Vendredi', time: '10:00' },
            { day: 'Samedi', time: '10:00' },
            { day: 'Dimanche', time: '10:00' },
        ]);
    });

    it('should return the delivery days at least two days later from Thursday', () => {
        const deliveryDays = onlyShowDeliveryDaysAtLeastTwoDaysLaterFromDayAsText(
            [
                { day: 'Lundi', time: '10:00' },
                { day: 'Mardi', time: '10:00' },
                { day: 'Mercredi', time: '10:00' },
                { day: 'Jeudi', time: '10:00' },
                { day: 'Vendredi', time: '10:00' },
                { day: 'Samedi', time: '10:00' },
                { day: 'Dimanche', time: '10:00' },
            ],
            'Jeudi',
        );
        expect(deliveryDays).toEqual([
            { day: 'Lundi', time: '10:00' },
            { day: 'Mardi', time: '10:00' },
            { day: 'Mercredi', time: '10:00' },
            { day: 'Dimanche', time: '10:00' },
        ]);
    });

    it('should return the delivery days at least two days later from Dimanche', () => {
        const deliveryDays = onlyShowDeliveryDaysAtLeastTwoDaysLaterFromDayAsText(
            [
                { day: 'Lundi', time: '10:00' },
                { day: 'Mardi', time: '10:00' },
                { day: 'Mercredi', time: '10:00' },
                { day: 'Jeudi', time: '10:00' },
                { day: 'Vendredi', time: '10:00' },
                { day: 'Samedi', time: '10:00' },
                { day: 'Dimanche', time: '10:00' },
            ],
            'Dimanche',
        );
        expect(deliveryDays).toEqual([
            { day: 'Mercredi', time: '10:00' },
            { day: 'Jeudi', time: '10:00' },
            { day: 'Vendredi', time: '10:00' },
            { day: 'Samedi', time: '10:00' },
        ]);
    });
});
