import { parseISO, isAfter, startOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { fr } from 'date-fns/locale';

// Fuseau horaire de la Martinique
const MARTINIQUE_TIMEZONE = 'America/Martinique';

/**
 * Convertit une date/heure locale de Martinique vers UTC
 * @param dateString - Date au format string (YYYY-MM-DD)
 * @param timeString - Heure au format string (HH:mm)
 * @returns Date UTC
 */
export const convertMartiniqueToUTC = (dateString: string, timeString: string = '00:00'): Date => {
  if (!dateString) {
    throw new Error('Date string is required');
  }
  
  // Créer une date locale en Martinique
  const localDateTime = `${dateString}T${timeString}:00`;
  const martiniqueDatetime = parseISO(localDateTime);
  
  // Convertir vers UTC en tenant compte du fuseau horaire de la Martinique
  return fromZonedTime(martiniqueDatetime, MARTINIQUE_TIMEZONE);
};

/**
 * Convertit une date UTC vers l'heure locale de Martinique
 * @param utcDate - Date UTC
 * @returns Date en heure locale de Martinique
 */
export const convertUTCToMartinique = (utcDate: Date): Date => {
  if (!utcDate) {
    throw new Error('UTC date is required');
  }
  
  return toZonedTime(utcDate, MARTINIQUE_TIMEZONE);
};

/**
 * Formate une date UTC en string localisé pour la Martinique
 * @param date - Date UTC ou string
 * @param formatString - Format de sortie (optionnel)
 * @returns String formaté en français
 */
export const convertUTCToLocaleString = (date: string | Date | null, formatString: string = 'PPPP à HH:mm'): string => {
  if (!date) return '';
  
  const utcDate = typeof date === 'string' ? parseISO(date) : date;
  
  return formatInTimeZone(utcDate, MARTINIQUE_TIMEZONE, formatString, { locale: fr });
};

/**
 * Formate une date en string simple (YYYY-MM-DD) en heure locale de Martinique
 * @param date - Date UTC ou string
 * @returns String au format YYYY-MM-DD
 */
export const formatDateForInput = (date: string | Date | null): string => {
  if (!date) return '';
  
  const utcDate = typeof date === 'string' ? parseISO(date) : date;
  
  return formatInTimeZone(utcDate, MARTINIQUE_TIMEZONE, 'yyyy-MM-dd');
};

/**
 * Formate une heure en string simple (HH:mm) en heure locale de Martinique
 * @param date - Date UTC ou string
 * @returns String au format HH:mm
 */
export const formatTimeForInput = (date: string | Date | null): string => {
  if (!date) return '';
  
  const utcDate = typeof date === 'string' ? parseISO(date) : date;
  
  return formatInTimeZone(utcDate, MARTINIQUE_TIMEZONE, 'HH:mm');
};

/**
 * Vérifie si une date est dans le passé (en heure locale de Martinique)
 * @param dateString - Date au format string (YYYY-MM-DD)
 * @returns true si la date est dans le passé
 */
export const isDateInPast = (dateString: string): boolean => {
  if (!dateString) return false;
  
  // Obtenir la date actuelle en heure locale de Martinique
  const nowInMartinique = toZonedTime(new Date(), MARTINIQUE_TIMEZONE);
  const todayStart = startOfDay(nowInMartinique);
  
  // Convertir la date donnée en heure locale de Martinique
  const inputDate = parseISO(`${dateString}T00:00:00`);
  const inputDateInMartinique = toZonedTime(inputDate, MARTINIQUE_TIMEZONE);
  const inputDateStart = startOfDay(inputDateInMartinique);
  
  return isAfter(todayStart, inputDateStart);
};

/**
 * Obtient la date actuelle au format YYYY-MM-DD en heure locale de Martinique
 * @returns String au format YYYY-MM-DD
 */
export const getCurrentDateInMartinique = (): string => {
  return formatInTimeZone(new Date(), MARTINIQUE_TIMEZONE, 'yyyy-MM-dd');
};

/**
 * Obtient l'heure actuelle au format HH:mm en heure locale de Martinique
 * @returns String au format HH:mm
 */
export const getCurrentTimeInMartinique = (): string => {
  return formatInTimeZone(new Date(), MARTINIQUE_TIMEZONE, 'HH:mm');
};

/**
 * Formate une date en français avec le format long (jour, date mois année)
 * @param date - Date UTC ou string
 * @returns String formaté en français
 */
export const formatDateLong = (date: string | Date): string => {
  if (!date) return '';
  
  const utcDate = typeof date === 'string' ? parseISO(date) : date;
  
  return formatInTimeZone(utcDate, MARTINIQUE_TIMEZONE, 'EEEE d MMMM yyyy', { locale: fr });
};

/**
 * Formate une date et heure en français avec le format court
 * @param date - Date UTC ou string
 * @returns String formaté en français
 */
export const formatDateTimeShort = (date: string | Date | null): string => {
  if (!date) return 'Date inconnue';
  
  const utcDate = typeof date === 'string' ? parseISO(date) : date;
  
  return formatInTimeZone(utcDate, MARTINIQUE_TIMEZONE, 'dd/MM/yyyy HH:mm', { locale: fr });
};

/**
 * Formate une heure en français
 * @param date - Date UTC ou string
 * @returns String formaté en français
 */
export const formatTimeOnly = (date: string | Date): string => {
  if (!date) return '';
  
  const utcDate = typeof date === 'string' ? parseISO(date) : date;
  
  return formatInTimeZone(utcDate, MARTINIQUE_TIMEZONE, 'HH:mm');
};
